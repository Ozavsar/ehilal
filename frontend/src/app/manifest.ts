import type { MetadataRoute } from "next";
import { getSiteSettings, getThemePalette } from "@/lib/services";

// Prerendered, then refreshed daily; the Site Settings and theme webhooks refresh it through the
// tags of its requests
export const revalidate = 86400;

// Same dark scheme as the icons (app/icon.tsx)
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [site, palette] = await Promise.all([getSiteSettings(), getThemePalette()]);
  const { surface } = palette.schemes.dark;

  return {
    id: "/",
    name: `${site.siteName} | ${site.jobTitle}`,
    short_name: site.siteName,
    description: site.siteDescription,
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: surface,
    theme_color: surface,
    icons: [192, 512].map((size) => ({
      src: `/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}
