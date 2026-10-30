import { extendTailwindMerge } from "tailwind-merge";
import slugify, { slugifyWithCounter } from "@sindresorhus/slugify";
import { type ClassValue, clsx } from "clsx";

// The custom @theme tokens in globals.css. Unknown text-* names would otherwise be read as
// colours (text-backdrop would drop text-muted-foreground). "2xs" already counts as a size.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["page-title", "backdrop"],
      tracking: ["backdrop"],
      radius: ["card"],
      spacing: ["page-gutter", "bar-offset", "hero-inset"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlugCounter() {
  return slugifyWithCounter();
}

export function getCleanSlug(
  input: string,
  slugCounter?: ReturnType<typeof slugifyWithCounter>,
): string {
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input;
  }

  decoded = decoded.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  if (!slugCounter) {
    return slugify(decoded, { lowercase: true, locale: "tr" });
  }

  return slugCounter(decoded, { lowercase: true, locale: "tr" });
}
