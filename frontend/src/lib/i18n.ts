import "server-only";
import type { Locale } from "@/config/constants/i18n";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import * as deepl from "deepl-node";
import z from "zod";

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
    (locale === "en" ? "en-US" : locale) as deepl.TargetLanguageCode,
  );

  const translated: T = { ...content };
  keys.forEach((key, index) => {
    translated[key] = translatedTextArray[index].text || toBeTranslated[key];
  });
  return translated;
}

export async function translateOpenAI<T extends Object | string[]>({
  content,
  keys = [],
  locale,
}: {
  content: T;
  locale: Locale;
  keys: string[];
}) {
  let toBeTranslatedArray: T | string[] = {} as T;
  if (Array.isArray(content)) {
    toBeTranslatedArray = [...content];
  } else if (!Array.isArray(content) && keys.length > 0) {
    keys.forEach((key) => {
      toBeTranslatedArray[key] = content[key] || "";
    });
  } else {
    throw new Error("Content must be an array or keys must be provided.");
  }
  const translatedTextArrayResponse = await generateObject({
    model: openai("gpt-5-mini"),
    schema: z.object({
      result: z.array(z.string()),
    }),
    system:
      "You are a professional translator. Your translation should sound natural. You translate the array of texts given accurately and without changing the order and the length, and you respond with the translated array and nothing more.",
    prompt: `Translate the following array to ${locale}:\n\n${toBeTranslatedArray}`,
    maxOutputTokens: 1000,
  });

  console.log(translatedTextArrayResponse.object.result);

  const translated: T = { ...content };
  keys.forEach((key, index) => {
    translated[key] = translatedTextArrayResponse.object.result[index] || "";
  });
  return translated;
}
