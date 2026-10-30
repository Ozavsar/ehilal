import type { IconName } from "@/components/icon-names";

// Page 1 of a list lives at the bare path (next.config rewrites it to /x/1), pages 2..N at /x/<n>.
// The blog also uses /blog/<slug> for articles.
const listHref =
  (path: string) =>
  (page: number | string = 1): string =>
    String(page) === "1" ? path : `${path}/${page}`;

// `icon`: the Material Symbol the navigation shows for the destination (filled when active)
export const INTERNAL_ROUTES = {
  HOME: { path: "/", label: "Home", icon: "home" },

  CONFERENCES: {
    path: "/conferences",
    label: "Conferences",
    icon: "co_present",
    href: listHref("/conferences"),
  },

  BLOG: {
    path: "/blog",
    label: "Blog",
    icon: "article",
    href: listHref("/blog"),
  },

  VIDEOS: {
    path: "/videos",
    label: "Videos",
    icon: "smart_display",
    href: listHref("/videos"),
  },

  COURSES: {
    path: "/courses",
    label: "Courses",
    icon: "school",
    href: listHref("/courses"),
  },

  CONTACT: { path: "/contact", label: "Contact", icon: "mail" },
} as const satisfies Record<
  string,
  { path: string; label: string; icon: IconName; href?: unknown }
>;

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
