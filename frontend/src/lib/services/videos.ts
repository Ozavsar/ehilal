import { fetchAPI } from "../api/fetchAPI";
import { getUploadedVideos } from "@/lib/services/youtube";
import { getYoutubeVideoDetails } from "@/lib/services/youtube";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import type { IStrapiResponse, IStrapiVideo, IUnifiedVideo } from "@/types.d";

/**
 * get all videos from strapi with optional pagination.
 */
export async function getAllStrapiVideos(start?: number, limit?: number) {
  const baseQuery = {
    populate: "thumbnail",
  };

  const query =
    start !== undefined && limit !== undefined
      ? { ...baseQuery, pagination: { start, limit } }
      : baseQuery;

  const response = await fetchAPI<IStrapiResponse<IStrapiVideo[]>>(
    "/videos",
    query,
    { tags: ["pages"] },
  );

  return response;
}

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
    source: "youtube" as const,
  }));

  // 2. Get all videos from Strapi
  const strapiResponse = await getAllStrapiVideos();
  const strapiVideos = strapiResponse.data;

  // 3. Process Strapi videos
  const processedStrapiVideos = await Promise.all(
    strapiVideos.map(async (video) => {
      let thumbnailURL = video.thumbnail?.url || "";
      let publish_date = new Date(video.publish_date).toLocaleDateString();
      let source: "strapi" | "youtube" = "strapi";

      // If the video is a YouTube video, get the thumbnail and publishedAt date
      if (video.url.includes("youtube.com") || video.url.includes("youtu.be")) {
        const youtubeId = extractYoutubeId(video.url);
        if (youtubeId) {
          const youtubeDetails = await getYoutubeVideoDetails(youtubeId);
          if (youtubeDetails) {
            thumbnailURL = !thumbnailURL
              ? youtubeDetails.thumbnailURL
              : thumbnailURL;
          }
          source = "youtube";
        }
      }

      return {
        id: video.id.toString(),
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailURL,
        publish_date,
        source: source,
      };
    }),
  );

  // 4. Combine and sort all videos
  const allVideos = [...formattedYoutubeVideos, ...processedStrapiVideos].sort(
    (a, b) =>
      new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime(),
  );

  return allVideos;
}

// Extract the YouTube video ID from a URL
function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
