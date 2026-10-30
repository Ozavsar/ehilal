"use client";
import { useLayoutEffect, useRef } from "react";
import { isNavItemActive, MENUS } from "@/config/constants/app-routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NavLink from "./nav-link";

const SLIDE: KeyframeAnimationOptions = {
  duration: 400,
  easing: "cubic-bezier(0.34, 1.3, 0.64, 1)",
};

// Entrances are @starting-style transitions (Tailwind `starting:`): visible without JS, still for
// reduced-motion users. The bar slides up, then the items fade up one after another.
export default function MobileNav() {
  const pathname = usePathname();
  const activeIndex = MENUS.NAV.findIndex(({ href }) => isNavItemActive(pathname, href));
  const activeBgRef = useRef<HTMLDivElement>(null);
  const activeBarRef = useRef<HTMLDivElement>(null);
  // Box of the active item's background at the previous render
  const previousBox = useRef<DOMRect | null>(null);

  // The active marker is rendered in the active item; when that changes, slide it over from the
  // previous item (FLIP). Items differ in width, so the background also scales from the old width.
  useLayoutEffect(() => {
    const from = previousBox.current;
    const to = activeBgRef.current?.getBoundingClientRect() ?? null;
    previousBox.current = to;
    if (!from || !to || from.left === to.left) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    activeBgRef.current?.animate(
      [
        { translate: `${from.left - to.left}px 0`, scale: `${from.width / to.width} 1` },
        { translate: "0 0", scale: "1 1" },
      ],
      SLIDE,
    );
    const centerShift = from.left + from.width / 2 - (to.left + to.width / 2);
    activeBarRef.current?.animate(
      [{ translate: `${centerShift}px 0` }, { translate: "0 0" }],
      SLIDE,
    );
  }, [activeIndex]);

  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-(--z-floating) flex w-full justify-around border-t transition-[translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:hidden starting:translate-y-full">
      <div className="flex w-full justify-around">
        {MENUS.NAV.map(({ key, label, href, icon: Icon }, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={key}
              className="relative flex flex-1 items-center justify-center transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none starting:translate-y-5 starting:opacity-0"
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <NavLink
                href={href}
                className="group relative flex w-full flex-col items-center gap-1 p-2 transition-colors"
              >
                {isActive && (
                  <div ref={activeBgRef} className="bg-primary/10 absolute inset-0 origin-left" />
                )}

                <div className="relative z-(--z-raised) transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-active:scale-95">
                  <Icon
                    className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")}
                  />
                </div>
                <span
                  className={cn(
                    "text-2xs relative z-(--z-raised) font-bold",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </NavLink>

              {isActive && (
                <div
                  ref={activeBarRef}
                  className="bg-primary absolute bottom-0.5 h-1 w-8 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
