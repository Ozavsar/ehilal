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
import type { IUnifiedVideo } from "@/types.d";
import LinkButton from "@/components/link-button";

export default function VideoCard({
  blurDataURL,
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
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-[5px] border border-muted">
      <CardHeader className="relative overflow-hidden p-0">
        <div className="group relative aspect-video object-cover">
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
              blurDataURL={blurDataURL ? blurDataURL : undefined}
              placeholder={blurDataURL ? "blur" : "empty"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
            />
          </a>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 pb-2">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <h2 className="text-lg font-bold line-clamp-2 text-foreground">{title}</h2>
        </a>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-between p-4 pt-1">
        {source === "youtube" ? (
          <LinkButton href={videoUrl} target="_blank" rel="noopener noreferrer">
            Watch on{" "}
            <span className="text-[#ff0033] font-bold">
              &nbsp;YouTube
            </span>
          </LinkButton>
        ) : (
          <LinkButton href={videoUrl} target="_blank" rel="noopener noreferrer">
            Watch the <span className="text-primary">&nbsp;Video</span>
          </LinkButton>
        )}

        <p className="text-xs text-muted-foreground">
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
