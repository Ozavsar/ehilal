import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Function to fetch uploaded videos from a channel
export async function getUploadedVideos(channelIds: string[]) {
  try {
    // Fetch the playlist ID for uploads
    const channelResponse = await youtube.channels.list({
      part: ["contentDetails", "statistics"],
      id: channelIds,
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists
        ?.uploads;

    console.log("Uploads Playlist ID:", uploadsPlaylistId);

    // Fetch the uploaded videos from the playlist
    const videoResponse = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadsPlaylistId,
      maxResults: 10, // Limit number of videos
    });

    const videos = videoResponse.data.items?.map((item) => ({
      id: item.snippet?.resourceId?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.high?.url,
      publishedAt: item.snippet?.publishedAt
        ? new Date(item.snippet.publishedAt).toLocaleDateString()
        : "",
    }));

    console.log("Uploaded Videos:", videos);

    return videos;
  } catch (err) {
    console.error("Error fetching videos:", err);
  }
}

export async function getYoutubeVideoById(id: string) {
  const response = await youtube.videos.list({
    part: ["snippet", "statistics"],
    id: [id],
  });

  const video = response.data.items?.[0];
  console.log("Video:", video);
  if (!video) return null;

  return {
    id: video.id,
    title: video.snippet?.title,
    description: video.snippet?.description,
    thumbnail: video.snippet?.thumbnails?.high?.url,
    publishedAt: video.snippet?.publishedAt
      ? new Date(video.snippet.publishedAt).toLocaleDateString()
      : "unknown",
    views: video.statistics?.viewCount,
  };
}

export async function getVideoCaptions(videoId: string) {
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

  return captions;
}
