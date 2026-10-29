"use client";

import React, { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ThemeToggleButton } from "../theme-toggle/theme-toggle";
import { useThemeTransition } from "@/hooks/use-theme-transition";

const noopSubscribe = () => () => {};

const ThemeToggle = () => {
  // `theme` can be "system"; `resolvedTheme` is the theme actually applied
  const { setTheme, resolvedTheme } = useTheme();
  const { startTransition } = useThemeTransition();
  // false on the server and during hydration, true afterwards
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = useCallback(() => {
    startTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  }, [isDark, setTheme, startTransition]);

  // resolvedTheme is undefined until next-themes reads the system preference
  if (!mounted || (resolvedTheme !== "dark" && resolvedTheme !== "light")) {
    return null;
  }

  return (
    <ThemeToggleButton
      theme={isDark ? "dark" : "light"}
      onClick={handleThemeToggle}
      variant="circle-blur"
      start="top-right"
    />
  );
};

export default ThemeToggle;
