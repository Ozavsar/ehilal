"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import { isRocketParked, rocketDock, useRocketPhase } from "@/hooks/use-rocket-dock";
import { cn } from "@/lib/utils";

const ROCKET_PATH =
  "M16 0C16 0 25 4.08 25 21C25 25.98 22.92 32.14 21.8 35H10.2C9.08 32.14 7 25.98 7 21C7 4.08 16 0 16 0ZM20 17C20 14.8 18.2 13 16 13C13.8 13 12 14.8 12 17C12 19.2 13.8 21 16 21C18.2 21 20 19.2 20 17ZM7.38 36.04C6.42 33.58 4.34 27.7 4.04 22.3L1.78 23.8C0.66 24.56 0 25.8 0 27.14V39L7.38 36.04ZM32 39V27.14C32 25.8 31.34 24.56 30.22 23.82L27.96 22.32C27.66 27.7 25.56 33.6 24.62 36.06L32 39Z";

/**
 * The rocket illustration (32×44 viewBox), shared with the rocket cursor: a primary body with a
 * primary-container window, so it follows the theme and the palette. `ghost` draws a faint
 * silhouette instead.
 */
export function RocketGlyph({ className, ghost = false }: { className?: string; ghost?: boolean }) {
  return (
    <svg viewBox="0 0 32 44" aria-hidden="true" className={className}>
      <path d={ROCKET_PATH} className={ghost ? "fill-on-surface-variant/24" : "fill-primary"} />
      {!ghost && <circle cx="16" cy="17" r="4" className="fill-primary-container" />}
    </svg>
  );
}

// Hovering the dock this long parks (or launches) the rocket
const HOLD_MS = 1000;
// The progress ring drains this many times faster than it fills when the pointer leaves early
const DRAIN_RATE = 4;
// Magnetic pull: the pad leans toward the pointer by this share of its offset, at most MAX_LEAN px
const MAGNET = 0.2;
const MAX_LEAN = 6;
const RING_LENGTH = 100;

const clampLean = (offset: number) => Math.max(-MAX_LEAN, Math.min(MAX_LEAN, offset * MAGNET));

/**
 * The rocket's landing pad at the bottom of the navigation rail. Hovering it for a second, or a
 * click/Enter/Space, parks the rocket here (it stops following the pointer) and the same again
 * launches it. Shown only where the rocket cursor runs (ROCKET_QUERY in hooks/use-rocket-dock,
 * written out as Tailwind variants so the server HTML already has the right layout).
 */
export default function RocketDock() {
  const phase = useRocketPhase();
  const padRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const hold = useRef<Animation | null>(null);
  // Centre of the button while a mouse is over it, null otherwise
  const hoverCentre = useRef<{ x: number; y: number } | null>(null);
  // Off after a hold fired, until the pointer leaves: one hover, one toggle
  const armed = useRef(true);

  const lean = (x: number, y: number) => {
    const pad = padRef.current;
    if (pad) pad.style.translate = x || y ? `${x}px ${y}px` : "";
  };

  // The ring shows only while a hold runs (or drains)
  const showRing = (visible: boolean) => {
    ringRef.current?.ownerSVGElement?.toggleAttribute("data-charging", visible);
  };

  const fire = () => {
    hold.current = null;
    armed.current = false;
    showRing(false);
    rocketDock.toggle();
  };

  // The ring's animation is the hold timer: it toggles the rocket when it finishes
  const startHold = () => {
    const ring = ringRef.current;
    if (!ring || !armed.current) return;
    showRing(true);
    const running = hold.current;
    if (running) {
      running.onfinish = fire;
      running.updatePlaybackRate(1);
      return;
    }
    // Linear: the ring reads out the time left, it isn't a transition
    const animation = ring.animate([{ strokeDashoffset: RING_LENGTH }, { strokeDashoffset: 0 }], {
      duration: HOLD_MS,
      easing: "linear",
    });
    animation.onfinish = fire;
    hold.current = animation;
  };

  const releaseHold = () => {
    const animation = hold.current;
    if (!animation) return;
    showRing(false);
    animation.onfinish = () => {
      if (hold.current === animation) hold.current = null;
    };
    animation.updatePlaybackRate(-DRAIN_RATE);
  };

  const onPointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    // A tap clicks anyway; touch has no hover to hold
    if (event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    hoverCentre.current = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    startHold();
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const centre = hoverCentre.current;
    if (centre) lean(clampLean(event.clientX - centre.x), clampLean(event.clientY - centre.y));
  };

  const onPointerLeave = () => {
    hoverCentre.current = null;
    armed.current = true;
    lean(0, 0);
    releaseHold();
  };

  const onClick = () => {
    hold.current?.cancel();
    hold.current = null;
    showRing(false);
    // A click during the hover counts as that hover's toggle
    if (hoverCentre.current) armed.current = false;
    rocketDock.toggle();
  };

  return (
    <div className="hidden shrink-0 justify-center pb-2 pointer-fine:motion-safe:min-[769px]:flex">
      <button
        type="button"
        aria-pressed={isRocketParked(phase)}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        className="group outline-primary relative size-18 cursor-pointer rounded-full focus-visible:outline-3 focus-visible:outline-offset-2"
      >
        <span className="sr-only">Park the rocket</span>
        {/* Leans toward the pointer; the cursor measures it to land on its centre */}
        <span
          ref={(element) => {
            padRef.current = element;
            rocketDock.setPad(element);
            return () => {
              padRef.current = null;
              if (rocketDock.getPad() === element) rocketDock.setPad(null);
            };
          }}
          className="ease-standard absolute inset-0 transition-[translate] duration-300"
        >
          {/* M3 circular progress (track + indicator) around the pad while the hold runs */}
          <svg
            viewBox="0 0 72 72"
            aria-hidden="true"
            className="ease-standard absolute inset-0 -rotate-90 fill-none stroke-4 opacity-0 transition-opacity duration-200 data-charging:opacity-100"
          >
            <circle cx="36" cy="36" r="32" className="stroke-secondary-container" />
            <circle
              ref={ringRef}
              cx="36"
              cy="36"
              r="32"
              pathLength={RING_LENGTH}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH}
              strokeLinecap="round"
              className="stroke-primary"
            />
          </svg>
          <span
            className={cn(
              "ease-standard absolute inset-2 grid place-items-center overflow-hidden rounded-full transition-colors duration-200",
              isRocketParked(phase) ? "bg-secondary-container" : "bg-surface-container-high",
            )}
          >
            {/* State layer */}
            <span
              aria-hidden="true"
              className="ease-standard absolute inset-0 bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-8 group-focus-visible:opacity-12 group-active:opacity-12"
            />
            {/* The parking spot: a ghost of the rocket, covered by the rocket once it's parked */}
            <RocketGlyph ghost className="col-start-1 row-start-1 h-11 w-8" />
            {phase === "parked" && <RocketGlyph className="col-start-1 row-start-1 h-11 w-8" />}
          </span>
        </span>
      </button>
    </div>
  );
}
