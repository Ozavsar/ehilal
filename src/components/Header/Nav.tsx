"use client";
import {
  ContactIcon,
  HomeIcon,
  NotebookPenIcon,
  UserRoundIcon,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import appRoutes from "@/config/constants/app_routes";
import UdemyIcon from "@/assets/icons/UdemyIcon";

const navLinks = [
  {
    title: "Home",
    url: appRoutes.INTERNAL.Home,
    icon: <HomeIcon />,
  },
  {
    title: "About",
    url: appRoutes.INTERNAL.About,
    icon: <UserRoundIcon />,
  },
  {
    title: "Blog",
    url: appRoutes.INTERNAL.Blog,
    icon: <NotebookPenIcon />,
  },
  {
    title: "Videos",
    url: appRoutes.INTERNAL.Videos,
    icon: <Video />,
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
      className="mx-auto flex flex-row gap-6 p-4 sm:my-auto sm:flex-col sm:p-8"
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
                className={`relative flex gap-4 font-bold uppercase transition-all duration-300 ${isActive ? "bg-primary text-white" : ""} ${isHovered ? "pr-12 text-white sm:w-fit sm:justify-end sm:pl-6" : ""}`}
              >
                <span
                  className={`text-white duration-500 ${isHovered ? "opacity-100" : "opacity-0"} hidden sm:block`}
                >
                  {isHovered ? link.title : null}
                </span>
                <div className="absolute right-0 pr-3">{link.icon}</div>
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
