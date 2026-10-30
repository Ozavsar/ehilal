import { useCallback } from "react";
import { flushSync } from "react-dom";

export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      updateFn();
      return;
    }
    // flushSync commits the theme change inside the callback, so the view transition captures
    // the new state instead of racing React's scheduler
    const update = () => flushSync(updateFn);
    try {
      // The "theme" type keeps the page transitions' navigation anchor (app/globals.css) out of
      // the circular reveal, which has to cover the whole page
      document.startViewTransition({ update, types: ["theme"] });
    } catch {
      // Browsers from before view transition types only take the callback
      document.startViewTransition(update);
    }
  }, []);

  return { startTransition };
};
