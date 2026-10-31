import { extendTailwindMerge } from "tailwind-merge";
import slugify, { slugifyWithCounter } from "@sindresorhus/slugify";
import { type ClassValue, clsx } from "clsx";

// The M3 type roles (@utility type-* in globals.css), one class group: the last role wins
const M3_TYPE_ROLES = ["display", "headline", "title", "body", "label"].flatMap((role) =>
  ["large", "medium", "small"].map((size) => `${role}-${size}`),
);

// Custom @theme tokens from globals.css: unregistered names count as colours (text-backdrop would
// drop text-on-surface-variant). The M3 colour roles need no entry.
const twMerge = extendTailwindMerge<"m3-type">({
  extend: {
    theme: {
      text: ["backdrop", "numeral"],
      tracking: ["backdrop"],
      radius: ["lg-increased", "xl-increased"],
      shadow: [
        "elevation-0",
        "elevation-1",
        "elevation-2",
        "elevation-3",
        "elevation-4",
        "elevation-5",
      ],
      spacing: ["rail", "nav-bar"],
      container: ["content"],
      ease: [
        "standard",
        "standard-decelerate",
        "standard-accelerate",
        "emphasized",
        "emphasized-decelerate",
        "emphasized-accelerate",
        "legacy",
        "legacy-decelerate",
        "legacy-accelerate",
      ],
      animate: [
        "hero-in",
        "m3-fade-enter",
        "m3-fade-exit",
        "m3-scrim-enter",
        "m3-scrim-exit",
        "m3-fade-through-enter",
        "m3-fade-through-exit",
        "m3-shared-axis-x-enter",
        "m3-shared-axis-x-exit",
        "m3-shared-axis-y-enter",
        "m3-shared-axis-y-exit",
        "m3-shared-axis-z-enter",
        "m3-shared-axis-z-exit",
      ],
    },
    classGroups: {
      "m3-type": [{ type: M3_TYPE_ROLES }],
    },
    // A type role replaces earlier size/weight/leading/tracking classes; later ones still apply
    conflictingClassGroups: {
      "m3-type": ["font-size", "font-weight", "leading", "tracking"],
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
