// Origin of the website (e.g. https://ehilal.net): the admin shows it in the theme preview iframe
const frontendOrigin = (url: string | undefined): string[] => {
  try {
    return url ? [new URL(url).origin] : [];
  } catch {
    return [];
  }
};

export default ({ env }) => [
  "strapi::errors",

  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "ehilal-strapi-aws-s3-images-bucket.s3.eu-central-1.amazonaws.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "ehilal-strapi-aws-s3-images-bucket.s3.eu-central-1.amazonaws.com",
          ],
          "script-src": ["'self'", "www.youtube.com"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "font-src": ["'self'"],
          "frame-src": ["'self'", ...frontendOrigin(env("FRONTEND_URL"))],
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  {
    name: "strapi::cors",
    config: {
      origin: ["https://ehilal.com", "https://admin.ehilal.com", "http://localhost:3169"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      headers: "*",
      credentials: true,
    },
  },

  "strapi::logger",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
