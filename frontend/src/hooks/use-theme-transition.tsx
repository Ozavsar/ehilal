import { useCallback } from "react";
import { flushSync } from "react-dom";

export const useThemeTransition = () => {
  // Returns the view transition, or undefined when the update ran without one
  const startTransition = useCallback((updateFn: () => void): ViewTransition | undefined => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      updateFn();
      return undefined;
    }
    // flushSync commits the theme change inside the callback, so the view transition captures
    // the new state instead of racing React's scheduler
    const update = () => flushSync(updateFn);
    try {
      // The "theme" type keeps the page transitions' navigation anchor (app/globals.css) out of
      // the circular reveal, which has to cover the whole page
      return document.startViewTransition({ update, types: ["theme"] });
    } catch {
      // Browsers from before view transition types only take the callback
      return document.startViewTransition(update);
    }
  }, []);

  return { startTransition };
};
