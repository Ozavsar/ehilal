import "server-only";
import { unstable_cache } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getPlaiceholder } from "plaiceholder";
import { getStrapiURL } from "./api/fetchAPI";
import type { IImage } from "@/types";

// A 10px blur doesn't need more than a thumbnail. Known image CDNs serve resized variants by URL;
// other URLs (e.g. Strapi, see getStrapiBlurDataURL) are used as they are.
function getSmallVariantURL(src: string): string {
  // Medium: https://miro.medium.com/v2/da:true/<image id>
  const medium = /^https:\/\/miro\.medium\.com\/v2\/(?:da:true\/)?([^/]+)$/.exec(src);
  if (medium) return `https://miro.medium.com/v2/da:true/resize:fit:40/${medium[1]}`;

  // Substack: https://substackcdn.com/image/fetch/<transformations>/<encoded source URL>
  const substack = /^https:\/\/substackcdn\.com\/image\/fetch\/[^/]+\/(https?%3A[^/]+)$/i.exec(src);
  if (substack) return `https://substackcdn.com/image/fetch/w_40,c_limit,f_jpg/${substack[1]}`;

  // Udemy: https://img-c.udemycdn.com/course/480x270/<file>
  const udemy = /^https:\/\/img-c\.udemycdn\.com\/course\/[^/]+\/([^/]+)$/.exec(src);
  if (udemy) return `https://img-c.udemycdn.com/course/125_H/${udemy[1]}`;

  // YouTube: https://i.ytimg.com/vi/<video id>/maxresdefault.jpg (also hq/sd/default, _live)
  const youtube = /^https:\/\/i\.ytimg\.com\/vi\/([^/]+)\/[a-z]*default(_live)?\.jpg$/.exec(src);
  if (youtube) return `https://i.ytimg.com/vi/${youtube[1]}/mqdefault${youtube[2] ?? ""}.jpg`;

  return src;
}

async function createBlurDataURL(src: string): Promise<string> {
  const url = src.startsWith("/") ? getStrapiURL(src) : src;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  const { base64 } = await getPlaiceholder(buffer, { size: 10 });
  return base64;
}

// The placeholder of an image URL never changes, so it is kept in the Next.js data cache with no
// expiry: across requests, ISR refreshes and deploys (.next/cache survives them). Failures aren't cached.
const getCachedBlurDataURL = unstable_cache(createBlurDataURL, ["blur-data-url"], {
  revalidate: false,
});

/**
 * Blur placeholder (base64 data URL) for an image, or undefined when it can't be built: the
 * placeholder is cosmetic, so a broken image only loses it.
 */
export async function getBlurDataURL(src: string): Promise<string | undefined> {
  const smallSrc = getSmallVariantURL(src);
  try {
    return await getCachedBlurDataURL(smallSrc);
  } catch (error) {
    unstable_rethrow(error);
    console.error(`Failed to create a blur placeholder for ${smallSrc}:`, error);
    return undefined;
  }
}

/**
 * Blur placeholder for a Strapi image, built from its smallest generated format. Strapi only
 * generates formats smaller than the original (none for small images, SVGs and GIFs).
 */
export function getStrapiBlurDataURL(image: Pick<IImage, "url" | "formats">) {
  return getBlurDataURL(image.formats?.thumbnail?.url ?? image.formats?.small?.url ?? image.url);
}

/**
 * Adds a blur placeholder to each item with an image. Call it on the items that are rendered
 * (after pagination), never on whole lists, sitemaps or generateStaticParams.
 */
export function withBlurDataURLs<T extends { blurDataURL?: string }>(
  items: T[],
  getSrc: (item: T) => string | null | undefined,
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      const src = getSrc(item);
      const blurDataURL = src ? await getBlurDataURL(src) : undefined;
      return blurDataURL ? { ...item, blurDataURL } : item;
    }),
  );
}
