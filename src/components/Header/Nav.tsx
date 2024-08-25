"use client";
import {
  ContactIcon,
  HomeIcon,
  NotebookPenIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  {
    title: "Home",
    url: "/",
    icon: <HomeIcon />,
  },
  {
    title: "About",
    url: "/about",
    icon: <UserRoundIcon />,
  },
  {
    title: "Blog",
    url: "/blog",
    icon: <NotebookPenIcon />,
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
    <nav className="mx-auto flex flex-row gap-6 p-4 sm:my-auto sm:flex-col sm:p-8">
      {navLinks.map((link) => {
        const isActive = pathname === link.url;
        const isHovered = hoveredItem === link.title;
        return (
          <Link
            key={link.title}
            href={link.url}
            className="self-end rounded-full"
          >
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
        );
      })}
    </nav>
  );
}
