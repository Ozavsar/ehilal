"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunMoon } from "lucide-react";
import { Button } from "../ui/button";

export default function ThemeSwitchButton() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      aria-label="Toggle Dark Mode"
      type="button"
      variant="circle"
      className="fixed right-2 top-2 z-10 sm:right-8 sm:top-8"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunMoon />
    </Button>
  );
}
