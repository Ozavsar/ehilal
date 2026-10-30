import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { fetchAPI } from "../api/fetchAPI";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getUploadedVideos, getYoutubeThumbnails } from "@/lib/services/youtube";
import { getStoredBlurDataURL } from "@/lib/getImage";
import type {
  IStrapiCollectionResponse,
  IStrapiVideo,
  IUnifiedVideo,
  IVideoPreview,
} from "@/types";

export interface IVideoList {
  videos: IUnifiedVideo[];
  // false when YouTube contributed nothing (failed, or no API key), so the list is probably missing videos
  isComplete: boolean;
}

/**
 * get all videos from strapi.
 */
async function getAllStrapiVideos() {
  return fetchAPI<IStrapiCollectionResponse<IStrapiVideo>>(
    "/videos",
    // Strapi returns 25 entries unless asked; 100 is its configured maximum
    { populate: ["thumbnail"], pagination: { limit: 100 } },
    { tags: ["videos"] },
  );
}

/**
 * get all videos (YouTube channel + Strapi), sorted. Only Strapi thumbnails with a placeholder
 * stored by Strapi come with one: use `withBlurDataURLs` on the slice that is actually rendered.
 * Strapi is required (a failure throws); YouTube is best effort.
 * cache(): generateMetadata and the page share one result per request.
 */
export const getAllVideos = cache(async (): Promise<IVideoList> => {
  const [youtubeResult, strapiResult] = await Promise.allSettled([
    getUploadedVideos(YOUTUBE_CHANNEL_ID),
    getAllStrapiVideos(),
  ]);

  if (strapiResult.status === "rejected") throw strapiResult.reason;

  let youtubeVideos: IVideoPreview[] = [];
  if (youtubeResult.status === "fulfilled") {
    youtubeVideos = youtubeResult.value;
  } else {
    unstable_rethrow(youtubeResult.reason);
    console.error("YouTube videos could not be loaded:", youtubeResult.reason);
  }

  // 1. Format the YouTube channel videos
  const formattedYoutubeVideos = youtubeVideos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailURL: video.thumbnailURL,
    publish_date: video.publishedAt,
    isFeatured: false,
    source: "youtube" as const,
  }));

  // 2. Process Strapi videos. YouTube thumbnails are only fetched (in one batch) for YouTube videos
  // without a Strapi thumbnail, and are best effort: a failure leaves the card on its fallback image.
  const strapiVideos = strapiResult.value.data.map((video) => ({
    video,
    youtubeId: extractYoutubeId(video.url),
  }));
  const missingThumbnailIds = strapiVideos.flatMap(({ video, youtubeId }) =>
    youtubeId && !video.thumbnail?.url ? [youtubeId] : [],
  );

  let youtubeThumbnails = new Map<string, string>();
  if (missingThumbnailIds.length) {
    try {
      youtubeThumbnails = await getYoutubeThumbnails(missingThumbnailIds);
    } catch (error) {
      unstable_rethrow(error);
      console.error("YouTube thumbnails could not be loaded:", error);
    }
  }

  const processedStrapiVideos = strapiVideos.map(({ video, youtubeId }) => {
    // The placeholder Strapi stored for the thumbnail is free (no request), so it is added here,
    // and withBlurDataURLs keeps it instead of blurring the original file
    const blurDataURL = video.thumbnail?.url ? getStoredBlurDataURL(video.thumbnail) : undefined;
    return {
      id: video.id.toString(),
      title: video.title,
      description: video.description ?? "",
      url: video.url,
      thumbnailURL:
        video.thumbnail?.url || (youtubeId ? (youtubeThumbnails.get(youtubeId) ?? "") : ""),
      publish_date: new Date(video.publish_date).toISOString(),
      source: youtubeId ? ("youtube" as const) : ("strapi" as const),
      isFeatured: video.isFeatured || false,
      ...(blurDataURL ? { blurDataURL } : {}),
    };
  });

  // 3. Filter out YouTube videos from Strapi that are already in the YouTube list
  const strapiUrls = new Set(processedStrapiVideos.map((video) => video.url));
  const filteredYoutubeVideos = formattedYoutubeVideos.filter(
    (video) => !strapiUrls.has(video.url),
  );

  // 4. Combine all videos and sort them
  const allVideos = [...processedStrapiVideos, ...filteredYoutubeVideos].sort((a, b) => {
    // Sort by featured first, then by publish date
    if (a.isFeatured === b.isFeatured) {
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    }
    return a.isFeatured ? -1 : 1;
  });

  return { videos: allVideos, isComplete: youtubeVideos.length > 0 };
});

// Extract the YouTube video ID from a URL
function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/)|youtu\.be\/)([^"&?/\s]{11})/;
  return url.match(regex)?.[1] ?? null;
}
