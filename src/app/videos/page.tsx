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

export default async function YouTubeVideos({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const pageSize = 9;

  // const { videos, totalPages } = await getYoutubeVideos(query, page, pageSize);

  const videos = [
    {
      id: "1",
      title: "React Hooks Explained",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "10K",
      date: "2023-05-15",
    },
    {
      id: "2",
      title: "Building a Portfolio with Next.js",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "5K",
      date: "2023-06-01",
    },
    {
      id: "3",
      title: "CSS Grid Layout Tutorial",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "8K",
      date: "2023-06-15",
    },
    {
      id: "4",
      title: "JavaScript ES6 Features",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "12K",
      date: "2023-07-01",
    },
    {
      id: "5",
      title: "TypeScript for Beginners",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "7K",
      date: "2023-07-15",
    },
    {
      id: "6",
      title: "Responsive Web Design Tips",
      thumbnail: "/placeholder.svg?height=720&width=1280",
      views: "9K",
      date: "2023-08-01",
    },
  ];

  return (
    <main className="container">
      <TitleSection
        backgroundText="videos"
        plainText="my"
        coloredText="videos"
      />
      <SearchForm initialQuery={query} />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </AspectRatio>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="mb-2 line-clamp-2 text-lg">
                {video.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {video.views} views • {video.date}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button asChild variant="outline">
                <Link href={`/youtube-videos/${video.id}`}>Watch on Site</Link>
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
