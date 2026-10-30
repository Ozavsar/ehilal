import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import withPlaiceholder from "@plaiceholder/next";
import bundleAnalyzer from "@next/bundle-analyzer";

// `yarn analyze` (or ANALYZE=true) writes the client/server/edge bundle treemaps to .next/analyze/.
// The script name is checked so it works without setting an env var (cmd/PowerShell syntax differs).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true" || process.env.npm_lifecycle_event === "analyze",
  openAnalyzer: false,
});

// Origins that may frame the site: the Strapi admin (Strapi Preview opens the site in an iframe) and
// PREVIEW_ALLOWED_ORIGINS (comma separated) when the admin runs on another origin than the API
function frameAncestors() {
  const candidates = [
    process.env.NEXT_PUBLIC_STRAPI_API_URL,
    ...(process.env.PREVIEW_ALLOWED_ORIGINS ?? "").split(","),
  ];
  const origins = new Set();
  for (const candidate of candidates) {
    try {
      const { origin, protocol } = new URL(candidate?.trim() ?? "");
      if (protocol === "https:" || protocol === "http:") origins.add(origin);
    } catch {
      // Unset or not a URL: skip it
    }
  }
  return ["'self'", ...origins].join(" ");
}

// A full CSP is intentionally not set yet (YouTube iframes, remote images and inline theme styles
// need an allow-list); roll it out as Content-Security-Policy-Report-Only first. frame-ancestors
// replaces X-Frame-Options, which can't allow the Strapi admin.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors()}` },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // No includeSubDomains/preload: they are hard to undo and would also bind admin./other subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

// Page 1 of each list is served at the bare path; /x/1 permanently redirects there.
// Redirects run before rewrites and only match the incoming URL, so the pair cannot loop.
const LIST_SECTIONS = ["blog", "videos", "courses", "conferences"];

// Only the live site may be indexed (app/robots.ts checks the same hosts). Everything else (dev.*,
// previews, local builds) sends a noindex header on every response, API, image and XML ones included.
const PRODUCTION_HOSTS = ["ehilal.net", "www.ehilal.net"];
function isProductionSite() {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net");
    return PRODUCTION_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

// The old sitemap index pointed at these; app/sitemap.ts now lists every URL at /sitemap.xml
const LEGACY_SITEMAPS = ["main", "blog", "videos", "courses", "conferences"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    const headers = isProductionSite()
      ? securityHeaders
      : [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers }];
  },
  async redirects() {
    return [
      ...LIST_SECTIONS.map((section) => ({
        source: `/${section}/1`,
        destination: `/${section}`,
        permanent: true,
      })),
      ...LEGACY_SITEMAPS.map((name) => ({
        source: `/sitemap-${name}.xml`,
        destination: "/sitemap.xml",
        permanent: true,
      })),
    ];
  },
  async rewrites() {
    return [
      ...LIST_SECTIONS.map((section) => ({
        source: `/${section}`,
        destination: `/${section}/1`,
      })),
      // Feed readers and some crawlers still ask for /favicon.ico; serve the generated 48 px PNG
      // (app/icon.tsx). Not an app/favicon.ico file: that would be static and miss the theme colours.
      { source: "/favicon.ico", destination: "/icon/48" },
    ];
  },
  images: {
    // AVIF first (smallest), WebP for browsers without AVIF support
    formats: ["image/avif", "image/webp"],
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
};

export default function config(phase) {
  return withBundleAnalyzer(
    withPlaiceholder({
      ...nextConfig,
      compiler: {
        // Safety net for production builds (server and client code alike): drop console.log/info/debug
        // and friends, keep console.error/warn for real failures. Dev keeps every call.
        removeConsole: phase === PHASE_PRODUCTION_BUILD ? { exclude: ["error", "warn"] } : false,
      },
      webpack(webpackConfig) {
        // @material/material-color-utilities 0.4.0 is an ES module whose imports lack the ".js"
        // extension, which webpack refuses for "type": "module" packages (the theme preview bar uses it)
        webpackConfig.module.rules.push({
          test: /[\\/]@material[\\/]material-color-utilities[\\/]/,
          resolve: { fullySpecified: false },
        });
        return webpackConfig;
      },
    }),
  );
}
