import { unstable_rethrow } from "next/navigation";
import type { IStrapiResponse, IStrapiSocialLinks, IStrapiTheme } from "@/types";
import { DEFAULT_THEME_COLORS } from "@/config/site";
import { fetchAPI } from "../api/fetchAPI";

/**
 * get the theme data from the Strapi API.
 */
export async function getTheme() {
  const response = await fetchAPI<IStrapiResponse<IStrapiTheme>>(
    "/theme",
    {},
    {
      tags: ["theme"],
    },
  );
  return response.data;
}

// The colours go straight into inline CSS variables, so only plain hex values are accepted
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const hexOr = (value: string | null | undefined, fallback: string) =>
  value && HEX_COLOR.test(value) ? value : fallback;

/**
 * Theme colours with defaults: the colours are cosmetic, so a Strapi failure must not take pages down.
 */
export async function getThemeColors(): Promise<{ primaryDark: string; primaryLight: string }> {
  try {
    const theme = await getTheme();
    return {
      primaryDark: hexOr(theme?.primaryDark, DEFAULT_THEME_COLORS.primaryDark),
      primaryLight: hexOr(theme?.primaryLight, DEFAULT_THEME_COLORS.primaryLight),
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      "Theme could not be loaded, using the default colours:",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_THEME_COLORS;
  }
}

/**
 * Get Social Media Links
 */
export async function getSocialMediaLinks() {
  const response = await fetchAPI<IStrapiResponse<IStrapiSocialLinks>>(
    "/social-media-link",
    {},
    {
      tags: ["social-media-links"],
    },
  );

  return response.data;
}
