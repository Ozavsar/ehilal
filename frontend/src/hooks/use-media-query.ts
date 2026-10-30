import { useCallback, useSyncExternalStore } from "react";

/** Live result of a CSS media query. False on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Live `prefers-reduced-motion: reduce`. False on the server and during hydration. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Swiper's `speed`: its default 300ms slide, 0 (the slide changes at once) under reduced motion */
export function useSlideSpeed(): number {
  return usePrefersReducedMotion() ? 0 : 300;
}
