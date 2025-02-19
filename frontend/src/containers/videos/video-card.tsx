import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { truncateDescription } from "@/lib/utils";
import type { IUnifiedVideo } from "@/types.d";

export default function VideoCard({
  url,
  thumbnailURL,
  title,
  description,
  publishedAt,
  source,
}: IUnifiedVideo) {
  const videoUrl = url || "#";

  return (
    <Card className="row-span-3 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="overflow-hidden border-b-8 border-primary bg-primary p-0">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title || ""}
            width={800}
            height={800}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-110"
          />
        </a>
      </CardHeader>
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <h2 className="text-lg font-bold">{title}</h2>
        </a>
        <p className="dark:text-gray-400">
          {description ? truncateDescription(description) : ""}
        </p>
      </CardContent>
      <CardFooter className="row-span-1 flex justify-between p-4 pt-1">
        {source === "youtube" ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant={"link"} className="h-fit p-0 text-foreground">
              Watch on <span className="text-[#ff0033]">&nbsp;YouTube</span>
            </Button>
          </a>
        ) : (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant={"link"} className="h-fit p-0 text-foreground">
              Watch the <span className="text-primary">&nbsp;video</span>
            </Button>
          </a>
        )}

        <p className="text-sm">{publishedAt}</p>
      </CardFooter>
    </Card>
  );
}
