"use client";

import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { NAV_TOP } from "@/components/view-transitions";
import { isNavItemActive, type NavDestination } from "@/config/constants/app-routes";
import { cn } from "@/lib/utils";
import NavLink from "./nav-link";

// Hover intent (mouse only); the close delay lets the pointer cross the gap to the menu
const OPEN_DELAY = 80;
const CLOSE_DELAY = 200;
const GAP = 8;

interface NavGroupProps {
  items: NavDestination[];
  children: ReactNode;
  className?: string;
}

/**
 * A navigation item that opens a menu of destinations. The menu is a top-layer popover, so the
 * rail's scroll box can't clip it; it opens on hover for a mouse, on click, tap or Enter otherwise.
 */
export default function NavGroup({ items, children, className }: NavGroupProps) {
  const pathname = usePathname();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A hover-opened menu closes when the pointer leaves; a click keeps it open
  const openedByHover = useRef(false);

  const isOpen = () => menuRef.current?.matches(":popover-open") ?? false;
  const close = () => {
    clearTimeout(timer.current);
    if (isOpen()) menuRef.current?.hidePopover();
  };

  // Placed just before it opens, next to the item as currently laid out (bar or rail)
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const place = (event: Event) => {
      const box = triggerRef.current?.getBoundingClientRect();
      if ((event as ToggleEvent).newState !== "open" || !box) {
        openedByHover.current = false;
        return;
      }
      const isRail = matchMedia("(min-width: 600px)").matches;
      Object.assign(
        menu.style,
        isRail
          ? {
              left: `${box.right + GAP}px`,
              top: `${box.top + box.height / 2}px`,
              translate: "0 -50%",
              transformOrigin: "left center",
            }
          : {
              left: `${box.left + box.width / 2}px`,
              top: `${box.top - GAP}px`,
              translate: "-50% -100%",
              transformOrigin: "bottom center",
            },
      );
    };
    menu.addEventListener("beforetoggle", place);
    return () => {
      menu.removeEventListener("beforetoggle", place);
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (menuRef.current?.matches(":popover-open")) menuRef.current.hidePopover();
  }, [pathname]);

  const hoverOpen = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    if (isOpen()) return;
    timer.current = setTimeout(() => {
      openedByHover.current = true;
      menuRef.current?.showPopover();
    }, OPEN_DELAY);
  };

  const hoverClose = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimeout(timer.current);
    if (isOpen() && openedByHover.current) timer.current = setTimeout(close, CLOSE_DELAY);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={menuId}
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
        onClick={(event) => {
          // Already open from hovering: keep it (popoverTarget would toggle it shut)
          if (openedByHover.current && isOpen()) {
            event.preventDefault();
            openedByHover.current = false;
          }
        }}
        className={className}
      >
        {children}
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") clearTimeout(timer.current);
        }}
        onPointerLeave={hoverClose}
        className="bg-surface-container text-on-surface shadow-elevation-2 open:animate-m3-fade-enter inset-auto m-0 min-w-48 rounded-lg border-0 p-2 [--m3-enter-duration:200ms]"
      >
        <ul className="flex flex-col gap-1">
          {items.map(({ key, label, href, icon }) => {
            const isActive = isNavItemActive(pathname, href);
            return (
              <li key={key}>
                <NavLink
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  transitionTypes={[NAV_TOP]}
                  onClick={close}
                  className={cn(
                    "type-label-large focus-visible:outline-primary relative flex h-12 items-center gap-3 rounded-md px-3 outline-offset-2 focus-visible:outline-3",
                    "ease-standard transition-colors duration-150",
                    isActive
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-on-surface/8 hover:text-on-surface",
                  )}
                >
                  <Icon name={icon} filled={isActive} />
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
