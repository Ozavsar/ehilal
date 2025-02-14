import { Suspense } from "react";
import TitleSection from "@/components/title-section";
import Pagination from "@/components/pagination";
import VideoCard from "./video-card";
import { ITEMS_PER_PAGE, YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getUploadedVideos } from "@/lib/services/youtube";
import { getPageTitle } from "@/lib/services/pages";
import type { IVideoPreview } from "@/types.d";

interface IVideosContainerProps {
  videos: IVideoPreview[];
  pageNumber: string;
}

export default async function VideosContainer({
  videos,
  pageNumber,
}: IVideosContainerProps) {
  const currentPage = parseInt(pageNumber, 10);
  const allVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const totalPages = Math.ceil(allVideos.length / ITEMS_PER_PAGE);
  const pageContent = await getPageTitle("videos-page");
  console.log("Video page content", pageContent);

  videos = videos
    ? videos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <TitleSection
          text={pageContent.page_title}
          backgroundText={pageContent.page_title_background}
        />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos?.map((video) => <VideoCard key={video.id} {...video} />)}
        </div>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}
