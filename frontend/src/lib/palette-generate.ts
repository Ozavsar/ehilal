// Browser-side palette generation for the theme preview bar: the light and dark schemes exactly as
// the Strapi generator (backend/src/utils/m3-palette.ts) writes them — same roles, spec version and
// standard contrast. Only the preview bar imports it, on demand, so it stays out of the site bundle.
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
} from "@material/material-color-utilities";
import { ROLES, type Scheme } from "@/lib/palette-css";
import type { ThemeVariant } from "@/types";

const SCHEME_CLASSES: Record<ThemeVariant, typeof SchemeTonalSpot> = {
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

// Same constant as the server generator
const SPEC_VERSION = "2021";

const dynamicColors = new MaterialDynamicColors();

export function generateSchemes(
  seed: string,
  variant: ThemeVariant,
): { light: Scheme; dark: Scheme } {
  const source = Hct.fromInt(argbFromHex(seed));
  const SchemeClass = SCHEME_CLASSES[variant];
  const build = (isDark: boolean) => {
    const scheme = new SchemeClass(source, isDark, 0, SPEC_VERSION);
    return Object.fromEntries(
      ROLES.map((role) => [role, hexFromArgb(dynamicColors[role]().getArgb(scheme))]),
    ) as Scheme;
  };
  return { light: build(false), dark: build(true) };
}
