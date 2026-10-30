import Image from "next/image";
import { Icon } from "@/components/icon";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinkButton from "@/components/link-button";
import { LIST_CARD_IMAGE_SIZES } from "@/containers/list-layout";
import { detectLanguage } from "@/lib/language";
import type { IUnifiedVideo } from "@/types";

export default function VideoCard({
  blurDataURL,
  url,
  thumbnailURL,
  title,
  description,
  publish_date,
  source,
  isFeatured,
  priority = false,
}: IUnifiedVideo & { priority?: boolean }) {
  // Turkish or English, for screen reader pronunciation
  const lang = detectLanguage(`${title} ${description ?? ""}`);
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

  // The title is the card's one link for keyboard and screen reader users; the thumbnail and the
  // footer button are pointer-only copies of it. Without a URL nothing links.
  const thumbnail = (
    <>
      <Image
        src={thumbnailURL || "/images/blog/default-blog.jpg"}
        // Decorative: the title right below names the card
        alt=""
        blurDataURL={blurDataURL}
        placeholder={blurDataURL ? "blur" : "empty"}
        className="ease-standard object-cover duration-300 select-none group-hover:scale-105 motion-safe:transition-transform"
        fill
        // The first card is the LCP candidate on the list page
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        sizes={LIST_CARD_IMAGE_SIZES}
        draggable={false}
      />
      {/* Hover cue */}
      <span
        aria-hidden="true"
        className="bg-scrim/40 ease-standard absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <span className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full">
          <Icon name="play_arrow" filled />
        </span>
      </span>
    </>
  );

  return (
    <Card interactive className="h-full gap-0 p-0">
      <CardHeader className="relative p-0">
        <div className="group relative aspect-video overflow-hidden">
          {isFeatured && (
            <Badge
              variant="tertiary"
              className="absolute top-3 left-3 z-(--z-raised) w-fit gap-1 select-none"
            >
              <Icon name="local_fire_department" filled />
              Featured
            </Badge>
          )}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 block"
            >
              {thumbnail}
            </a>
          ) : (
            thumbnail
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 pb-0">
        {formattedDate && (
          <time dateTime={publish_date} className="type-label-medium text-on-surface-variant">
            {formattedDate}
          </time>
        )}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary ease-standard transition-colors duration-200"
          >
            <h2 lang={lang} className="type-title-large line-clamp-2">
              {title}
            </h2>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <h2 lang={lang} className="type-title-large line-clamp-2">
            {title}
          </h2>
        )}
        <p lang={lang} className="type-body-medium text-on-surface-variant line-clamp-2">
          {description}
        </p>
      </CardContent>
      {url && (
        <CardFooter className="mt-auto flex items-center justify-end p-4">
          <LinkButton
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
          >
            {source === "youtube" ? "Watch on YouTube" : "Watch the video"}
            <Icon name="open_in_new" />
          </LinkButton>
        </CardFooter>
      )}
    </Card>
  );
}
