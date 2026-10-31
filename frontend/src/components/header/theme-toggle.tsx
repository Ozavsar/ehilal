"use client";

import type { MouseEvent } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { useThemeTransition } from "@/hooks/use-theme-transition";
import { cn } from "@/lib/utils";

const REVEAL_STYLE_ID = "theme-reveal";
// Only the latest toggle's reveal removes the style
let latestReveal = 0;

// Past the farthest corner, so the slowing edge doesn't hold a corner in the old theme
const REVEAL_OVERSHOOT = 1.1;

// Circular reveal of the new theme out of the button (inert when useThemeTransition skips it)
function setRevealStyle(x: number, y: number) {
  const radius =
    REVEAL_OVERSHOOT * Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const style =
    document.getElementById(REVEAL_STYLE_ID) ??
    document.head.appendChild(
      Object.assign(document.createElement("style"), { id: REVEAL_STYLE_ID }),
    );
  style.textContent = `
    ::view-transition-old(root) { animation: none; }
    ::view-transition-new(root) {
      animation: theme-reveal var(--duration-long2) var(--ease-emphasized);
    }
    @keyframes theme-reveal {
      from { clip-path: circle(0px at ${x}px ${y}px); filter: blur(4px); }
      to { clip-path: circle(${radius}px at ${x}px ${y}px); filter: blur(0); }
    }`;
  return style;
}

/**
 * Light/dark theme icon button. The icon and the label follow the `dark` class through CSS, so
 * the server HTML is right without a mount check.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const style = setRevealStyle(box.left + box.width / 2, box.top + box.height / 2);
    const reveal = ++latestReveal;
    // The applied theme, not next-themes' `theme`, which can be "system"
    const isDark = document.documentElement.classList.contains("dark");
    const transition = startTransition(() => setTheme(isDark ? "light" : "dark"));
    // Removed only once the reveal is over, or the old theme comes back mid-reveal
    const cleanUp = () => {
      if (reveal === latestReveal) style.remove();
    };
    if (transition) transition.finished.then(cleanUp, cleanUp);
    else cleanUp();
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
