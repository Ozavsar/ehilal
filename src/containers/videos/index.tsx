import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchForm } from "@/components/SearchForm";
import TitleSection from "@/components/TitleSection";
import { getUploadedVideos } from "@/lib/youtube";
import { VIDEO_REVALIDATE, YOUTUBE_CHANNEL_ID } from "@/config/constants";
import VideoCard from "./components/VideoCard";

export const revalidate = VIDEO_REVALIDATE;

export default async function VideosContainer({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const currentPage = parseInt(searchParams.page || "1", 10);
  const videosPerPage = 9;

  const allVideos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const totalPages = Math.ceil(allVideos.length / videosPerPage);

  const videos = allVideos
    ? allVideos.slice(
        (currentPage - 1) * videosPerPage,
        currentPage * videosPerPage,
      )
    : [];

  return (
    <main className="container">
      <TitleSection
        backgroundText="videos"
        plainText="my"
        coloredText="videos"
      />
      <SearchForm initialQuery={query} />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => <VideoCard key={video.id} {...video} />)}
      </div>
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`/videos?page=${currentPage - 1}&q=${query}`}
              isActive={currentPage > 1}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href={`/videos?page=${i + 1}&q=${query}`}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={`/videos?page=${currentPage + 1}&q=${query}`}
              isActive={currentPage < totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </main>
  );
}
