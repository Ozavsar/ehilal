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
      icon: "home",
    },
    {
      key: "CONFERENCES",
      label: "Conferences",
      href: ROUTES.INTERNAL.CONFERENCES,
      icon: "conference",
    },
    {
      key: "BLOG",
      label: "Blog",
      href: ROUTES.INTERNAL.BLOG,
      icon: "blog",
    },
    {
      key: "VIDEOS",
      label: "Videos",
      href: ROUTES.INTERNAL.VIDEOS,
      icon: "video",
    },
    {
      key: "COURSES",
      label: "Courses",
      href: ROUTES.INTERNAL.COURSES,
      icon: "course",
    },
    {
      key: "CONTACT",
      label: "Contact",
      href: ROUTES.INTERNAL.CONTACT,
      icon: "contact",
    },
  ],
};
