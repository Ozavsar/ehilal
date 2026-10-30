import { z } from "zod";
import { ROLES, SCHEMES, type Palette, type Role, type SchemeName } from "@/lib/palette-css";

export * from "@/lib/palette-css";

// Only plain 6-digit hex: the values are written into a <style> element unescaped
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

const schemeSchema = z.object(
  Object.fromEntries(ROLES.map((role) => [role, hex])) as Record<Role, typeof hex>,
);

export const paletteSchema = z.object({
  version: z.literal(1),
  source: z.object({
    type: z.enum(["color", "image"]),
    seed: hex,
    imageId: z.number().nullish(),
  }),
  options: z.object({
    variant: z.string(),
    specVersion: z.string(),
  }),
  schemes: z.object(
    Object.fromEntries(SCHEMES.map((name) => [name, schemeSchema])) as Record<
      SchemeName,
      typeof schemeSchema
    >,
  ),
});

/** A palette from Strapi, or null when it is missing or doesn't match the contract. */
export function parsePalette(value: unknown): Palette | null {
  const parsed = paletteSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
