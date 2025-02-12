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
    Mail: "mailto:elif@ehilal.net",
  },
  SOCIAL: {
    LINKEDIN: "https://www.linkedin.com/in/elif-hilal-umucu/",
    X: "https://x.com/elifhilalumucu",
  },
} as const;

export default appRoutes;
