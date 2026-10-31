import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tailwindCanonicalClasses from "eslint-plugin-tailwind-canonical-classes";

export default defineConfig([
  {
    extends: [...nextCoreWebVitals],
  },
  // Non-canonical Tailwind classes (e.g. `w-[16px]` → `w-4`); `yarn tw:fix` applies the fixes
  ...tailwindCanonicalClasses.configs["flat/recommended"],
  {
    rules: {
      "tailwind-canonical-classes/tailwind-canonical-classes": [
        "warn",
        { cssPath: "./src/app/globals.css" },
      ],
    },
  },
]);
