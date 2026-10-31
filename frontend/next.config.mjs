import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import withPlaiceholder from "@plaiceholder/next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle treemaps in .next/analyze/; checking the script name avoids per-shell env var syntax
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true" || process.env.npm_lifecycle_event === "analyze",
  openAnalyzer: false,
});

// Origins that may frame the site for Strapi Preview: the Strapi origin + PREVIEW_ALLOWED_ORIGINS
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

// frame-ancestors instead of X-Frame-Options, which can't allow the Strapi admin. No full CSP yet:
// YouTube iframes, remote images and inline theme styles need an allow-list first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors()}` },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // No includeSubDomains/preload: hard to undo and would also bind admin. and other subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

// Page 1 is served at the bare path and /x/1 redirects there; redirects only match the incoming
// URL, so the pair cannot loop
const LIST_SECTIONS = ["blog", "videos", "courses", "conferences"];

// Only the live site may be indexed (same hosts as app/robots.ts); other hosts get noindex
const PRODUCTION_HOSTS = ["ehilal.net", "www.ehilal.net"];
function isProductionSite() {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net");
    return PRODUCTION_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

// Old per-section sitemaps, redirected to the single /sitemap.xml
const LEGACY_SITEMAPS = ["main", "blog", "videos", "courses", "conferences"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // `yarn dev` only: lets devices on the LAN open the dev server
  allowedDevOrigins: ["192.168.*.*"],
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
      // Crawlers still ask for /favicon.ico; a static app/favicon.ico would miss the palette
      { source: "/favicon.ico", destination: "/icon/48" },
    ];
  },
  images: {
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
        removeConsole: phase === PHASE_PRODUCTION_BUILD ? { exclude: ["error", "warn"] } : false,
      },
      webpack(webpackConfig) {
        // @material/material-color-utilities 0.4.0's ESM imports lack ".js", which webpack rejects
        webpackConfig.module.rules.push({
          test: /[\\/]@material[\\/]material-color-utilities[\\/]/,
          resolve: { fullySpecified: false },
        });
        return webpackConfig;
      },
    }),
  );
}
