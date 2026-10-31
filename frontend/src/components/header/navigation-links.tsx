"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { isNavGroup, isNavItemActive, MENUS } from "@/config/constants/app-routes";
import { cn } from "@/lib/utils";
import { NAV_TOP } from "@/components/view-transitions";
import NavGroup from "./nav-group";
import NavLink from "./nav-link";

// The destinations of the navigation bar/rail (the box itself is in ../header). A group item opens
// a menu of its destinations and is current when one of them is.
export default function NavigationLinks() {
  const pathname = usePathname();
  const activeIndex = MENUS.MAIN.findIndex((item) =>
    (isNavGroup(item) ? item.items : [item]).some(({ href }) => isNavItemActive(pathname, href)),
  );
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previousIndex = useRef(activeIndex);

  // The indicator renders in the active destination (right without JS) and slides over from the
  // previous one with a measured FLIP, so it works along the bar and down the rail.
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
    // Forced reflow: commits the start state before the transition takes over
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
      {MENUS.MAIN.map((item, index) => {
        const { key, label, icon } = item;
        const isActive = index === activeIndex;
        // Rail: 80px wide in the 96px rail, so even "Conferences" keeps 8px from the edges
        const itemClassName =
          "group flex min-w-0 flex-1 flex-col items-center gap-1 pt-3 pb-4 outline-none sm:mx-auto sm:h-14 sm:w-20 sm:flex-none sm:p-0";
        const content = (
          <>
            <span
              data-nav-slot
              className={cn(
                "group-focus-visible:outline-primary relative flex h-8 w-16 items-center justify-center rounded-full outline-offset-2 group-focus-visible:outline-3 sm:w-14",
                isActive ? "text-on-secondary-container" : "text-on-surface-variant",
              )}
            >
              {isActive && (
                // Behind every icon and label, so it slides under the destinations it passes
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
          </>
        );

        return isNavGroup(item) ? (
          <NavGroup key={key} items={item.items} className={itemClassName}>
            {content}
          </NavGroup>
        ) : (
          <NavLink
            key={key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            transitionTypes={[NAV_TOP]}
            className={itemClassName}
          >
            {content}
          </NavLink>
        );
      })}
    </nav>
  );
}
