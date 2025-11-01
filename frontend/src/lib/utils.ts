import { twMerge } from "tailwind-merge";
import slugify, { slugifyWithCounter } from "@sindresorhus/slugify";
import { type ClassValue, clsx } from "clsx";
import type { Page } from "puppeteer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateDescription(description: string): string {
  const words = description.split(/\s+/);
  if (words.length <= 20) {
    return description;
  }
  return words.slice(0, 20).join(" ") + "...";
}

export function generateSlug(title: string) {
  const slug = title
    .toLowerCase() // Convert the title to lowercase
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^\w\-]+/g, "") // Remove non-word characters except dashes
    .replace(/\-\-+/g, "-") // Replace multiple consecutive dashes with a single dash
    .replace(/^\-+/, "") // Remove dashes from the beginning
    .replace(/\-+$/, ""); // Remove dashes from the end
  return slug;
}

export async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        const scrollHeight = document.body.scrollHeight;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 350);
    });
  });
}

export function getCleanSlug(input: string, useCounter = false): string {
  const slugifyCounter = slugifyWithCounter();
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input;
  }
  decoded = decoded.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  if (!useCounter) {
    return slugify(decoded, { lowercase: true, locale: "tr" });
  }

  return slugifyCounter(decoded, { lowercase: true, locale: "tr" });
}
