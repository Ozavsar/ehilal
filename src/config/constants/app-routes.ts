const appRoutes = {
  INTERNAL: {
    Home: "/",
    About: "/about",
    Blog: "/blog/1",
    Videos: "/videos/1",
    Udemy: "/my-courses",
    Contact: "/contact",
  },
  EXTERNAL: {
    Tel: "tel:+905555555555",
    Mail: "mailto:elif@mail.com",
  },
} as const;

export default appRoutes;
