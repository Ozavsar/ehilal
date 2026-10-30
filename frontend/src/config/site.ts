import type { CSSProperties } from "react";

// Public site settings shared by layouts, metadata and sitemaps.
// NEXT_PUBLIC_* values are inlined at build time, so each one must be read with a literal process.env access.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@elifhilalumucu";
export const TWITTER_USER_ID = process.env.NEXT_PUBLIC_TWITTER_USER_ID || "1035512458935521280";
export const DEFAULT_BANNER = process.env.NEXT_PUBLIC_DEFAULT_BANNER || `${SITE_URL}/api/og`;

// Used when the Strapi theme can't be loaded or a colour is unset; keep in sync with the CMS values
export const DEFAULT_THEME_COLORS = { primaryDark: "#607304", primaryLight: "#bf2821" } as const;

// Hex colours that globals.css uses as --primary in the dark and light themes
export function themeColorVariables(colors: { primaryDark: string; primaryLight: string }) {
  return {
    "--primary-dark": colors.primaryDark,
    "--primary-light": colors.primaryLight,
  } as CSSProperties;
}
