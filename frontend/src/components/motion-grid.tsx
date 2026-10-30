import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  /** Seconds between two items entering (capped at the M3 stagger step, 50 ms) */
  staggerDelay?: number;
  /** Seconds before the first item enters */
  delay?: number;
  className?: string;
}

const toMs = (seconds: number) => `${Math.round(seconds * 1000)}ms`;

// M3 stagger: at most 50 ms between items, and only the first few are staggered so a long list
// doesn't keep the last cards waiting
const MAX_STAGGER = 0.05;
const MAX_STAGGERED_ITEMS = 6;

// M3 fade entrance: each item fades in (and rises 16px) with a @starting-style transition
// (Tailwind `starting:`), medium4 + emphasized-decelerate, staggered through transition-delay.
// Server component: no client JS. Reduced motion keeps the fade and drops the movement.
// Not while a page view transition runs (components/view-transitions.tsx): that one animates
// the grid already.
const itemClassName =
  "transition-[opacity,translate] duration-400 ease-emphasized-decelerate starting:opacity-0 motion-safe:starting:translate-y-4 [:root:active-view-transition_&]:transition-none";

export default function MotionGrid({
  children,
  delay = 0,
  staggerDelay = MAX_STAGGER,
  className,
}: AnimatedGridProps) {
  const step = Math.min(staggerDelay, MAX_STAGGER);
  return (
    // Columns per window size class: 1 compact, 2 medium, 3 expanded; gaps 16, then 24
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3", className)}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <div
            key={index}
            className={cn("h-full", itemClassName)}
            style={{
              transitionDelay: toMs(delay + Math.min(index, MAX_STAGGERED_ITEMS) * step),
            }}
          >
            {child}
          </div>
        ))
      ) : (
        <div className={cn("grid", itemClassName)} style={{ transitionDelay: toMs(delay) }}>
          {children}
        </div>
      )}
    </div>
  );
}
