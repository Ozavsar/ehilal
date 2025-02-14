const appRoutes = {
  INTERNAL: {
    Home: "/",
    Conferences: "/conferences/1",
    Blog: "/blog/1",
    Videos: "/videos/1",
    Udemy: "/courses/1",
    Contact: "/contact",
  },
  EXTERNAL: {
    Mail: "elif@ehilal.net",
  },
} as const;

export default appRoutes;
