// routes.ts
export const INTERNAL_ROUTES = {
  HOME: { path: "/", label: "Home", icon: "home" },

  CONFERENCES: {
    path: "/conferences",
    label: "Conferences",
    icon: "conference",
    href: (page: number | string = 1) => `/conferences/${page}`,
  },

  BLOG: {
    path: "/blog",
    label: "Blog",
    icon: "blog",
    href: (param?: string | number) =>
      typeof param === "undefined"
        ? "/blog/1" // default
        : `/blog/${param}`, // page veya slug
  },

  VIDEOS: {
    path: "/videos",
    label: "Videos",
    icon: "video",
    href: (page: number | string = 1) => `/videos/${page}`,
  },

  COURSES: {
    path: "/courses",
    label: "Courses",
    icon: "course",
    href: (page: number | string = 1) => `/courses/${page}`,
  },

  CONTACT: { path: "/contact", label: "Contact", icon: "contact" },
} as const;

export const EXTERNAL_ROUTES = {
  MAIL: "elif@ehilal.net",
} as const;

// 🔹 Nav menüleri otomatik üretelim
export const MENUS = {
  NAV: Object.entries(INTERNAL_ROUTES).map(([key, route]) => ({
    key,
    label: route.label,
    href:
      "href" in route
        ? (route as any).href(1) // menüde ilk sayfa gösterimi için
        : route.path,
    icon: route.icon,
  })),
};

// 🔹 ROUTES: sadece string path'lere hızlı erişim (isteğe bağlı)
export const ROUTES = {
  INTERNAL: Object.fromEntries(
    Object.entries(INTERNAL_ROUTES).map(([key, route]) => [key, route.path]),
  ),
  EXTERNAL: EXTERNAL_ROUTES,
} as const;
