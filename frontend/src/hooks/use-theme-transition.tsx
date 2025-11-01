import { useCallback } from "react";

export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(updateFn);
    } else {
      updateFn();
    }
  }, []);

  return { startTransition };
};
