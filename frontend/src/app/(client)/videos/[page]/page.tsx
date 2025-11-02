import { notFound } from "next/navigation";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";

export const dynamicParams = true;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

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

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const pageNum = parseInt(params.page ?? "1", 10);

  return {
    title: `Videos - Page ${pageNum}`,
    description: `Explore ${SITE_NAME}'s collection of insightful videos on web development, programming, and more - Page ${pageNum}.`,
    type: "website",
    image: {
      url: `${SITE_URL}/api/og?title=${encodeURIComponent(`Videos - Page ${pageNum}`)}`,
      alt: `Videos by ${SITE_NAME}`,
    },
  };
}
