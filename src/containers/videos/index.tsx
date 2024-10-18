import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import TitleSection from "@/components/TitleSection";
import { getUploadedVideos } from "@/lib/youtube";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";
import VideoCard from "./components/VideoCard";

export default async function VideosContainer({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const videos = await getUploadedVideos([YOUTUBE_CHANNEL_ID]);
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;

  return (
    <main className="container">
      <TitleSection
        backgroundText="videos"
        plainText="my"
        coloredText="videos"
      />
      <SearchForm initialQuery={query} />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={`/videos?page=${page - 1}&q=${query}`} />
          </PaginationItem>
          {/* {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href={`/youtube-videos?page=${i + 1}&q=${query}`}
                isActive={page === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))} */}
          <PaginationItem>
            <PaginationNext href={`/videos?page=${page + 1}&q=${query}`} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </main>
  );
}
