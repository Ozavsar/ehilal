import { fetchAPI } from "../api/fetchAPI";
import { getImage } from "../getImage";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getYoutubeVideoDetails } from "@/lib/services/youtube";
import { getUploadedVideos } from "@/lib/services/youtube";
import type { IStrapiResponse, IStrapiVideo, IUnifiedVideo } from "@/types";

/**
 * get all videos from strapi with optional pagination.
 */
export async function getAllStrapiVideos(start?: number, limit?: number) {
  const baseQuery = {
    populate: ["thumbnail"],
  };

  const query =
    start !== undefined && limit !== undefined
      ? { ...baseQuery, pagination: { start, limit } }
      : baseQuery;

  const response = await fetchAPI<IStrapiResponse<IStrapiVideo[]>>("/videos", query, {
    tags: ["videos"],
  });

  return response;
}

/**
 * get all videos (YouTube channel + Strapi), sorted, without blur placeholders.
 * Use `withVideoPlaceholders` on the slice that is actually rendered.
 */
export async function getAllVideos(): Promise<IUnifiedVideo[]> {
  // 1. Get YouTube videos from the channel
  const youtubeVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);

  const formattedYoutubeVideos = youtubeVideos.map((video) => ({
    id: video.id!,
    title: video.title!,
    description: video.description!,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailURL: video.thumbnailURL!,
    publish_date: video.publishedAt,
    isFeatured: false,
    source: "youtube" as const,
  }));

  // 2. Get all videos from Strapi
  const strapiResponse = await getAllStrapiVideos();
  const strapiVideos = strapiResponse.data;

  // 3. Process Strapi videos
  const processedStrapiVideos = await Promise.all(
    strapiVideos.map(async (video) => {
      let thumbnailURL = video.thumbnail?.url || "";
      let publish_date = new Date(video.publish_date).toISOString();
      let source: "strapi" | "youtube" = "strapi";

      // Check if the video is a YouTube video
      let youtubeId = extractYoutubeId(video.url);
      if (youtubeId) {
        // Only spend YouTube API quota when Strapi has no thumbnail of its own
        if (!thumbnailURL) {
          const youtubeDetails = await getYoutubeVideoDetails(youtubeId);
          thumbnailURL = youtubeDetails?.thumbnailURL || "";
        }
        source = "youtube";
      }

      return {
        id: video.id.toString(),
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailURL,
        publish_date,
        source,
        isFeatured: video.isFeatured || false,
      };
    }),
  );

  // 4. Filter out YouTube videos from Strapi that are already in the YouTube list
  const strapiUrls = new Set(processedStrapiVideos.map((video) => video.url));
  const filteredYoutubeVideos = formattedYoutubeVideos.filter(
    (video) => !strapiUrls.has(video.url),
  );

  // 5. Combine all videos and sort them
  const allVideos = [...processedStrapiVideos, ...filteredYoutubeVideos].sort((a, b) => {
    // Sort by featured first, then by publish date
    if (a.isFeatured === b.isFeatured) {
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
    }
    return a.isFeatured ? -1 : 1;
  });

  return allVideos;
}

/**
 * add blur placeholders; a broken thumbnail only loses its placeholder.
 */
export async function withVideoPlaceholders(videos: IUnifiedVideo[]): Promise<IUnifiedVideo[]> {
  return Promise.all(
    videos.map(async (video) => {
      if (!video.thumbnailURL) return video;

      try {
        const placeholder = await getImage(video.thumbnailURL);
        return { ...video, blurDataURL: placeholder.base64 };
      } catch (error) {
        console.error(`Failed to get placeholder for ${video.thumbnailURL}`, error);
        return video;
      }
    }),
  );
}

// Extract the YouTube video ID from a URL
function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
