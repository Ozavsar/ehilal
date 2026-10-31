import defaultPaletteJson from "@/config/default-palette.json";

// Palette types and CSS output without zod, so Client Components (global-error.tsx) can use them

// Material 3 colour roles, in the order backend/src/utils/m3-palette.ts writes them
export const ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "primaryFixed",
  "primaryFixedDim",
  "onPrimaryFixed",
  "onPrimaryFixedVariant",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "secondaryFixed",
  "secondaryFixedDim",
  "onSecondaryFixed",
  "onSecondaryFixedVariant",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "tertiaryFixed",
  "tertiaryFixedDim",
  "onTertiaryFixed",
  "onTertiaryFixedVariant",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceDim",
  "surfaceBright",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
  "shadow",
  "scrim",
  "surfaceTint",
] as const;

export type Role = (typeof ROLES)[number];

export const SCHEMES = [
  "light",
  "light-medium-contrast",
  "light-high-contrast",
  "dark",
  "dark-medium-contrast",
  "dark-high-contrast",
] as const;

export type SchemeName = (typeof SCHEMES)[number];

/** camelCase role → kebab-case CSS name (onSurfaceVariant → on-surface-variant) */
export const kebab = (role: string) => role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export type Scheme = Record<Role, string>;

// The JSON Strapi stores in theme.palette
export interface Palette {
  version: 1;
  source: { type: "color" | "image"; seed: string; imageId?: number | null };
  options: { variant: string; specVersion: string };
  schemes: Record<SchemeName, Scheme>;
}

/**
 * Fallback when Strapi has no valid palette (`yarn palette:default` in backend/). Cast, not parsed,
 * to keep zod out of the client.
 */
export const DEFAULT_PALETTE = defaultPaletteJson as Palette;

const schemeVars = (scheme: Scheme) =>
  ROLES.map((role) => `--m3-${kebab(role)}:${scheme[role].toLowerCase()};`).join("");

/** Light scheme on :root, dark on .dark (next-themes), as CSS custom properties */
export const schemesToCss = (light: Scheme, dark: Scheme) =>
  `:root{${schemeVars(light)}}.dark{${schemeVars(dark)}}`;

/**
 * schemesToCss plus the high-contrast schemes under prefers-contrast: more. Values are not escaped:
 * pass only DEFAULT_PALETTE or a palette that passed parsePalette().
 */
export function paletteToCss(palette: Palette): string {
  const { schemes } = palette;
  return (
    schemesToCss(schemes.light, schemes.dark) +
    `@media (prefers-contrast: more){` +
    `:root{${schemeVars(schemes["light-high-contrast"])}}` +
    `.dark{${schemeVars(schemes["dark-high-contrast"])}}` +
    `}`
  );
}
