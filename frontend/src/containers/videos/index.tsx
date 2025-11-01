import { Suspense } from "react";
import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import VideoCard from "./video-card";
import { ITEMS_PER_PAGE } from "@/config/constants";
import type { IUnifiedVideo } from "@/types.d";

interface IVideosContainerProps {
  videos: IUnifiedVideo[];
  pageNumber: string;
}

export default async function VideosContainer({
  videos,
  pageNumber,
}: IVideosContainerProps) {
  const currentPage = parseInt(pageNumber, 10);
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

  videos = videos
    ? videos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <div className="flex flex-col">
        <MotionGrid>
          {videos?.map((video) => <VideoCard key={video.id} {...video} />)}
        </MotionGrid>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}
