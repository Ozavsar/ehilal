export const appColors = Object.freeze({
  "brand-dark": "#ffb400",
  "brand-light": "#72b626",
  "brand-light-text": "#666666",
})

export type ColorKeys = keyof typeof appColors
export type ColorValues = typeof appColors[ColorKeys]

export type Colors = Record<ColorKeys, ColorValues>