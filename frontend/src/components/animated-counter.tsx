"use client";

import { useRef } from "react";
import {
  KeyframeOptions,
  animate,
  useInView,
  useIsomorphicLayoutEffect,
} from "framer-motion";

interface AnimatedCounterProps {
  from: number;
  to: number;
  animationOptions?: KeyframeOptions;
}

export default function AnimatedCounter({
  from,
  to,
  animationOptions,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;

    if (!element || !isInView) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion)",
    ).matches;

    if (prefersReducedMotion) {
      element.textContent = String(to);
      return;
    }

    element.textContent = String(from);

    const controls = animate(from, to, {
      duration: 2,
      ease: "easeOut",
      ...animationOptions,
      onUpdate(value) {
        if (element) {
          element.textContent = value.toFixed(0);
        }
      },
    });

    return () => controls.stop();
  }, [isInView, from, to, animationOptions]);

  return <span ref={ref} />;
}
