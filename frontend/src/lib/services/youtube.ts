import { google, type youtube_v3 } from "googleapis";
import type { IVideoPreview } from "@/types";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Not every size exists for every video, so fall back from the largest down
const pickThumbnailURL = (thumbnails?: youtube_v3.Schema$ThumbnailDetails): string =>
  thumbnails?.maxres?.url ??
  thumbnails?.standard?.url ??
  thumbnails?.high?.url ??
  thumbnails?.medium?.url ??
  thumbnails?.default?.url ??
  "";

export async function getUploadedVideos(channelIds: string[]): Promise<IVideoPreview[]> {
  try {
    const channelResponse = await youtube.channels.list({
      part: ["contentDetails"],
      id: channelIds,
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) throw new Error("Uploads playlist ID not found");

    const videoResponse = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const videos = videoResponse.data.items?.map((item) => ({
      id: item.snippet?.resourceId?.videoId,
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnailURL: pickThumbnailURL(item.snippet?.thumbnails),
      // Keep the ISO string; formatting happens where the date is displayed
      publishedAt: item.snippet?.publishedAt ?? "",
    }));

    // @todo: Remove limit before the final product
    const limitedVideos = videos;

    return limitedVideos || [];
  } catch (err) {
    console.error("Error fetching videos:", err);
    return [];
  }
}

export async function getYoutubeVideoById(id: string): Promise<IVideoPreview | null> {
  const response = await youtube.videos.list({
    part: ["snippet", "statistics"],
    id: [id],
  });

  const video = response.data.items?.[0];
  if (!video) return null;

  return {
    id: video.id,
    title: video.snippet?.title,
    description: video.snippet?.description,
    thumbnailURL: pickThumbnailURL(video.snippet?.thumbnails),
    publishedAt: video.snippet?.publishedAt ?? "",
    views: video.statistics?.viewCount,
  };
}

export async function getVideoCaptions(videoId: string): Promise<any[]> {
  if (process.env.NODE_ENV === "development") {
    try {
      // Dummy captions data
      const captions = [
        {
          id: `${videoId}-caption-1`,
          name: "Dummy Caption 1",
          file: null,
        },
        {
          id: `${videoId}-caption-2`,
          name: "Dummy Caption 2",
          file: null,
        },
      ];

      return captions || [];
    } catch (err) {
      console.error("Error fetching video captions:", err);
      return [];
    }
  } else {
    const response = await youtube.captions.list({
      part: ["snippet"],
      videoId,
    });

    const captions = response.data.items?.map((item) => ({
      id: item.id,
      name: item.snippet?.name,

      // Get the caption file
      file: item.id
        ? youtube.captions.download({
            id: item.id,
            tfmt: "srt",
          })
        : null,
    }));

    return captions || [];
  }
}

// Blur placeholders are added later for the visible page only (see lib/services/videos.ts)
export async function getYoutubeVideoDetails(id: string): Promise<{
  thumbnailURL: string;
  publishedAt: string;
} | null> {
  try {
    const response = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: [id],
    });

    const video = response.data.items?.[0];
    if (!video) return null;

    return {
      thumbnailURL: pickThumbnailURL(video.snippet?.thumbnails),
      publishedAt: video.snippet?.publishedAt ?? "",
    };
  } catch (err) {
    console.error("YouTube API error:", err);
    return null;
  }
}
