"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Icon } from "@/components/icon";

// M3 snackbar. Inline styles because sonner's CSS is unlayered and would win over Tailwind utilities.
const toasterStyle = {
  fontFamily: "inherit",
  zIndex: "var(--z-toast)",
  "--normal-bg": "var(--m3-inverse-surface)",
  "--normal-text": "var(--m3-inverse-on-surface)",
  "--normal-border": "var(--m3-inverse-surface)",
  "--border-radius": "var(--radius-xs)",
} as CSSProperties;

const toastStyle: CSSProperties = {
  boxShadow: "var(--shadow-elevation-3)",
  // M3 body-medium
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  letterSpacing: "0.015625rem",
};

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-center"
      mobileOffset={{ bottom: "calc(var(--spacing-nav-bar) + 1rem)" }}
      // Roles that keep their contrast on inverse-surface
      icons={{
        success: <Icon name="check_circle" size={20} className="text-inverse-primary" />,
        error: <Icon name="error" size={20} className="text-error-container" />,
      }}
      style={toasterStyle}
      toastOptions={{ style: toastStyle }}
      {...props}
    />
  );
}
