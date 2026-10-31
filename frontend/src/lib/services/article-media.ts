import { unstable_cache } from "next/cache";

// HEAD checks on article media, cached a week per URL (an edited image gets a new id)
const REVALIDATE = 7 * 24 * 60 * 60;
const TIMEOUT_MS = 5000;

const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";

// Network errors throw, and unstable_cache doesn't keep a thrown result: the next render retries
const headRequest = unstable_cache(
  async (url: string) => {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { status: res.status, contentType: res.headers.get("content-type") ?? "" };
  },
  ["article-media-head"],
  { revalidate: REVALIDATE },
);

async function head(url: string) {
  try {
    return await headRequest(url);
  } catch (error) {
    console.warn(`Media check failed for ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Medium images its CDN can't convert: GIFs, also ones stored without a .gif extension (served as
 * the original bytes). A failed check counts as a normal image.
 */
export async function getUnconvertedMediumImages(imageIds: string[]): Promise<Set<string>> {
  const unconverted = new Set(imageIds.filter((id) => /\.gif$/i.test(id)));
  const unknown = [...new Set(imageIds.filter((id) => !/\.\w{3,4}$/.test(id)))];
  const results = await Promise.all(
    unknown.map((id) => head(`${MEDIUM_IMAGE_URL}/resize:fit:744/format:webp/${id}`)),
  );
  results.forEach((result, index) => {
    const id = unknown[index];
    if (id && result && result.status < 400 && !result.contentType.startsWith("image/webp")) {
      unconverted.add(id);
    }
  });
  return unconverted;
}

/** The URLs that answer 404 or 410 (media taken down at the source) */
export async function getRemovedUrls(urls: string[]): Promise<Set<string>> {
  const unique = [...new Set(urls)];
  const results = await Promise.all(unique.map(head));
  return new Set(
    unique.filter((_, index) => {
      const status = results[index]?.status;
      return status === 404 || status === 410;
    }),
  );
}
