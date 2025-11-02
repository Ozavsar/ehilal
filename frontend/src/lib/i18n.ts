import "server-only";
import type { Locale } from "@/config/constants/i18n";
import * as deepl from "deepl-node";

const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API_KEY!);

/* export async function translate<T extends Object>(
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
    translated[key] = dictionary[pagePath][key] || toBeTranslated[key];
  }
  return translated;
} */

export async function translateDeepl<T extends Object>(
  content: T,
  keys: string[],
  locale: Locale,
) {
  const toBeTranslated: Partial<T> = {};
  keys.forEach((key) => {
    toBeTranslated[key] = content[key] || "";
  });
  const translatedTextArray = await deeplClient.translateText(
    Object.values(toBeTranslated),
    "en",
    locale as deepl.TargetLanguageCode,
  );

  const translated: T = { ...content };
  for (const [index, key] of Object.entries(toBeTranslated)) {
    translated[key] = translatedTextArray[index] || toBeTranslated[key];
  }
  return translated;
}
