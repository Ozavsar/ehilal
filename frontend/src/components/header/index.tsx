import { cn } from "@/lib/utils";
import NavigationLinks from "./navigation-links";
import RocketDock from "./rocket-dock";
import ThemeToggle from "./theme-toggle";

// One box for every window size: an M3 navigation bar at the bottom below 600px (sm) and a
// navigation rail on the left edge from 600px, with the theme toggle at its bottom. The box is the
// stacking context the active indicator slides in. Below 600px the theme toggle sits in a slim
// top row instead: in the page flow (the first block in <body>), so it scrolls away and never
// covers a title, which fixed in the corner it would.
// Entrance: the bar/rail slides in from its edge with a @starting-style transition (Tailwind
// `starting:`), visible without JS and still for reduced-motion users.
// data-nav-anchor: page view transitions leave the bar/rail in place (app/globals.css), so only
// the content animates and the active indicator keeps its own slide.
export default function Header() {
  return (
    <header>
      {/* Every page's <main> has id="main" */}
      <a
        href="#main"
        className="bg-primary text-on-primary type-label-large sr-only z-(--z-modal) rounded-full px-6 py-2.5 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-3 focus-visible:outline-offset-2"
      >
        Skip to content
      </a>
      <div
        data-nav-anchor
        className={cn(
          "bg-surface-container h-nav-bar fixed inset-x-0 bottom-0 z-(--z-header) flex",
          "sm:bg-surface sm:w-rail sm:inset-y-0 sm:right-auto sm:h-auto sm:flex-col",
          "ease-emphasized-decelerate transition-[translate] duration-500 motion-reduce:transition-none",
          "starting:translate-y-full sm:starting:-translate-x-full sm:starting:translate-y-0",
        )}
      >
        <NavigationLinks />
        <RocketDock />
        <ThemeToggle className="mx-auto mb-6 shrink-0 max-sm:hidden" />
      </div>
      <div className="relative z-(--z-header) flex justify-end px-4 pt-4 sm:hidden">
        <ThemeToggle className="bg-surface-container" />
      </div>
    </header>
  );
}
