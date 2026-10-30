import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import { SharedAxisXTransition } from "@/components/view-transitions";
import { LIST_GRID_CLASS_NAME, LIST_PAGE_CLASS_NAME } from "@/containers/list-layout";
import VideoCard from "./video-card";
import type { IUnifiedVideo } from "@/types";

interface IVideosContainerProps {
  videos: IUnifiedVideo[]; // videos of the current page only
  pageNumber: string;
  totalPages: number;
}

export default function VideosContainer({ videos, pageNumber, totalPages }: IVideosContainerProps) {
  return (
    <div className={LIST_PAGE_CLASS_NAME}>
      <SharedAxisXTransition>
        <MotionGrid className={LIST_GRID_CLASS_NAME}>
          {videos.map((video, index) => (
            <VideoCard key={video.id} {...video} priority={index === 0} />
          ))}
        </MotionGrid>
      </SharedAxisXTransition>
      <Pagination route="VIDEOS" totalPages={totalPages} currentPage={+pageNumber} />
    </div>
  );
}
