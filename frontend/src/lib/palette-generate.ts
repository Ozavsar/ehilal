// The theme preview bar's in-browser copy of backend/src/utils/m3-palette.ts; import on demand only
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
