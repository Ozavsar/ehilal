import { videoPreviewDummyData } from "@/config/constants/dummy-data";
import type { IVideoPreview } from "@/types.d";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function getUploadedVideos(
  channelIds: string[],
): Promise<IVideoPreview[]> {
  if (process.env.NODE_ENV === "development") {
    // Return dummy data instead of fetching from YouTube API
    return videoPreviewDummyData;
  } else {
    try {
      const channelResponse = await youtube.channels.list({
        part: ["contentDetails"],
        id: channelIds,
      });

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists
          ?.uploads;

      if (!uploadsPlaylistId) throw new Error("Uploads playlist ID not found");

      const videoResponse = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: uploadsPlaylistId,
        maxResults: 50, // Maksimum 50 video alabiliriz
      });

      const videos = videoResponse.data.items?.map((item) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title || "",
        description: item.snippet?.description || "",
        thumbnailURL: item.snippet?.thumbnails?.high?.url || "",
        publishedAt: item.snippet?.publishedAt
          ? new Date(item.snippet.publishedAt).toLocaleDateString()
          : "",
      }));

      // @todo: Remove limit before the final product
      const limitedVideos = videos?.slice(0, 3);

      return limitedVideos || [];
    } catch (err) {
      console.error("Error fetching videos:", err);
      return [];
    }
  }
}

export async function getYoutubeVideoById(
  id: string,
): Promise<IVideoPreview | null> {
  if (process.env.NODE_ENV === "development") {
    try {
      // Find the dummy video by ID
      const video = videoPreviewDummyData.find((video) => video.id === id);

      if (!video) return null;

      return video;
    } catch (err) {
      console.error("Error fetching video by ID:", err);
      return null;
    }
  } else {
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
      thumbnailURL: video.snippet?.thumbnails?.high?.url,
      publishedAt: video.snippet?.publishedAt
        ? new Date(video.snippet.publishedAt).toLocaleDateString()
        : "unknown",
      views: video.statistics?.viewCount,
    };
  }
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
