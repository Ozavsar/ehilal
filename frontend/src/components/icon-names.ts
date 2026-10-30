// Every Material Symbol the site renders. The icon font is a subset of exactly these glyphs, so a
// name has to be added here (then `yarn icons:subset`) before <Icon> can use it.
// Keep the list sorted, one double-quoted name per line: scripts/icons-subset.mjs parses it.
export const ICON_NAMES = [
  "arrow_back",
  "arrow_forward",
  "arrow_outward",
  "article",
  "check_circle",
  "close",
  "co_present",
  "dark_mode",
  "error",
  "fullscreen",
  "group",
  "home",
  "language",
  "light_mode",
  "local_fire_department",
  "location_on",
  "mail",
  "menu_book",
  "open_in_new",
  "picture_as_pdf",
  "play_arrow",
  "play_circle",
  "podium",
  "school",
  "smart_display",
  "star",
  "toc",
  "zoom_in",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
