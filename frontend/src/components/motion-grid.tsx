import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  /** Seconds between two items entering */
  staggerDelay?: number;
  /** Seconds before the first item enters */
  delay?: number;
  className?: string;
}

const toMs = (seconds: number) => `${Math.round(seconds * 1000)}ms`;

// Each item fades/slides in with a @starting-style transition (Tailwind `starting:`), staggered
// through transition-delay. Server component: no client JS, reduced-motion users get no movement.
const itemClassName =
  "transition-[opacity,translate] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] starting:translate-y-5 starting:opacity-0 motion-reduce:transition-none";

export default function MotionGrid({
  children,
  delay = 0,
  staggerDelay = 0.15,
  className,
}: AnimatedGridProps) {
  return (
    <div className={cn(`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3`, className)}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <div
            key={index}
            className={cn("h-full", itemClassName)}
            style={{ transitionDelay: toMs(delay + index * staggerDelay) }}
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
