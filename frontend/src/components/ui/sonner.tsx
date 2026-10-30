"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Colours come from the site tokens in globals.css, so toasts follow the light/dark class.
// Inline styles because sonner's own CSS is unlayered and would win over Tailwind utilities.
const toasterStyle = {
  fontFamily: "inherit",
  zIndex: "var(--z-toast)",
  "--normal-bg": "var(--card)",
  "--normal-text": "var(--card-foreground)",
  "--normal-border": "var(--border)",
  "--border-radius": "var(--radius)",
} as CSSProperties;

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      icons={{
        success: <LuCircleCheck className="text-primary size-4" />,
        error: <LuCircleAlert className="size-4 text-red-500" />,
      }}
      style={toasterStyle}
      {...props}
    />
  );
}
