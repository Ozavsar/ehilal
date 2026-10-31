import { cache } from "react";
import { draftMode } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import type {
  ISiteSettings,
  IStrapiResponse,
  IStrapiSiteSettings,
  IStrapiSocialLinks,
  IStrapiTheme,
} from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/config/site";
import { DEFAULT_PALETTE, parsePalette, type Palette } from "@/lib/palette";
import { fetchAPI, getStrapiURL } from "../api/fetchAPI";

// fetchAPI's ApiError carries the HTTP status
const isNotFound = (error: unknown) =>
  error instanceof Error && "status" in error && error.status === 404;

/** The Strapi theme palette (draft in Draft Mode); never throws, falls back to DEFAULT_PALETTE */
export const getThemePalette = cache(async (): Promise<Palette> => {
  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch (error) {
    // Outside a request scope (e.g. generateStaticParams): read the published theme
    unstable_rethrow(error);
  }

  try {
    const response = await fetchAPI<IStrapiResponse<IStrapiTheme | null>>(
      "/theme",
      isDraft ? { status: "draft" } : {},
      { tags: ["theme"] },
    );
    const palette = parsePalette(response.data?.palette);
    if (palette) return palette;
    // Missing until the backend has generated one; a malformed one is worth a log
    if (response.data?.palette != null) {
      console.error("Theme palette is invalid, using the default palette");
    }
    return DEFAULT_PALETTE;
  } catch (error) {
    unstable_rethrow(error);
    if (!isNotFound(error)) {
      console.error(
        "Theme could not be loaded, using the default palette:",
        error instanceof Error ? error.message : error,
      );
    }
    return DEFAULT_PALETTE;
  }
});

/** The draft theme's photo colours, quick picks for the theme preview bar. Never throws. */
export async function getThemeCandidates(): Promise<string[]> {
  try {
    const response = await fetchAPI<
      IStrapiResponse<Pick<IStrapiTheme, "source_type" | "image_candidates"> | null>
    >(
      "/theme",
      { status: "draft", fields: ["source_type", "image_candidates"] },
      { tags: ["theme"] },
    );
    const { source_type, image_candidates } = response.data ?? {};
    if (source_type !== "image" || !Array.isArray(image_candidates)) return [];
    return image_candidates.filter((hex) => /^#[0-9a-f]{6}$/i.test(hex));
  } catch (error) {
    unstable_rethrow(error);
    return [];
  }
}

const textOr = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;
// The links are rendered as hrefs, so only http(s) URLs are accepted
const urlOr = (value: string | null | undefined, fallback: string) => {
  const url = value?.trim();
  return url && /^https?:\/\/\S+$/i.test(url) ? url : fallback;
};

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
 * Site Settings with DEFAULT_SITE_SETTINGS for every empty field. Never throws: every page's
 * metadata depends on it.
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
