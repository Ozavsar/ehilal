import { SearchForm } from "@/components/search-form";
import TitleSection from "@/components/title-section";
import VideoCard from "./components/video-card";
import { ITEMS_PER_PAGE, YOUTUBE_CHANNEL_ID } from "@/config/constants";
import { getUploadedVideos } from "@/lib/youtube";
import Pagination from "@/components/pagination";

export default async function VideosContainer({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);

  const allVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const totalPages = Math.ceil(allVideos.length / ITEMS_PER_PAGE);

  const videos = allVideos
    ? allVideos.slice(
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
      <SearchForm initialQuery={query} />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => <VideoCard key={video.id} {...video} />)}
      </div>
      <Pagination totalPages={totalPages} />
    </main>
  );
}
