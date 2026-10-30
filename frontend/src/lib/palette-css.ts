import defaultPaletteJson from "@/config/default-palette.json";

// Palette types, the default palette and the CSS output, without zod: global-error.tsx (a Client
// Component) uses them. Server code reads palettes through lib/palette.ts, which validates them.

// Material 3 colour roles, in the order the Strapi generator writes them (backend/src/utils/m3-palette.ts)
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

// The JSON Strapi stores in theme.palette (backend/src/utils/m3-palette.ts writes it)
export interface Palette {
  version: 1;
  source: { type: "color" | "image"; seed: string; imageId?: number | null };
  options: { variant: string; specVersion: string };
  schemes: Record<SchemeName, Scheme>;
}

/**
 * Generated from the default seed (`yarn palette:default` in backend/); used whenever Strapi has no
 * valid palette. Cast, not parsed, to keep zod out of the client: the file is generated, not edited.
 */
export const DEFAULT_PALETTE = defaultPaletteJson as Palette;

const schemeVars = (scheme: Scheme) =>
  ROLES.map((role) => `--m3-${kebab(role)}:${scheme[role].toLowerCase()};`).join("");

/** The light and dark schemes as CSS custom properties: light on :root, dark on .dark (next-themes). */
export const schemesToCss = (light: Scheme, dark: Scheme) =>
  `:root{${schemeVars(light)}}.dark{${schemeVars(dark)}}`;

/**
 * The palette as CSS custom properties: light on :root, dark on .dark (next-themes), and the
 * high-contrast schemes when the OS asks for more contrast. Medium contrast is not emitted yet.
 * Only call it with DEFAULT_PALETTE or a palette that passed parsePalette(): values are not escaped.
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
