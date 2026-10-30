"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import NavLink from "./nav-link";
import { isNavItemActive, MENUS } from "@/config/constants/app-routes";

// Entrance: each item pops in with a @starting-style transition (Tailwind `starting:`), staggered
// through transition-delay. Visible without JS, still for reduced-motion users.
const itemClassName =
  "cursor-pointer self-end rounded-full transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none starting:scale-50 starting:opacity-0";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex flex-row gap-2 p-4 max-sm:hidden sm:my-auto sm:flex-col sm:gap-6 sm:p-8">
      {MENUS.NAV.map(({ key, label, href, icon: Icon }, index) => {
        const isActive = isNavItemActive(pathname, href);
        return (
          <div key={key} className={itemClassName} style={{ transitionDelay: `${index * 150}ms` }}>
            <NavLink href={href}>
              {/* Hovering widens the circle into a pill that shows the label */}
              <Button
                variant="circle"
                size="icon"
                className={`group border-background relative flex cursor-pointer items-center justify-center gap-4 border font-bold uppercase transition-all duration-300 hover:pr-12 hover:text-white sm:hover:w-fit sm:hover:justify-end sm:hover:pl-6 ${isActive ? "bg-primary text-white" : ""}`}
              >
                <span className="hidden text-white opacity-100 transition-opacity duration-500 sm:group-hover:block starting:opacity-0">
                  {label}
                </span>
                <div className="absolute right-2.75 flex items-center justify-center">
                  <Icon className="size-5 sm:size-6" />
                </div>
              </Button>
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}
