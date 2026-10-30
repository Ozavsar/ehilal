import type { Core } from "@strapi/strapi";
import { applyAdminFieldLabels } from "./utils/admin-field-labels";
import { registerThemePalette, scheduleThemePaletteBackfill } from "./utils/theme-palette";
import { registerBlurPlaceholders } from "./utils/upload-blur";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Theme palette JSON, shown as a preview in the admin (src/admin/app.tsx registers the input)
    strapi.customFields.register({ name: "m3-palette", type: "json" });
    // Generates the theme palette on every save
    registerThemePalette(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Blur placeholders for uploaded images, used by the frontend
    registerBlurPlaceholders(strapi);
    // Palettes for theme versions saved before the palette existed
    scheduleThemePaletteBackfill(strapi);
    // Turkish field labels and help texts in the admin (never throws)
    await applyAdminFieldLabels(strapi);
  },
};
