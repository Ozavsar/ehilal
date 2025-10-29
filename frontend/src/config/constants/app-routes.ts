import {
  LuContact,
  LuHouse,
  LuNotebookPen,
  LuPresentation,
  LuVideo,
} from "react-icons/lu";
import { SiUdemy } from "react-icons/si";

export const ROUTES = {
  INTERNAL: {
    HOME: "/",
    CONFERENCES: "/conferences/1",
    BLOG: "/blog/1",
    VIDEOS: "/videos/1",
    COURSES: "/courses/1",
    CONTACT: "/contact",
  },
  EXTERNAL: {
    Mail: "elif@ehilal.net",
  },
} as const;

export const MENUS = {
  NAV: [
    {
      key: "HOME",
      label: "Home",
      href: ROUTES.INTERNAL.HOME,
      icon: LuHouse,
    },
    {
      key: "CONFERENCES",
      label: "Conferences",
      href: ROUTES.INTERNAL.CONFERENCES,
      icon: LuPresentation,
    },
    {
      key: "BLOG",
      label: "Blog",
      href: ROUTES.INTERNAL.BLOG,
      icon: LuNotebookPen,
    },
    {
      key: "VIDEOS",
      label: "Videos",
      href: ROUTES.INTERNAL.VIDEOS,
      icon: LuVideo,
    },
    {
      key: "COURSES",
      label: "Courses",
      href: ROUTES.INTERNAL.COURSES,
      icon: SiUdemy,
    },
    {
      key: "CONTACT",
      label: "Contact",
      href: ROUTES.INTERNAL.CONTACT,
      icon: LuContact,
    },
  ],
};
