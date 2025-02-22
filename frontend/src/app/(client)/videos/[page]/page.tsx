import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";

export const dynamicParams = true;

const getCachedVideos = unstable_cache(
  async () => {
    try {
      return await getAllVideos();
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  },
  ["videos-list"],
  {
    tags: ["videos"],
    revalidate: 86400, // 24 hours
  },
);

export default async function VideosPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const videos = await getCachedVideos();
  if (!videos || videos.length === 0) {
    return notFound();
  }

  return <VideosContainer videos={videos} pageNumber={pageNum.toString()} />;
}

export async function generateStaticParams() {
  const videos = await getCachedVideos();
  const pageCount = Math.ceil((videos?.length || 0) / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount || 1 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}
