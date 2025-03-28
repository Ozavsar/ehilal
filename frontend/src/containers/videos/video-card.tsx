import Image from "next/image";
import { LuFlame } from "react-icons/lu";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncateDescription } from "@/lib/utils";
import type { IUnifiedVideo } from "@/types.d";

export default function VideoCard({
  url,
  thumbnailURL,
  title,
  description,
  publish_date,
  source,
  isFeatured,
}: IUnifiedVideo) {
  const videoUrl = url || "#";

  return (
    <Card className="row-span-3 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="relative overflow-hidden border-b-8 border-primary bg-primary p-0">
        <div className="group relative aspect-video object-cover transition-transform duration-300">
          {isFeatured && (
            <Badge className="absolute left-4 top-2 z-10 w-fit select-none border-red-600 bg-muted text-red-600 backdrop-blur-sm hover:bg-primary/50 dark:border-red-300 dark:text-red-300">
              <LuFlame className="mr-1 size-4" />
              Featured
            </Badge>
          )}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-auto w-full"
          >
            <Image
              src={thumbnailURL || "/images/blog/default-blog.jpg"}
              alt={title || ""}
              className="object-cover transition-transform group-hover:scale-105"
              fill
            />
          </a>
        </div>
      </CardHeader>
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <h2 className="text-lg font-bold">{title}</h2>
        </a>
        <p className="text-sm dark:text-gray-400">
          {description ? truncateDescription(description) : ""}
        </p>
      </CardContent>
      <CardFooter className="row-span-1 flex justify-between p-4 pt-1">
        {source === "youtube" ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant={"link"}
              className="h-fit p-0 text-xs text-foreground"
            >
              Watch on <span className="text-[#ff0033]">&nbsp;YouTube</span>
            </Button>
          </a>
        ) : (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant={"link"} className="h-fit p-0 text-foreground">
              Watch the <span className="text-primary">&nbsp;Video</span>
            </Button>
          </a>
        )}

        <p className="text-xs">
          {new Date(publish_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </CardFooter>
    </Card>
  );
}
