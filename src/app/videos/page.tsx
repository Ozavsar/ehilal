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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import TitleSection from "@/components/TitleSection";
import { getUploadedVideos } from "@/lib/youtube";
import { YOUTUBE_CHANNEL_ID } from "@/config/constants";

export default async function YouTubeVideos({
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
          <Card key={video.id} className="overflow-hidden">
            <Link href={`/videos/watch/${video.id}`}>
              <CardHeader className="p-0">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={video.thumbnail || ""}
                    alt={video.title || ""}
                    className="h-full w-full object-cover"
                  />
                </AspectRatio>
              </CardHeader>
            </Link>
            <CardContent className="p-4">
              <Link href={`/videos/watch/${video.id}`}>
                <CardTitle className="mb-2 line-clamp-2 text-lg">
                  {video.title}
                </CardTitle>
              </Link>
              <p className="text-sm text-muted-foreground">
                {0} views • {video.publishedAt}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button asChild variant="outline">
                <Link href={`/videos/watch/${video.id}`}>Watch on Site</Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </a>
              </Button>
            </CardFooter>
          </Card>
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
