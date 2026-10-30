import { LuContact, LuHouse, LuNotebookPen, LuPresentation, LuVideo } from "react-icons/lu";
import { SiUdemy } from "react-icons/si";

// Page 1 of a list lives at the bare path (next.config rewrites it to /x/1), pages 2..N at /x/<n>.
// The blog also uses /blog/<slug> for articles.
const listHref =
  (path: string) =>
  (page: number | string = 1): string =>
    String(page) === "1" ? path : `${path}/${page}`;

export const INTERNAL_ROUTES = {
  HOME: { path: "/", label: "Home", icon: LuHouse },

  CONFERENCES: {
    path: "/conferences",
    label: "Conferences",
    icon: LuPresentation,
    href: listHref("/conferences"),
  },

  BLOG: {
    path: "/blog",
    label: "Blog",
    icon: LuNotebookPen,
    href: listHref("/blog"),
  },

  VIDEOS: {
    path: "/videos",
    label: "Videos",
    icon: LuVideo,
    href: listHref("/videos"),
  },

  COURSES: {
    path: "/courses",
    label: "Courses",
    icon: SiUdemy,
    href: listHref("/courses"),
  },

  CONTACT: { path: "/contact", label: "Contact", icon: LuContact },
} as const;

export const MENUS = {
  NAV: Object.entries(INTERNAL_ROUTES).map(([key, route]) => ({
    key,
    label: route.label,
    href: route.path,
    icon: route.icon,
  })),
};

/** A nav item is active on its own path and on every page below it (/blog/2, /blog/<slug>). */
export const isNavItemActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
