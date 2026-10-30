"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { isNavItemActive, MENUS } from "@/config/constants/app-routes";
import { cn } from "@/lib/utils";
import { NAV_TOP } from "@/components/view-transitions";
import NavLink from "./nav-link";

// The destinations of the M3 navigation bar (below 600px, sm) and navigation rail (from 600px);
// the bar/rail box itself is in ../header. Every destination shows its icon and its label; the
// current one has the active indicator pill, a filled icon and aria-current="page".
export default function NavigationLinks() {
  const pathname = usePathname();
  const activeIndex = MENUS.NAV.findIndex(({ href }) => isNavItemActive(pathname, href));
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previousIndex = useRef(activeIndex);

  // The indicator is rendered in the active destination, so it is right without JS. When the
  // destination changes, it slides over from the previous one (FLIP: start at the old slot's
  // offset, then transition to its own place); with no previous destination it grows from its
  // centre. Measured on the live layout, so it works the same along the bar and down the rail.
  useLayoutEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = activeIndex;
    const indicator = indicatorRef.current;
    if (from === activeIndex || !indicator) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slots = navRef.current?.querySelectorAll<HTMLElement>("[data-nav-slot]");
    const fromBox = from >= 0 ? slots?.[from]?.getBoundingClientRect() : undefined;
    const toBox = slots?.[activeIndex]?.getBoundingClientRect();

    indicator.style.transition = "none";
    if (fromBox && toBox) {
      indicator.style.translate = `${fromBox.left - toBox.left}px ${fromBox.top - toBox.top}px`;
    } else {
      indicator.style.scale = "0.32 1";
      indicator.style.opacity = "0";
    }
    // Commit the start state, then let the indicator's transition carry it home
    indicator.getBoundingClientRect();
    indicator.style.removeProperty("transition");
    indicator.style.removeProperty("translate");
    indicator.style.removeProperty("scale");
    indicator.style.removeProperty("opacity");
  }, [activeIndex]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="flex min-h-0 min-w-0 flex-1 sm:flex-col sm:justify-center-safe sm:gap-3 sm:overflow-y-auto sm:py-6"
    >
      {MENUS.NAV.map(({ key, label, href, icon }, index) => {
        const isActive = index === activeIndex;
        return (
          <NavLink
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            // M3 fade through of the page content (app/template.tsx)
            transitionTypes={[NAV_TOP]}
            // Rail: 80px wide in the 96px rail, so even "Conferences" keeps 8px from the edges
            className="group flex min-w-0 flex-1 flex-col items-center gap-1 pt-3 pb-4 outline-none sm:mx-auto sm:h-14 sm:w-20 sm:flex-none sm:p-0"
          >
            {/* Slot: holds the indicator; the state layer and the M3 focus ring share its shape */}
            <span
              data-nav-slot
              className={cn(
                "group-focus-visible:outline-primary relative flex h-8 w-16 items-center justify-center rounded-full outline-offset-2 group-focus-visible:outline-3 sm:w-14",
                isActive ? "text-on-secondary-container" : "text-on-surface-variant",
              )}
            >
              {isActive && (
                // Behind every icon and label of the bar/rail (its stacking context), so it slides
                // under the destinations it passes
                <span
                  ref={indicatorRef}
                  aria-hidden="true"
                  className="bg-secondary-container ease-emphasized absolute inset-0 z-(--z-behind) rounded-full transition-[translate,scale,opacity] duration-400 motion-reduce:transition-none"
                />
              )}
              <span
                aria-hidden="true"
                className="ease-standard absolute inset-0 rounded-full bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-8 group-focus-visible:opacity-12 group-active:opacity-12"
              />
              <Icon name={icon} filled={isActive} className="relative" />
            </span>
            <span
              className={cn(
                "type-label-medium whitespace-nowrap",
                isActive ? "text-on-surface" : "text-on-surface-variant",
              )}
            >
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
