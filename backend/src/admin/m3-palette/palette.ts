// Browser-side preview of the M3 palette. Mirrors the server generator (src/utils/m3-palette.ts):
// same roles, variants, spec version and contrast levels. The stored `theme.palette` stays the source of truth.
import {
  Hct,
  MaterialDynamicColors,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
  lstarFromArgb,
} from "@material/material-color-utilities";

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
] as const satisfies readonly (keyof MaterialDynamicColors)[];

export type Role = (typeof ROLES)[number];
export type Scheme = Record<Role, string>;

const SCHEME_CLASSES = {
  tonal_spot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
  content: SchemeContent,
  neutral: SchemeNeutral,
  rainbow: SchemeRainbow,
  fruit_salad: SchemeFruitSalad,
  monochrome: SchemeMonochrome,
};

export type Variant = keyof typeof SCHEME_CLASSES;

export const DEFAULT_VARIANT: Variant = "tonal_spot";

export const isVariant = (value: unknown): value is Variant =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(SCHEME_CLASSES, value);

// Same constant as the server generator; not editable in the panel.
const SPEC_VERSION = "2021";

// The schemes the preview shows (medium contrast is stored but not used by the site).
export const PREVIEW_SCHEMES = {
  light: { isDark: false, contrast: 0 },
  "light-high-contrast": { isDark: false, contrast: 1 },
  dark: { isDark: true, contrast: 0 },
  "dark-high-contrast": { isDark: true, contrast: 1 },
} as const;

export type PreviewSchemeName = keyof typeof PREVIEW_SCHEMES;
export type PreviewSchemes = Record<PreviewSchemeName, Scheme>;

const PREVIEW_SCHEME_NAMES = Object.keys(PREVIEW_SCHEMES) as PreviewSchemeName[];

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#RGB` / `#RRGGBB` → lowercase `#rrggbb`, or null when the value isn't a valid hex colour. */
export const normalizeHex = (value: unknown): string | null =>
  typeof value === "string" && HEX_PATTERN.test(value.trim())
    ? hexFromArgb(argbFromHex(value.trim()))
    : null;

const dynamicColors = new MaterialDynamicColors();

export const generatePreviewSchemes = (seed: string, variant: Variant): PreviewSchemes => {
  const sourceColor = Hct.fromInt(argbFromHex(seed));
  const SchemeClass = SCHEME_CLASSES[variant];
  const entries = PREVIEW_SCHEME_NAMES.map((name) => {
    const { isDark, contrast } = PREVIEW_SCHEMES[name];
    const scheme = new SchemeClass(sourceColor, isDark, contrast, SPEC_VERSION);
    const roles = Object.fromEntries(
      ROLES.map((role) => [role, hexFromArgb(dynamicColors[role]().getArgb(scheme))]),
    ) as Scheme;
    return [name, roles] as const;
  });
  return Object.fromEntries(entries) as PreviewSchemes;
};

interface StoredPalette {
  seed: string | null;
  variant: Variant | null;
  schemes: PreviewSchemes;
}

const isScheme = (value: unknown): value is Scheme =>
  typeof value === "object" &&
  value !== null &&
  ROLES.every((role) => normalizeHex((value as Record<string, unknown>)[role]) !== null);

/** Reads the stored palette JSON leniently; null when it is missing or malformed. */
export const parseStoredPalette = (value: unknown): StoredPalette | null => {
  let data = value;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) return null;
  const { source, options, schemes } = data as {
    source?: { seed?: unknown };
    options?: { variant?: unknown };
    schemes?: Record<string, unknown>;
  };
  if (!schemes || !PREVIEW_SCHEME_NAMES.every((name) => isScheme(schemes[name]))) return null;
  return {
    seed: normalizeHex(source?.seed),
    variant: isVariant(options?.variant) ? options.variant : null,
    schemes: Object.fromEntries(
      PREVIEW_SCHEME_NAMES.map((name) => [name, schemes[name] as Scheme]),
    ) as PreviewSchemes,
  };
};

/** Black or white text, whichever reads better on the given colour. */
export const readableTextOn = (hex: string): string =>
  lstarFromArgb(argbFromHex(hex)) >= 50 ? "#000000" : "#ffffff";
