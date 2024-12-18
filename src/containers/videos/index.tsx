import { Suspense } from "react";
import TitleSection from "@/components/title-section";
import Pagination from "@/components/pagination";
import VideoCard from "./components/video-card";
import { ITEMS_PER_PAGE, YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getUploadedVideos } from "@/lib/youtube";
import type { IVideoPreview } from "@/types.d";

export default async function VideosContainer({
  videos,
  pageNumber,
}: {
  videos: IVideoPreview[];
  pageNumber: string;
}) {
  const currentPage = parseInt(pageNumber, 10);
  const allVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const totalPages = Math.ceil(allVideos.length / ITEMS_PER_PAGE);

  videos = videos
    ? videos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex flex-col">
      <TitleSection
        backgroundText="videos"
        plainText="my"
        coloredText="videos"
      />
      {/* <SearchForm initialQuery={query} /> */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => <VideoCard key={video.id} {...video} />)}
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </main>
  );
}
