import { z } from "zod";
import { env } from "@/config/env";
import type { IVideoPreview } from "@/types";

// YouTube Data API v3 over plain fetch, so responses go through the Next.js data cache
const API_URL = "https://www.googleapis.com/youtube/v3";
const REVALIDATE = 60 * 60; // 1 hour
// Same tag as the Strapi videos, so the Strapi webhook refreshes the whole list
const CACHE_TAGS = ["videos"];
const PAGE_SIZE = 50; // API maximum for playlistItems and videos
// Uploads are followed through nextPageToken up to this many pages (200 videos)
const MAX_UPLOAD_PAGES = 4;

const thumbnailSchema = z.object({ url: z.string() }).nullish();
// Not every size exists for every video
const thumbnailsSchema = z
  .object({
    maxres: thumbnailSchema,
    standard: thumbnailSchema,
    high: thumbnailSchema,
    medium: thumbnailSchema,
    default: thumbnailSchema,
  })
  .nullish();

const playlistItemsSchema = z.object({
  nextPageToken: z.string().nullish(),
  items: z.array(
    z.object({
      snippet: z.object({
        title: z.string().nullish(),
        description: z.string().nullish(),
        publishedAt: z.string().nullish(),
        thumbnails: thumbnailsSchema,
        resourceId: z.object({ videoId: z.string().nullish() }),
      }),
    }),
  ),
});

const videosSchema = z.object({
  items: z.array(z.object({ id: z.string(), snippet: z.object({ thumbnails: thumbnailsSchema }) })),
});

type Thumbnails = z.infer<typeof thumbnailsSchema>;

// Falls back from the largest size down
const pickThumbnailURL = (thumbnails: Thumbnails): string =>
  thumbnails?.maxres?.url ??
  thumbnails?.standard?.url ??
  thumbnails?.high?.url ??
  thumbnails?.medium?.url ??
  thumbnails?.default?.url ??
  "";

async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!env.YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY is not set");

  const url = new URL(`${API_URL}/${endpoint}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("key", env.YOUTUBE_API_KEY);

  const res = await fetch(url, {
    cache: "force-cache",
    next: { tags: CACHE_TAGS, revalidate: REVALIDATE },
  });

  // The URL carries the API key, so errors name the endpoint only
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const reason = z.object({ error: z.object({ message: z.string() }) }).safeParse(body);
    throw new Error(
      `YouTube ${endpoint} request failed: ${res.status} ${res.statusText}${reason.success ? ` (${reason.data.error.message})` : ""}`,
    );
  }

  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`Unexpected YouTube ${endpoint} response: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

/**
 * The channel's uploads, newest first (up to MAX_UPLOAD_PAGES pages). Throws when YouTube can't be read.
 */
export async function getUploadedVideos(channelId: string): Promise<IVideoPreview[]> {
  // A channel's uploads playlist id is its id with "UU" in place of the leading "UC", so no
  // channels.list request is needed to look it up
  if (!channelId.startsWith("UC")) throw new Error(`Unexpected YouTube channel id: ${channelId}`);
  const uploadsPlaylistId = `UU${channelId.slice(2)}`;

  const videos: IVideoPreview[] = [];
  // Pages are cached separately, so a refresh between two of them could repeat a video
  const seen = new Set<string>();
  let pageToken: string | null | undefined;
  for (let page = 0; page < MAX_UPLOAD_PAGES; page++) {
    const playlist = await youtubeGet(
      "playlistItems",
      {
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: String(PAGE_SIZE),
        ...(pageToken ? { pageToken } : {}),
      },
      playlistItemsSchema,
    );

    for (const { snippet } of playlist.items) {
      const id = snippet.resourceId.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      videos.push({
        id,
        title: snippet.title ?? "",
        description: snippet.description ?? "",
        thumbnailURL: pickThumbnailURL(snippet.thumbnails),
        // Keep the ISO string; formatting happens where the date is displayed
        publishedAt: snippet.publishedAt ?? "",
      });
    }

    pageToken = playlist.nextPageToken;
    if (!pageToken) break;
  }

  return videos;
}

/**
 * Thumbnail URL per video id, fetched in batches of 50 ids per request. Unknown ids are left out.
 */
export async function getYoutubeThumbnails(videoIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(videoIds)];
  const thumbnails = new Map<string, string>();

  for (let i = 0; i < ids.length; i += PAGE_SIZE) {
    const { items } = await youtubeGet(
      "videos",
      { part: "snippet", id: ids.slice(i, i + PAGE_SIZE).join(",") },
      videosSchema,
    );
    for (const video of items) thumbnails.set(video.id, pickThumbnailURL(video.snippet.thumbnails));
  }

  return thumbnails;
}
