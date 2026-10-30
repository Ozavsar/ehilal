import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
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

// Page 1 of each list is served at the bare path; /x/1 permanently redirects there.
// Redirects run before rewrites and only match the incoming URL, so the pair cannot loop.
const LIST_SECTIONS = ["blog", "videos", "courses", "conferences"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return LIST_SECTIONS.map((section) => ({
      source: `/${section}/1`,
      destination: `/${section}`,
      permanent: true,
    }));
  },
  async rewrites() {
    return LIST_SECTIONS.map((section) => ({
      source: `/${section}`,
      destination: `/${section}/1`,
    }));
  },
  images: {
    remotePatterns: [
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

export default function config(phase) {
  return withPlaiceholder({
    ...nextConfig,
    compiler: {
      // Safety net for production builds (server and client code alike): drop console.log/info/debug
      // and friends, keep console.error/warn for real failures. Dev keeps every call.
      removeConsole: phase === PHASE_PRODUCTION_BUILD ? { exclude: ["error", "warn"] } : false,
    },
  });
}
