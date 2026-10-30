import type { CSSProperties } from "react";
import { COMPANY_LINKEDIN_URL, COMPANY_URL, LEGALIFI_URL } from "@/config/constants";
import type { ISiteSettings } from "@/types";

// Public site settings shared by layouts, metadata and sitemaps.
// NEXT_PUBLIC_* values are inlined at build time, so each one must be read with a literal process.env access.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@elifhilalumucu";
export const TWITTER_USER_ID = process.env.NEXT_PUBLIC_TWITTER_USER_ID || "1035512458935521280";
export const DEFAULT_BANNER = process.env.NEXT_PUBLIC_DEFAULT_BANNER || `${SITE_URL}/api/og`;

// Used for every field the Strapi Site Settings leave empty (getSiteSettings()), and for all of them
// until the single type is published. Prefer getSiteSettings() over the constants above when rendering.
export const DEFAULT_SITE_SETTINGS: ISiteSettings = {
  siteName: SITE_NAME,
  jobTitle: "Legal Engineer",
  siteDescription:
    "Personal portfolio of Elif Hilal Kara — legal engineer, conference speaker, and lifelong learner.",
  twitterHandle: TWITTER_HANDLE,
  twitterUserId: TWITTER_USER_ID,
  // The generated /api/og banner size; a custom NEXT_PUBLIC_DEFAULT_BANNER should match it
  defaultOgImage: { url: DEFAULT_BANNER, width: 1200, height: 630 },
  karakodUrl: COMPANY_URL,
  karakodLinkedinUrl: COMPANY_LINKEDIN_URL,
  legalifiUrl: LEGALIFI_URL,
};

// Used when the Strapi theme can't be loaded or a colour is unset; keep in sync with the CMS values
export const DEFAULT_THEME_COLORS = { primaryDark: "#607304", primaryLight: "#bf2821" } as const;

// Hex colours that globals.css uses as --primary in the dark and light themes
export function themeColorVariables(colors: { primaryDark: string; primaryLight: string }) {
  return {
    "--primary-dark": colors.primaryDark,
    "--primary-light": colors.primaryLight,
  } as CSSProperties;
}
