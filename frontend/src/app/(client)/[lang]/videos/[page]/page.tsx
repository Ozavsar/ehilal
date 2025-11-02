import { notFound } from "next/navigation";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";

export const dynamicParams = true;

export default async function VideosPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const videos = await getAllVideos();
  if (!videos || videos.length === 0) {
    return notFound();
  }

  return <VideosContainer videos={videos} pageNumber={pageNum.toString()} />;
}

export async function generateStaticParams() {
  const videos = await getAllVideos();
  const pageCount = Math.ceil((videos?.length || 0) / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount || 1 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}
