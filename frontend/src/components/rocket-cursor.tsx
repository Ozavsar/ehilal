"use client";

import { useEffect, useRef } from "react";
import { RocketGlyph } from "@/components/header/rocket-dock";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROCKET_QUERY, rocketDock, useRocketPhase } from "@/hooks/use-rocket-dock";
import { cn } from "@/lib/utils";

const MOUSE_MARGIN = 5;
// Fumes come from a fixed pool reused round-robin: one every 50ms, each fading out over 1s, so
// about 20 are visible at once and the DOM never changes while the rocket flies.
const FUME_POOL_SIZE = 20;
const FUME_INTERVAL_MS = 50;
const FUME_LIFETIME_MS = 1000;
// Each puff is a 30px circle scaled down to its random 10-30px size. The old per-puff
// `box-shadow: 0 0 100px #ffffff20` is gone: a blur that wide spreads a puff this small to ~1%
// alpha (measured at most 2/255 brighter on the dark theme), but it was expensive to paint.
const FUME_SIZE = 30;
// The puffs of a touchdown or an ignition, spreading sideways over the pad
const BURST_LIFETIME_MS = 700;
// Following, the rocket turns toward the pointer with this time constant instead of snapping
// (about 40% of the way per 60 Hz frame)
const TURN_MS = 40;
// After a take-off the follow loop eases its speed and turn rate in over this long, so the rocket
// leaves the top of its climb without a jerk
const HANDOVER_MS = 700;
// The engine glow: a fixed (theme-independent) warm palette role, as a flame is the same colour on
// any background; it follows palette changes through the variable
const GLOW_SHADOW =
  "0 0 100px 20px color-mix(in oklab, var(--m3-tertiary-fixed-dim) 80%, transparent)";

type Ease = (progress: number) => number;

/**
 * One step of a landing or take-off: the pose to reach by `end` ms, relative to the parking spot
 * (dx/dy in px, angle in deg, scale), with the M3 easing of the move. `engine` keeps the trail of
 * fumes going during the step.
 */
type Step = {
  end: number;
  dx: number;
  dy: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  ease: Ease;
  engine: boolean;
  onEnter?: () => void;
};

function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const curve = (p1: number, p2: number, t: number) =>
    3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
  return (x) => {
    // x(t) rises monotonically for CSS easings, so bisection always finds t
    let low = 0;
    let high = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      if (curve(x1, x2, mid) < x) low = mid;
      else high = mid;
    }
    return curve(y1, y2, (low + high) / 2);
  };
}

/**
 * An M3 easing token of globals.css as a function, so JS motion matches CSS. Pass the full
 * utility name (`"ease-standard"`): Tailwind only emits the `--ease-*` variables it sees used.
 */
function readEasing(styles: CSSStyleDeclaration, utility: string): Ease {
  const match = /cubic-bezier\(([^)]*)\)/.exec(styles.getPropertyValue(`--${utility}`));
  const [x1, y1, x2, y2] = (match?.[1] ?? "").split(",").map(Number);
  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
    return (progress) => progress;
  }
  if ([x1, y1, x2, y2].some(Number.isNaN)) return (progress) => progress;
  return cubicBezier(x1, y1, x2, y2);
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
// Degrees folded into -180..180, so a turn takes the short way round
const wrapAngle = (degrees: number) => degrees - 360 * Math.round(degrees / 360);

export default function RocketCursor() {
  const enabled = useMediaQuery(ROCKET_QUERY);
  // Parked, the dock draws the rocket (components/header/rocket-dock.tsx); this one hides in the
  // same render, so the hand-over at the end of a landing or the start of a take-off is seamless
  const phase = useRocketPhase();
  const rocketRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const fumeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const rocket = rocketRef.current;
    const glow = glowRef.current;
    const heart = heartRef.current;
    const fumes = fumeRefs.current.filter((fume): fume is HTMLSpanElement => fume !== null);

    if (!rocket || !glow || !heart) return;

    const styles = getComputedStyle(document.documentElement);
    const standard = readEasing(styles, "ease-standard");
    const standardDecelerate = readEasing(styles, "ease-standard-decelerate");
    const emphasized = readEasing(styles, "ease-emphasized");

    const rocketBoundingRect = rocket.getBoundingClientRect();
    const rocketWidth = rocketBoundingRect.width;
    const rocketHeight = rocketBoundingRect.height;
    let rocketX = rocketBoundingRect.left;
    let rocketY = rocketBoundingRect.top;
    let angle = 0;
    let scaleX = 1;
    let scaleY = 1;
    let mouseX = 0;
    let mouseY = 0;
    let hasMouse = false;
    let oldTimeStamp = 1;
    let frameId = 0;
    let fumeClock = 0;
    let nextFume = 0;
    let lastTransform = "";
    let heartVisible = false;
    // 0..1 while the follow loop eases in after a take-off, 1 otherwise
    let handover = 1;
    const fumeAnimations: (Animation | undefined)[] = [];

    // follow: chases the pointer. timeline: lands or takes off. parked: hidden, no frames at all.
    let mode: "follow" | "timeline" | "parked" = "follow";
    let steps: Step[] = [];
    let stepIndex = -1;
    let timelineStart = 0;
    let onTimelineEnd = () => {};
    // The pose a timeline started from (its first step moves away from it)
    let fromX = 0;
    let fromY = 0;
    let fromAngle = 0;
    let fromScaleX = 1;
    let fromScaleY = 1;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;
    };

    const setHeart = (visible: boolean) => {
      if (visible === heartVisible) return;
      heart.style.opacity = visible ? "1" : "0";
      heartVisible = visible;
    };

    // Squash and stretch keep the base in place (the transform origin is the box centre)
    const render = () => {
      const y = rocketY + ((1 - scaleY) * rocketHeight) / 2;
      const transform = `translate(${rocketX}px, ${y}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
      if (transform !== lastTransform) {
        rocket.style.transform = transform;
        lastTransform = transform;
      }
    };

    // One puff from the pool: centred on x/y, drifting by driftX/driftY while it fades
    const puff = (
      x: number,
      y: number,
      size: number,
      driftX: number,
      driftY: number,
      duration: number,
    ) => {
      const index = nextFume;
      const fume = fumes[index];
      nextFume = (nextFume + 1) % fumes.length;
      if (!fume) return;

      const left = x - FUME_SIZE / 2;
      const top = y - FUME_SIZE / 2;
      const scale = `scale(${size / FUME_SIZE})`;

      fumeAnimations[index]?.cancel();
      // Opacity and transform only, so the browser runs it on the compositor
      fumeAnimations[index] = fume.animate(
        [
          { opacity: 0.6, transform: `translate(${left}px, ${top}px) ${scale}` },
          { opacity: 0, transform: `translate(${left + driftX}px, ${top + driftY}px) ${scale}` },
        ],
        { duration, easing: "ease-in" },
      );
    };

    // Puff at the nozzle (bottom centre of the rotated rocket box), drifting 10px further back
    const spawnFume = () => {
      const size = Math.random() * 20 + 10;
      const radians = (angle * Math.PI) / 180;
      const sin = Math.sin(radians);
      const cos = Math.cos(radians);
      const back = rocketHeight / 2 - size / 2;
      const x = rocketX + (Math.random() * 8 - 4) + rocketWidth / 2 - back * sin;
      const y = rocketY + rocketHeight / 2 + back * cos;
      puff(x, y, size, -10 * sin, 10 * cos, FUME_LIFETIME_MS);
    };

    // Upright on the pad: puffs roll out to both sides of the nozzle
    const burst = (count: number, spread: number) => {
      const x = rocketX + rocketWidth / 2;
      const y = rocketY + rocketHeight - 6;
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const size = Math.random() * 10 + 8;
        const drift = side * spread * (0.5 + Math.random() * 0.5);
        puff(x + side * Math.random() * 6, y, size, drift, -Math.random() * 6, BURST_LIFETIME_MS);
      }
    };

    const runEngine = (elapsed: number) => {
      fumeClock += elapsed;
      if (fumeClock >= FUME_INTERVAL_MS) {
        fumeClock %= FUME_INTERVAL_MS;
        spawnFume();
      }
    };

    const follow = (elapsed: number) => {
      const fps = Math.max(1, Math.min(Math.round(1000 / elapsed), 200));

      // Each frame covers 1/fps of the distance, unless the rocket already sits on the pointer
      let xSpeed = 0;
      let ySpeed = 0;
      const onPointer =
        rocketY + rocketHeight > mouseY - MOUSE_MARGIN &&
        rocketX + rocketWidth > mouseX - MOUSE_MARGIN &&
        rocketY < mouseY + MOUSE_MARGIN &&
        rocketX < mouseX + MOUSE_MARGIN;

      let pace = 1;
      if (handover < 1) {
        handover = Math.min(1, handover + elapsed / HANDOVER_MS);
        pace = standard(handover);
      }

      if (!onPointer) {
        xSpeed = Math.abs(rocketX - mouseX) / fps;
        ySpeed = Math.abs(rocketY - mouseY) / fps;
        rocketX += (rocketX > mouseX ? -xSpeed : xSpeed) * pace;
        rocketY += (rocketY > mouseY ? -ySpeed : ySpeed) * pace;
      }

      const target =
        Math.atan2(mouseX - (rocketX + rocketWidth / 2), -(mouseY - (rocketY + rocketHeight / 2))) *
        (180 / Math.PI);
      const turn = Math.min(1, elapsed / TURN_MS) * pace;
      angle = wrapAngle(angle + wrapAngle(target - angle) * turn);

      runEngine(elapsed);
      setHeart(xSpeed < 0.1 && ySpeed < 0.1 && hasMouse);
    };

    const advanceTimeline = (timeStamp: number, elapsed: number) => {
      const pad = rocketDock.getPad();
      const time = Math.max(0, timeStamp - timelineStart);
      const last = steps[steps.length - 1];
      if (!pad || !last) {
        onTimelineEnd();
        return;
      }

      while (stepIndex < steps.length - 1 && time >= (steps[stepIndex]?.end ?? 0)) {
        stepIndex += 1;
        steps[stepIndex]?.onEnter?.();
      }
      const step = steps[stepIndex];
      if (!step) return;

      // Measured every frame: the pad leans toward the pointer while the rocket comes in
      const box = pad.getBoundingClientRect();
      const spotX = box.left + box.width / 2 - rocketWidth / 2;
      const spotY = box.top + box.height / 2 - rocketHeight / 2;

      const previous = steps[stepIndex - 1];
      const begin = previous?.end ?? 0;
      const progress = step.ease(clamp01((time - begin) / (step.end - begin)));
      const startX = previous ? spotX + previous.dx : fromX;
      const startY = previous ? spotY + previous.dy : fromY;
      const startAngle = previous ? previous.angle : fromAngle;
      const startScaleX = previous ? previous.scaleX : fromScaleX;
      const startScaleY = previous ? previous.scaleY : fromScaleY;
      rocketX = startX + (spotX + step.dx - startX) * progress;
      rocketY = startY + (spotY + step.dy - startY) * progress;
      angle = startAngle + (step.angle - startAngle) * progress;
      scaleX = startScaleX + (step.scaleX - startScaleX) * progress;
      scaleY = startScaleY + (step.scaleY - startScaleY) * progress;

      if (step.engine) runEngine(elapsed);
      if (step === last && time >= last.end) onTimelineEnd();
    };

    const loop = (timeStamp: number) => {
      const elapsed = Math.max(0, timeStamp - oldTimeStamp);
      oldTimeStamp = timeStamp;

      if (mode === "follow") follow(elapsed);
      else if (mode === "timeline") advanceTimeline(timeStamp, elapsed);

      // Parked: the loop stops until the next take-off
      if (mode === "parked") {
        frameId = 0;
        return;
      }
      render();
      frameId = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (frameId !== 0) return;
      oldTimeStamp = performance.now();
      frameId = window.requestAnimationFrame(loop);
    };

    const runTimeline = (next: Step[], done: () => void) => {
      steps = next;
      stepIndex = -1;
      timelineStart = performance.now();
      onTimelineEnd = done;
      fromX = rocketX;
      fromY = rocketY;
      fromAngle = wrapAngle(angle);
      fromScaleX = scaleX;
      fromScaleY = scaleY;
      fumeClock = 0;
      setHeart(false);
      mode = "timeline";
      startLoop();
    };

    // Engine off: no glow, no fumes, no frames; the dock shows the rocket from now on
    const park = () => {
      mode = "parked";
      glow.style.opacity = "0";
      setHeart(false);
    };

    // Back on the pad's centre, upright, to take off from where the dock drew it
    const placeOnPad = () => {
      const box = rocketDock.getPad()?.getBoundingClientRect();
      if (box) {
        rocketX = box.left + box.width / 2 - rocketWidth / 2;
        rocketY = box.top + box.height / 2 - rocketHeight / 2;
      }
      angle = 0;
      scaleX = 1;
      scaleY = 1;
      render();
    };

    const touchdown = () => {
      glow.style.opacity = "0";
      burst(6, 18);
    };
    const ignite = () => {
      glow.style.opacity = "";
    };

    // Glides in above the pad while turning upright, eases down onto it with the engine braking,
    // then a soft touchdown: a slight squash and a small hop (about 2 s)
    const landing: Step[] = [
      { end: 950, dx: 0, dy: -28, angle: 0, scaleX: 1, scaleY: 1, ease: emphasized, engine: true },
      { end: 1600, dx: 0, dy: 0, angle: 0, scaleX: 1, scaleY: 1, ease: standard, engine: true },
      {
        end: 1720,
        dx: 0,
        dy: 0,
        angle: 0,
        scaleX: 1.04,
        scaleY: 0.95,
        ease: standardDecelerate,
        engine: false,
        onEnter: touchdown,
      },
      {
        end: 1840,
        dx: 0,
        dy: -1.5,
        angle: 0,
        scaleX: 0.99,
        scaleY: 1.015,
        ease: standard,
        engine: false,
      },
      { end: 1960, dx: 0, dy: 0, angle: 0, scaleX: 1, scaleY: 1, ease: standard, engine: false },
    ];
    // Ignites and crouches, then lifts off gradually and slows at the top of its climb, where the
    // follow loop eases in (about 1.25 s)
    const takeoff: Step[] = [
      {
        end: 350,
        dx: 0,
        dy: 0,
        angle: 0,
        scaleX: 1.04,
        scaleY: 0.95,
        ease: standard,
        engine: true,
        onEnter: ignite,
      },
      {
        end: 1250,
        dx: 0,
        dy: -60,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        ease: emphasized,
        engine: true,
        onEnter: () => burst(5, 16),
      },
    ];

    const land = () =>
      runTimeline(landing, () => {
        park();
        rocketDock.finish();
      });
    const launch = () => {
      if (mode === "parked") placeOnPad();
      runTimeline(takeoff, () => {
        mode = "follow";
        handover = 0;
        rocketDock.finish();
      });
    };

    // Mid-flight requests turn the rocket around from wherever it is
    const handlePhase = () => {
      const current = rocketDock.getPhase();
      if (current === "landing" && mode !== "parked") land();
      else if (current === "launching") launch();
      else if (current === "parked" && mode !== "parked") park();
      else if (current === "flying" && mode === "parked") {
        placeOnPad();
        mode = "follow";
        startLoop();
      }
    };

    const detachCursor = rocketDock.attachCursor();
    const unsubscribe = rocketDock.subscribe(handlePhase);
    document.addEventListener("mousemove", handleMouseMove);
    if (rocketDock.getPhase() === "parked") park();
    else {
      glow.style.opacity = "";
      startLoop();
    }

    // Stop the loop too, otherwise every time the media query flips on another one starts
    return () => {
      window.cancelAnimationFrame(frameId);
      unsubscribe();
      detachCursor();
      document.removeEventListener("mousemove", handleMouseMove);
      fumeAnimations.forEach((animation) => animation?.cancel());
    };
  }, [enabled]);

  if (!enabled) return null;

  // will-change keeps the rocket (and its large glow) on its own layer, so moving it each frame
  // doesn't repaint the page underneath
  return (
    <>
      {Array.from({ length: FUME_POOL_SIZE }, (_, index) => (
        <span
          key={index}
          ref={(fume) => {
            fumeRefs.current[index] = fume;
          }}
          aria-hidden="true"
          className="bg-outline pointer-events-none fixed top-0 left-0 z-(--z-cursor-trail) rounded-full opacity-0"
          style={{ width: FUME_SIZE, height: FUME_SIZE }}
        />
      ))}
      <div
        className={cn(
          "rocket pointer-events-none will-change-transform select-none",
          phase === "parked" && "invisible",
        )}
        ref={rocketRef}
        aria-hidden="true"
      >
        <RocketGlyph />
        {/* The engine's glow: off while parked */}
        <div
          ref={glowRef}
          className="ease-standard absolute top-0 left-1/2 size-0 transition-opacity duration-500"
          style={{ boxShadow: GLOW_SHADOW }}
        />
        <div className="heart" ref={heartRef}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="icon icon-tabler icons-tabler-filled icon-tabler-heart"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              fill="currentColor"
              d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
