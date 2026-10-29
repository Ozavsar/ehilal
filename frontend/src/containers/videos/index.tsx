import { Suspense } from "react";
import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import VideoCard from "./video-card";
import type { IUnifiedVideo } from "@/types";

interface IVideosContainerProps {
  videos: IUnifiedVideo[]; // videos of the current page only
  pageNumber: string;
  totalPages: number;
}

export default async function VideosContainer({
  videos,
  pageNumber,
  totalPages,
}: IVideosContainerProps) {
  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <div className="flex flex-col">
        <MotionGrid>
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </MotionGrid>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={+pageNumber} />
      </Suspense>
    </main>
  );
}
