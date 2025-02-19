import { notFound } from "next/navigation";
import { Metadata } from "next";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getYoutubeVideoById } from "@/lib/services/youtube";
import { getAllVideos } from "@/lib/services/videos";

export const revalidate = 60 * 60 * 24;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Videos",
};

export default async function Video({ params }: { params: { slug: string } }) {
  if (!Number.isNaN(params.slug)) {
    const videos = await getAllVideos();
    return <VideosContainer videos={videos} pageNumber={params.slug} />;
  } else {
    const video = await getYoutubeVideoById(params.slug);

    if (!video) {
      return notFound();
    }
  }
}
export async function generateStaticParams() {
  const videos = await getAllVideos();
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
