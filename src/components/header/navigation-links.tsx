"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ContactIcon,
  HomeIcon,
  NotebookPenIcon,
  PresentationIcon,
  VideoIcon,
} from "lucide-react";
import UdemyIcon from "@/assets/icons/udemy-icon";
import { Button } from "../ui/button";
import appRoutes from "@/config/constants/app-routes";

const navLinks = [
  {
    title: "Home",
    url: appRoutes.INTERNAL.Home,
    icon: <HomeIcon />,
  },
  {
    title: "Conferences",
    url: appRoutes.INTERNAL.Conferences,
    icon: <PresentationIcon />,
  },
  {
    title: "Blog",
    url: appRoutes.INTERNAL.Blog,
    icon: <NotebookPenIcon />,
  },
  {
    title: "Videos",
    url: appRoutes.INTERNAL.Videos,
    icon: <VideoIcon />,
  },
  {
    title: "My Courses",
    url: appRoutes.INTERNAL.Udemy,
    icon: <UdemyIcon width={24} height={24} />,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: <ContactIcon />,
  },
];

export default function Nav() {
  const [hoveredItem, setHoveredItem] = useState<null | string>(null);

  const pathname = usePathname();

  return (
    <motion.nav
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      initial="hidden"
      whileInView="visible"
      className="mx-auto flex flex-row gap-4 sm:gap-6 p-4 sm:my-auto sm:flex-col sm:p-8"
    >
      {navLinks.map((link, i) => {
        const isActive = pathname === link.url;
        const isHovered = hoveredItem === link.title;
        return (
          <motion.div
            key={link.title}
            variants={{
              hidden: { opacity: 0, scale: 0.5 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring" }}
            className="self-end rounded-full"
          >
            <Link key={link.title} href={link.url}>
              <Button
                variant="circle"
                size="icon"
                onMouseOver={() => setHoveredItem(link.title)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex items-center justify-center gap-4 border border-background font-bold uppercase transition-all duration-300 ${isActive ? "bg-primary text-white" : ""} ${isHovered ? "pr-12 text-white sm:w-fit sm:justify-end sm:pl-6" : ""}`}
              >
                <span
                  className={`text-white duration-500 ${isHovered ? "opacity-100" : "opacity-0"} hidden sm:block`}
                >
                  {isHovered ? link.title : null}
                </span>
                <div className="absolute right-[11px] flex items-center justify-center">
                  {link.icon}
                </div>
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
