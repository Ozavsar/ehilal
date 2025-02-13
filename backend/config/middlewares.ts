export default [
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
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  "strapi::logger",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
