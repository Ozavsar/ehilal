// Helpers for the palette field. The palette itself is generated on the server
// (src/utils/m3-palette.ts) when the theme is saved; the field only reads its seed and variant.

export const VARIANTS = [
  "tonal_spot",
  "vibrant",
  "expressive",
  "fidelity",
  "content",
  "neutral",
  "rainbow",
  "fruit_salad",
  "monochrome",
] as const;

export type Variant = (typeof VARIANTS)[number];

export const DEFAULT_VARIANT: Variant = "tonal_spot";

export const isVariant = (value: unknown): value is Variant =>
  typeof value === "string" && (VARIANTS as readonly string[]).includes(value);

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `#RGB` / `#RRGGBB` → lowercase `#rrggbb`, or null when the value isn't a valid hex colour. */
export const normalizeHex = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const match = HEX_PATTERN.exec(value.trim());
  if (!match?.[1]) return null;
  const digits = match[1].length === 3 ? match[1].replace(/./g, "$&$&") : match[1];
  return `#${digits.toLowerCase()}`;
};

/** The seed and variant the stored palette was generated from; null when it is missing or malformed. */
export const parseStoredSource = (
  value: unknown,
): { seed: string | null; variant: Variant | null } | null => {
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
    schemes?: unknown;
  };
  if (typeof schemes !== "object" || schemes === null) return null;
  return {
    seed: normalizeHex(source?.seed),
    variant: isVariant(options?.variant) ? options.variant : null,
  };
};

/** postMessage type the website's theme preview bar sends (frontend components/theme-preview-bar.tsx) */
export const THEME_CHOICE_MESSAGE = "ehilal:theme-choice";
/** sessionStorage key app.tsx keeps the last choice in until the palette field applies or dismisses it */
export const THEME_CHOICE_STORAGE_KEY = "m3-theme-choice";
/** Window event app.tsx dispatches when a new choice arrives while the field is mounted */
export const THEME_CHOICE_EVENT = "m3-theme-choice";

export interface ThemeChoice {
  seed: string;
  variant: Variant;
}

/** A valid `{ seed, variant }`, or null */
export const parseThemeChoice = (value: unknown): ThemeChoice | null => {
  if (typeof value !== "object" || value === null) return null;
  const { seed, variant } = value as { seed?: unknown; variant?: unknown };
  const hex = normalizeHex(seed);
  return hex && isVariant(variant) ? { seed: hex, variant } : null;
};

export const readStoredChoice = (): ThemeChoice | null => {
  try {
    return parseThemeChoice(JSON.parse(sessionStorage.getItem(THEME_CHOICE_STORAGE_KEY) ?? "null"));
  } catch {
    return null;
  }
};

export const clearStoredChoice = () => {
  try {
    sessionStorage.removeItem(THEME_CHOICE_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear
  }
};
