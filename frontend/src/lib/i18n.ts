import "server-only";
import type { Locale } from "@/i18n-config";

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  tr: () => import("../dictionaries/tr.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();

export async function translate<T extends Object>(
  content: T,
  keys: string[],
  locale: Locale,
  pagePath: string,
) {
  const toBeTranslated: Partial<T> = {};
  keys.forEach((key) => {
    toBeTranslated[key] = content[key] || "";
  });
  const dictionary = await getDictionary(locale);

  const translated: T = { ...content };
  for (const key in toBeTranslated) {
    translated[key] =
      dictionary[pagePath][toBeTranslated[key]] || toBeTranslated[key];
  }
  return translated;
}
