const appRoutes = {
  INTERNAL: {
    Home: "/",
    About: "/about",
    Blog: "/blog",
    Videos: "/videos",
    Udemy: "/my-courses",
    Contact: "/contact",
  },
  EXTERNAL: {
    Tel: "tel:+905555555555",
    Mail: "mailto:elif@mail.com",
  },
} as const;

export default appRoutes;
