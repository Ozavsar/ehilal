import { notFound } from "next/navigation";
import { ITEMS_PER_PAGE, YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getUploadedVideos, getYoutubeVideoById } from "@/lib/youtube";
import VideosContainer from "@/containers/videos";
import { Metadata } from "next";

export const revalidate = 60 * 60 * 24;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Videos",
};

export default async function Video({ params }: { params: { slug: string } }) {
  if (!Number.isNaN(params.slug)) {
    const videos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
    return <VideosContainer videos={videos} pageNumber={params.slug} />;
  } else {
    const video = await getYoutubeVideoById(params.slug);

    if (!video) {
      return notFound();
    }

    return (
      <div className="mx-8 my-8 box-border max-w-[90%] rounded-lg bg-muted p-8 text-blog-text-color shadow-lg">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-blog-text-color">
            {video.title}
          </h1>
        </div>

        <div className="mb-2 w-full bg-black">
          <iframe
            width="1280"
            height="720"
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title || ""}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            className="mx-auto"
            allowFullScreen
          />
        </div>

        <p className="whitespace-pre-line">{video.description}</p>
      </div>
    );
  }
}
export async function generateStaticParams() {
  const videos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const pageCount = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const pageCounts = Array.from({ length: pageCount }, (_, i) => i + 1);

  return [
    ...videos!.map((video) => ({
      slug: video.id,
    })),
    ...pageCounts.map((pageNumber) => {
      return {
        slug: pageNumber.toString(),
      };
    }),
  ];
}
