import withPlaiceholder from "@plaiceholder/next";

// CSP is intentionally not set yet (YouTube iframes, remote images and inline theme styles
// need an allow-list); roll it out as Content-Security-Policy-Report-Only first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // No includeSubDomains/preload: they are hard to undo and would also bind admin./other subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // @todo: remove picsum pattern before production build
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img-c.udemycdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "miro.medium.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn-images-1.medium.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "substackcdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ehilal-strapi-aws-s3-images-bucket.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  staticPageGenerationTimeout: 300,
};

export default withPlaiceholder(nextConfig);
