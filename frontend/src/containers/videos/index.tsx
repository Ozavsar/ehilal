import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import VideoCard from "./video-card";
import type { IUnifiedVideo } from "@/types";

interface IVideosContainerProps {
  videos: IUnifiedVideo[]; // videos of the current page only
  pageNumber: string;
  totalPages: number;
}

export default function VideosContainer({ videos, pageNumber, totalPages }: IVideosContainerProps) {
  return (
    <main className="lg:px-page-gutter container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <MotionGrid>
          {videos.map((video, index) => (
            <VideoCard key={video.id} {...video} priority={index === 0} />
          ))}
        </MotionGrid>
      </div>
      <Pagination route="VIDEOS" totalPages={totalPages} currentPage={+pageNumber} />
    </main>
  );
}
