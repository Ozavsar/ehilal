"use client";
import Link from "next/link";
import { MENUS } from "@/config/constants/app-routes";
import { ICONS } from "./icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex w-full justify-around border-t bg-muted px-2 py-3 sm:hidden">
      {MENUS.NAV.map(({ key, label, href, icon }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "flex flex-col items-center border-b",
            pathname === href
              ? "border-primary text-primary"
              : "border-transparent",
          )}
        >
          {ICONS[icon]}
          <span className="text-xs">{label}</span>
        </Link>
      ))}
    </div>
  );
}
