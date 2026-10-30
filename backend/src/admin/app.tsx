import type { StrapiApp } from "@strapi/strapi/admin";
import type { ComponentType } from "react";

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
          "Material 3 palette generated from the seed colour and variant (preview only)",
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
};
