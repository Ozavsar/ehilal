import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import type {
  ISiteSettings,
  IStrapiResponse,
  IStrapiSiteSettings,
  IStrapiSocialLinks,
  IStrapiTheme,
} from "@/types";
import { DEFAULT_SITE_SETTINGS, DEFAULT_THEME_COLORS } from "@/config/site";
import { fetchAPI, getStrapiURL } from "../api/fetchAPI";

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

const textOr = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;
// The links are rendered as hrefs, so only http(s) URLs are accepted
const urlOr = (value: string | null | undefined, fallback: string) => {
  const url = value?.trim();
  return url && /^https?:\/\/\S+$/i.test(url) ? url : fallback;
};

// fetchAPI's ApiError carries the HTTP status
const isNotFound = (error: unknown) =>
  error instanceof Error && "status" in error && error.status === 404;

function resolveSiteSettings(settings: IStrapiSiteSettings | null): ISiteSettings {
  const defaults = DEFAULT_SITE_SETTINGS;
  const image = settings?.default_og_image;
  const twitterHandle = settings?.twitter_handle?.trim().replace(/^@/, "");

  return {
    siteName: textOr(settings?.site_name, defaults.siteName),
    jobTitle: textOr(settings?.job_title, defaults.jobTitle),
    siteDescription: textOr(settings?.site_description, defaults.siteDescription),
    twitterHandle: twitterHandle ? `@${twitterHandle}` : defaults.twitterHandle,
    twitterUserId: textOr(settings?.twitter_user_id, defaults.twitterUserId),
    defaultOgImage: image?.url
      ? {
          // The S3 upload provider returns absolute URLs, the local one /uploads/... paths
          url: image.url.startsWith("/") ? getStrapiURL(image.url) : image.url,
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          alt: image.alternativeText?.trim() || undefined,
        }
      : defaults.defaultOgImage,
    karakodUrl: urlOr(settings?.karakod_url, defaults.karakodUrl),
    karakodLinkedinUrl: urlOr(settings?.karakod_linkedin_url, defaults.karakodLinkedinUrl),
    legalifiUrl: urlOr(settings?.legalifi_url, defaults.legalifiUrl),
  };
}

/**
 * Site Settings (persona data and SEO defaults) with DEFAULT_SITE_SETTINGS filled in for every empty
 * field. Never throws: the root metadata of every page depends on it, and Strapi answers 404 until the
 * single type is created and published. cache() makes it one request per render.
 */
export const getSiteSettings = cache(async (): Promise<ISiteSettings> => {
  try {
    const response = await fetchAPI<IStrapiResponse<IStrapiSiteSettings | null>>(
      "/site-setting",
      { populate: "default_og_image" },
      { tags: ["site-settings"] },
    );
    return resolveSiteSettings(response.data);
  } catch (error) {
    unstable_rethrow(error);
    if (!isNotFound(error)) {
      console.error(
        "Site settings could not be loaded, using the defaults:",
        error instanceof Error ? error.message : error,
      );
    }
    return resolveSiteSettings(null);
  }
});

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
