import { fetchAPI } from "../api/fetchAPI";
import { getUploadedVideos } from "@/lib/services/youtube";
import { getYoutubeVideoDetails } from "@/lib/services/youtube";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getImage } from "../getImage";
import type { IStrapiResponse, IStrapiVideo, IUnifiedVideo } from "@/types.d";

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

  const response = await fetchAPI<IStrapiResponse<IStrapiVideo[]>>(
    "/videos",
    query,
  );

  return response;
}

const parseDateToISO = (dateStr: string) => {
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day).toISOString();
};

export async function getAllVideos(): Promise<IUnifiedVideo[]> {
  // 1. Get YouTube videos from the channel
  const youtubeVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);

  const formattedYoutubeVideos = youtubeVideos.map((video) => ({
    id: video.id!,
    title: video.title!,
    description: video.description!,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailURL: video.thumbnailURL!,
    publish_date: parseDateToISO(video.publishedAt!),
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
        const youtubeDetails = await getYoutubeVideoDetails(youtubeId);
        if (youtubeDetails) {
          thumbnailURL = thumbnailURL || youtubeDetails.thumbnailURL;
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
  const allVideos = [...processedStrapiVideos, ...filteredYoutubeVideos].sort(
    (a, b) => {
      // Sort by featured first, then by publish date
      if (a.isFeatured === b.isFeatured) {
        return (
          new Date(b.publish_date).getTime() -
          new Date(a.publish_date).getTime()
        );
      }
      return a.isFeatured ? -1 : 1;
    },
  );
  const allVideosWithPlaceholders = await Promise.all(
    allVideos.map(async (video) => ({
      ...video,
      blurDataURL: video.thumbnailURL
        ? (await getImage(video.thumbnailURL)).base64
        : undefined,
    })),
  );

  return allVideosWithPlaceholders;
}

// Extract the YouTube video ID from a URL
function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
