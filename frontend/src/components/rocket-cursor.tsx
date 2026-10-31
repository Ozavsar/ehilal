"use client";

import { useEffect, useRef } from "react";
import { RocketGlyph } from "@/components/header/rocket-dock";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ROCKET_QUERY, rocketDock, useRocketPhase } from "@/hooks/use-rocket-dock";
import { cn } from "@/lib/utils";

const MOUSE_MARGIN = 5;
// Fixed pool reused round-robin, so the DOM never changes while the rocket flies
const FUME_POOL_SIZE = 20;
const FUME_INTERVAL_MS = 50;
const FUME_LIFETIME_MS = 1000;
// Base size, scaled down per puff; no box-shadow (expensive to paint, invisible at this size)
const FUME_SIZE = 30;
// Touchdown and ignition puffs
const BURST_LIFETIME_MS = 700;
// Time constant of the turn toward the pointer
const TURN_MS = 40;
// The follow loop eases in over this long after a take-off
const HANDOVER_MS = 700;
// A theme-independent warm role: a flame looks the same on any background
const GLOW_SHADOW =
  "0 0 100px 20px color-mix(in oklab, var(--m3-tertiary-fixed-dim) 80%, transparent)";

type Ease = (progress: number) => number;

/**
 * A landing or take-off step: the pose reached at `end` ms, relative to the parking spot (dx/dy in
 * px, angle in deg). `engine` emits fumes during the step.
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
 * An M3 easing token of globals.css as a function. Pass the full utility name (`"ease-standard"`):
 * Tailwind only emits the `--ease-*` variables it sees used.
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
// Folds into -180..180, so a turn takes the short way round
const wrapAngle = (degrees: number) => degrees - 360 * Math.round(degrees / 360);

export default function RocketCursor() {
  const enabled = useMediaQuery(ROCKET_QUERY);
  // Parked, the dock draws the rocket and this one hides in the same render (seamless hand-over)
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
    // The pose the timeline started from
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

    // A puff at the nozzle (bottom centre of the rotated rocket box)
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

    // Puffs rolling out to both sides of the nozzle, upright on the pad
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

      // Measured every frame: the pad leans toward the pointer
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

    const park = () => {
      mode = "parked";
      glow.style.opacity = "0";
      setHeart(false);
    };

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

    // Glide in above the pad, ease down, then a soft touchdown with a squash and a hop (~2 s)
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
    // Ignite and crouch, then lift off and slow at the top, where the follow loop eases in (~1.25 s)
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

    // Cancel the frame too, or every media query flip starts another loop
    return () => {
      window.cancelAnimationFrame(frameId);
      unsubscribe();
      detachCursor();
      document.removeEventListener("mousemove", handleMouseMove);
      fumeAnimations.forEach((animation) => animation?.cancel());
    };
  }, [enabled]);

  if (!enabled) return null;

  // will-change keeps the rocket and its large glow on their own layer (no repaint per frame)
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
