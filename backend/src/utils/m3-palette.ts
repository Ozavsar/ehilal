import {
  argbFromHex,
  argbFromRgb,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  QuantizerCelebi,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  Score,
} from "@material/material-color-utilities";
import sharp from "sharp";

/**
 * Material 3 colour palette for the site theme: a seed colour and a variant become six schemes
 * (light/dark x standard/medium/high contrast) of the 47 colour roles, stored as the theme's
 * `palette` JSON and read by the frontend. Pure helpers, no Strapi dependency (see
 * theme-palette.ts for the wiring). Must produce exactly what frontend/src/config/default-palette.json
 * holds for the same input (`yarn palette:default` regenerates that file).
 */

// Bump when the generated output changes for the same input, so stored palettes are regenerated
export const PALETTE_VERSION = 1;
// Material colour spec the schemes follow; a code constant, not an editor setting
export const SPEC_VERSION = "2021";
export const DEFAULT_SEED = "#bf2821";
export const DEFAULT_VARIANT = "tonal_spot";

export const SOURCE_TYPES = ["color", "image"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

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
// Same order as the Strapi enumeration
export const VARIANTS = Object.keys(SCHEME_CLASSES) as Variant[];

// [name, isDark, contrast level]
const SCHEMES = [
  ["light", false, 0],
  ["light-medium-contrast", false, 0.5],
  ["light-high-contrast", false, 1],
  ["dark", true, 0],
  ["dark-medium-contrast", true, 0.5],
  ["dark-high-contrast", true, 1],
] as const;
export type SchemeName = (typeof SCHEMES)[number][0];
export const SCHEME_NAMES = SCHEMES.map(([name]) => name);

export type PaletteScheme = Record<Role, string>;

export interface PaletteSource {
  type: SourceType;
  seed: string;
  imageId: number | null;
  // Image sources only: which file content the candidates were read from (see theme-palette.ts)
  imageFingerprint?: string;
}

export interface Palette {
  version: number;
  source: PaletteSource;
  options: { variant: Variant; specVersion: typeof SPEC_VERSION };
  schemes: Record<SchemeName, PaletteScheme>;
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const NORMALIZED_HEX = /^#[0-9a-f]{6}$/;

export const isVariant = (value: unknown): value is Variant =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(SCHEME_CLASSES, value);

export const isSourceType = (value: unknown): value is SourceType =>
  typeof value === "string" && (SOURCE_TYPES as readonly string[]).includes(value);

/** "#rgb" or "#rrggbb", any case: what the colour picker field accepts. */
export const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX_COLOR.test(value);

/** Lowercase "#rrggbb". */
export const normalizeHex = (hex: string): string => hexFromArgb(argbFromHex(hex));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const dynamicColors = new MaterialDynamicColors();

export interface GeneratePaletteOptions {
  seed: string;
  variant?: Variant;
  source?: { type: SourceType; imageId?: number | null; imageFingerprint?: string };
}

/**
 * Seed + variant -> the palette JSON. Role values are the library's dynamic colours, as in the
 * Material Theme Builder.
 */
export function generatePalette({
  seed,
  variant = DEFAULT_VARIANT,
  source = { type: "color" },
}: GeneratePaletteOptions): Palette {
  if (!isHexColor(seed)) throw new Error(`Invalid seed colour: ${seed}`);
  if (!isVariant(variant)) throw new Error(`Unknown palette variant: ${variant}`);

  const hct = Hct.fromInt(argbFromHex(seed));
  const Scheme = SCHEME_CLASSES[variant];
  const schemes = {} as Record<SchemeName, PaletteScheme>;
  for (const [name, isDark, contrast] of SCHEMES) {
    const scheme = new Scheme(hct, isDark, contrast, SPEC_VERSION);
    const colors = {} as PaletteScheme;
    for (const role of ROLES) colors[role] = hexFromArgb(dynamicColors[role]().getArgb(scheme));
    schemes[name] = colors;
  }

  return {
    version: PALETTE_VERSION,
    source: {
      type: source.type,
      seed: normalizeHex(seed),
      imageId: source.imageId ?? null,
      ...(source.imageFingerprint ? { imageFingerprint: source.imageFingerprint } : {}),
    },
    options: { variant, specVersion: SPEC_VERSION },
    schemes,
  };
}

/**
 * Identifies the input a palette was generated from: equal fingerprints mean equal palettes.
 */
export function getPaletteFingerprint(palette: Pick<Palette, "version" | "source" | "options">) {
  const { version, source, options } = palette;
  return JSON.stringify([
    version,
    source.type,
    source.seed,
    source.imageId,
    source.imageFingerprint ?? null,
    options.variant,
    options.specVersion,
  ]);
}

/**
 * Whether a stored value is a complete palette (every scheme with every role as "#rrggbb").
 */
export function isPalette(value: unknown): value is Palette {
  if (!isRecord(value) || !isRecord(value.source) || !isRecord(value.options)) return false;
  if (!isRecord(value.schemes) || typeof value.version !== "number") return false;
  const { source, options, schemes } = value;
  if (!isSourceType(source.type) || typeof source.seed !== "string") return false;
  if (source.imageId !== null && typeof source.imageId !== "number") return false;
  if (!isVariant(options.variant) || options.specVersion !== SPEC_VERSION) return false;
  return SCHEME_NAMES.every((name) => {
    const scheme = schemes[name];
    return (
      isRecord(scheme) &&
      ROLES.every((role) => typeof scheme[role] === "string" && NORMALIZED_HEX.test(scheme[role]))
    );
  });
}

/** Whether a stored value is a list of candidate colours. */
export const isCandidateList = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((color) => typeof color === "string" && NORMALIZED_HEX.test(color));

// The quantizer works on a small copy: enough for the dominant colours, fast on any upload
const CANDIDATE_IMAGE_SIZE = 128;
const QUANTIZER_COLORS = 128;
// Never an image colour: every pixel passed to the quantizer is opaque (alpha 0xff)
const NO_COLOR = 0;

/**
 * Up to `max` seed candidates from an image, best first, picked like the Material Theme Builder
 * does (Celebi quantizer + Score). An image with no colourful area (a grey photo) still gives its
 * dominant greys instead of the library's fallback blue. Empty when the image has no opaque pixel.
 */
export async function extractCandidates(image: Buffer, max = 4): Promise<string[]> {
  const { data } = await sharp(image)
    .rotate()
    .resize(CANDIDATE_IMAGE_SIZE, CANDIDATE_IMAGE_SIZE, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    // Transparent pixels are skipped, as in the library's sourceColorFromImageBytes
    if (data[i + 3] < 255) continue;
    pixels.push(argbFromRgb(data[i], data[i + 1], data[i + 2]));
  }
  if (pixels.length === 0) return [];

  const quantized = QuantizerCelebi.quantize(pixels, QUANTIZER_COLORS);
  let scored = Score.score(quantized, { desired: max, fallbackColorARGB: NO_COLOR });
  if (scored.length === 1 && scored[0] === NO_COLOR) {
    scored = Score.score(quantized, { desired: max, fallbackColorARGB: NO_COLOR, filter: false });
  }
  return scored.filter((argb) => argb !== NO_COLOR).map((argb) => hexFromArgb(argb));
}
