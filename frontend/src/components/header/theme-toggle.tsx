"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { ThemeToggleButton } from "../theme-toggle/theme-toggle";
import { useThemeTransition } from "@/hooks/use-theme-transition";

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const { startTransition } = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    startTransition(() => {
      setTheme(newTheme);
    });
  }, [theme, setTheme, startTransition]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeToggleButton
      theme={theme === "dark" ? "dark" : "light"}
      onClick={handleThemeToggle}
      variant="circle-blur"
      start="top-right"
    />
  );
};

export default ThemeToggle;
