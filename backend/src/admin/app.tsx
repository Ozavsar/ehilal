import type { StrapiApp } from "@strapi/strapi/admin";
import type { ComponentType } from "react";
import {
  THEME_CHOICE_EVENT,
  THEME_CHOICE_MESSAGE,
  THEME_CHOICE_STORAGE_KEY,
  parseThemeChoice,
} from "./m3-palette/palette";

// The website's theme preview bar (inside Strapi Preview's iframe) posts the colour chosen there.
// The preview page doesn't mount the edit form, so the choice is kept in sessionStorage until the
// Theme's palette field offers to apply it. Only messages from a frame on this page are accepted.
const receiveThemeChoice = (event: MessageEvent) => {
  if ((event.data as { type?: unknown } | null)?.type !== THEME_CHOICE_MESSAGE) return;
  const fromPreviewFrame = Array.from(document.querySelectorAll("iframe")).some(
    (frame) => frame.contentWindow === event.source,
  );
  const choice = parseThemeChoice(event.data);
  if (!fromPreviewFrame || !choice) return;
  try {
    sessionStorage.setItem(THEME_CHOICE_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(THEME_CHOICE_EVENT));
};

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    // Same name as the server registration in src/index.ts → uid `global::m3-palette`.
    app.customFields.register({
      name: "m3-palette",
      type: "json",
      intlLabel: { id: "m3-palette.label", defaultMessage: "Palette" },
      intlDescription: {
        id: "m3-palette.description",
        defaultMessage:
          "Material 3 palette generated from the seed colour and variant; try colours in the preview",
      },
      components: {
        Input: async () =>
          import("./m3-palette/PaletteInput").then((module) => ({
            // The registry types inputs without props; the content-manager passes the field props at runtime.
            default: module.PaletteInput as unknown as ComponentType,
          })),
      },
    });
  },
  bootstrap() {
    window.addEventListener("message", receiveThemeChoice);
  },
};
