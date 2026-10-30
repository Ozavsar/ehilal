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
    document.startViewTransition(() => flushSync(updateFn));
  }, []);

  return { startTransition };
};
