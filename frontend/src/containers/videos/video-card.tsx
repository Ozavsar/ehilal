import Image from "next/image";
import { LuFlame, LuPlay } from "react-icons/lu";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IUnifiedVideo } from "@/types";
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
  // publish_date is an ISO string; pin the time zone so the day doesn't depend on the server
  const publishDate = new Date(publish_date);
  const formattedDate = isNaN(publishDate.getTime())
    ? null
    : publishDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Istanbul",
      });

  return (
    <Card className="border-muted flex h-full flex-col gap-0 overflow-hidden border">
      <CardHeader className="relative overflow-hidden p-0">
        <div className="group relative aspect-video object-cover">
          {isFeatured && (
            <Badge className="bg-muted hover:bg-primary/50 absolute top-2 left-4 z-(--z-raised) w-fit border-red-600 text-red-600 backdrop-blur-sm select-none dark:border-red-300 dark:text-red-300">
              <LuFlame className="mr-1 size-4" />
              Featured
            </Badge>
          )}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 block focus-visible:outline-none"
          >
            <Image
              src={thumbnailURL || "/images/blog/default-blog.jpg"}
              alt={title || ""}
              blurDataURL={blurDataURL ? blurDataURL : undefined}
              placeholder={blurDataURL ? "blur" : "empty"}
              className="object-cover transition-transform duration-500 group-hover:scale-105 group-has-[a:focus-visible]:scale-105"
              fill
            />
            {/* Hover cue and keyboard focus indicator; the card's overflow-hidden clips a regular outline */}
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100"
            >
              <span className="bg-primary flex size-12 items-center justify-center rounded-full text-white shadow-md">
                <LuPlay size={22} fill="currentColor" className="ml-0.5" />
              </span>
            </span>
          </a>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 pb-2">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <h2 className="text-foreground line-clamp-2 text-lg font-bold">{title}</h2>
        </a>
        <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-between p-4 pt-1">
        {source === "youtube" ? (
          <LinkButton href={videoUrl} target="_blank" rel="noopener noreferrer">
            Watch on <span className="font-bold text-[#ff0033]">&nbsp;YouTube</span>
          </LinkButton>
        ) : (
          <LinkButton href={videoUrl} target="_blank" rel="noopener noreferrer">
            Watch the <span className="text-primary">&nbsp;Video</span>
          </LinkButton>
        )}

        {formattedDate && <p className="text-muted-foreground text-xs">{formattedDate}</p>}
      </CardFooter>
    </Card>
  );
}
