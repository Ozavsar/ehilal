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

export interface NavDestination {
  key: string;
  label: string;
  href: string;
  icon: IconName;
}

/** Several destinations behind one navigation item, listed in a menu that opens from it */
export interface NavGroup {
  key: string;
  label: string;
  icon: IconName;
  items: NavDestination[];
}

const destination = (key: keyof typeof INTERNAL_ROUTES): NavDestination => ({
  key,
  label: INTERNAL_ROUTES[key].label,
  href: INTERNAL_ROUTES[key].path,
  icon: INTERNAL_ROUTES[key].icon,
});

export const MENUS = {
  // Every destination (the 404 page lists them)
  NAV: (Object.keys(INTERNAL_ROUTES) as (keyof typeof INTERNAL_ROUTES)[]).map(destination),
  // The navigation bar/rail: talks, videos and courses share "Learn", so the bar keeps to M3's
  // 3–5 destinations
  MAIN: [
    destination("HOME"),
    destination("BLOG"),
    {
      key: "LEARN",
      label: "Learn",
      icon: "auto_stories",
      items: [destination("CONFERENCES"), destination("VIDEOS"), destination("COURSES")],
    },
    destination("CONTACT"),
  ] satisfies (NavDestination | NavGroup)[],
};

export const isNavGroup = (item: NavDestination | NavGroup): item is NavGroup => "items" in item;

/** A nav item is active on its own path and on every page below it (/blog/2, /blog/<slug>). */
export const isNavItemActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
