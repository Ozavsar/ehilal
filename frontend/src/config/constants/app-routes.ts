import {
  LuContact,
  LuHouse,
  LuNotebookPen,
  LuPresentation,
  LuVideo,
} from "react-icons/lu";
import { SiUdemy } from "react-icons/si";

export const INTERNAL_ROUTES = {
  HOME: { path: "/", label: "Home", icon: LuHouse },

  CONFERENCES: {
    path: "/conferences",
    label: "Conferences",
    icon: LuPresentation,
    href: (page: number | string = 1) => `/conferences/${page}`,
  },

  BLOG: {
    path: "/blog",
    label: "Blog",
    icon: LuNotebookPen,
    href: (param?: string | number) =>
      typeof param === "undefined" ? "/blog/1" : `/blog/${param}`,
  },

  VIDEOS: {
    path: "/videos",
    label: "Videos",
    icon: LuVideo,
    href: (page: number | string = 1) => `/videos/${page}`,
  },

  COURSES: {
    path: "/courses",
    label: "Courses",
    icon: SiUdemy,
    href: (page: number | string = 1) => `/courses/${page}`,
  },

  CONTACT: { path: "/contact", label: "Contact", icon: LuContact },
} as const;

export const EXTERNAL_ROUTES = {
  MAIL: "elif@ehilal.net",
} as const;

export const MENUS = {
  NAV: Object.entries(INTERNAL_ROUTES).map(([key, route]) => ({
    key,
    label: route.label,
    href: "href" in route ? (route as any).href(1) : route.path,
    icon: route.icon,
  })),
};

export const ROUTES = {
  INTERNAL: Object.fromEntries(
    Object.entries(INTERNAL_ROUTES).map(([key, route]) => [key, route.path]),
  ),
  EXTERNAL: EXTERNAL_ROUTES,
} as const;
