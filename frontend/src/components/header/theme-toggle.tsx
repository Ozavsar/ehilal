"use client";

import type { MouseEvent } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { useThemeTransition } from "@/hooks/use-theme-transition";
import { cn } from "@/lib/utils";

const REVEAL_STYLE_ID = "theme-reveal";
let removeRevealStyle: ReturnType<typeof setTimeout> | undefined;

// Circular reveal of the new theme out of the button (View Transitions). useThemeTransition skips
// the transition, so this style does nothing, under reduced motion or without browser support.
function setRevealStyle(x: number, y: number) {
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const style =
    document.getElementById(REVEAL_STYLE_ID) ??
    document.head.appendChild(
      Object.assign(document.createElement("style"), { id: REVEAL_STYLE_ID }),
    );
  style.textContent = `
    ::view-transition-old(root) { animation: none; }
    ::view-transition-new(root) {
      animation: theme-reveal var(--duration-long2) var(--ease-emphasized-decelerate);
    }
    @keyframes theme-reveal {
      from { clip-path: circle(0px at ${x}px ${y}px); filter: blur(4px); }
      to { clip-path: circle(${radius}px at ${x}px ${y}px); filter: blur(0); }
    }`;
  clearTimeout(removeRevealStyle);
  removeRevealStyle = setTimeout(() => style.remove(), 1000);
}

/**
 * M3 standard icon button that switches between the light and dark theme. The icon and the
 * accessible name follow the `dark` class on <html> through CSS, so the server HTML is already
 * right (no mount check, no layout shift); the icon shows the theme the button switches to.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setRevealStyle(box.left + box.width / 2, box.top + box.height / 2);
    // The applied theme, not next-themes' `theme`, which can be "system"
    const isDark = document.documentElement.classList.contains("dark");
    startTransition(() => setTheme(isDark ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "text-on-surface-variant",
        className,
      )}
    >
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
      <Icon name="dark_mode" className="dark:hidden" />
      <Icon name="light_mode" className="hidden dark:inline-block" />
    </button>
  );
}
