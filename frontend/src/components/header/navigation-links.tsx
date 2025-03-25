"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { MENUS } from "@/config/constants/app-routes";
import { ICONS } from "./icons";

export default function Nav() {
  const [hoveredItem, setHoveredItem] = useState<null | string>(null);

  const pathname = usePathname();

  return (
    <motion.nav
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      initial="hidden"
      whileInView="visible"
      className="mx-auto flex flex-row gap-2 p-4 max-sm:hidden sm:my-auto sm:flex-col sm:gap-6 sm:p-8"
    >
      {MENUS.NAV.map(({ key, label, href, icon }) => {
        const isActive = pathname === href;
        const isHovered = hoveredItem === label;
        return (
          <motion.div
            key={key}
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring" }}
            className="self-end rounded-full"
          >
            <Link href={href}>
              <Button
                variant="circle"
                size="icon"
                onMouseOver={() => setHoveredItem(label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex items-center justify-center gap-4 border border-background font-bold uppercase transition-all duration-300 ${isActive ? "bg-primary text-white" : ""} ${isHovered ? "pr-12 text-white sm:w-fit sm:justify-end sm:pl-6" : ""}`}
              >
                <span
                  className={`text-white duration-500 ${isHovered ? "opacity-100" : "opacity-0"} hidden sm:block`}
                >
                  {isHovered ? label : null}
                </span>
                <div className="absolute right-[11px] flex items-center justify-center">
                  {ICONS[icon]}
                </div>
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
