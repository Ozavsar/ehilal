import type { MetadataRoute } from "next";
import { IS_PRODUCTION_SITE } from "@/config/seo";
import { SITE_URL } from "@/config/site";

// Only the live site is crawlable; dev.*, previews and local builds are closed to every crawler
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      // /api/og stays open: it is the default share image, and X/LinkedIn honour robots.txt
      allow: ["/", "/api/og"],
      disallow: ["/api/", "/theme-preview"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
