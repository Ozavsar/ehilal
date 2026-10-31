import type { Core } from "@strapi/strapi";
import { applyAdminFieldLabels } from "./utils/admin-field-labels";
import { registerThemePalette, scheduleThemePaletteBackfill } from "./utils/theme-palette";
import { registerBlurPlaceholders } from "./utils/upload-blur";

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Custom field for theme.palette; its admin input is registered in src/admin/app.tsx
    strapi.customFields.register({ name: "m3-palette", type: "json" });
    registerThemePalette(strapi);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    registerBlurPlaceholders(strapi);
    scheduleThemePaletteBackfill(strapi);
    await applyAdminFieldLabels(strapi);
  },
};
