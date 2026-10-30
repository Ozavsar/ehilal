import Image from "next/image";
import { Icon } from "@/components/icon";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COURSE_CARD_IMAGE_SIZES } from "@/containers/list-layout";
import { detectLanguage } from "@/lib/language";
import type { ICourse } from "@/types";

// Fixed rating yellow (as on Google/Udemy ratings), not a palette role
const RATING_COLOR = "#FBBC04";

function RatingStars({ rating }: { rating: string }) {
  const value = parseFloat(rating);
  if (isNaN(value)) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="relative" aria-hidden="true">
        <div className="text-outline-variant flex">
          {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" className="[--icon-size:18px]" />
          ))}
        </div>
        <div
          className="absolute inset-y-0 left-0 flex overflow-hidden"
          style={{ width: `${(Math.min(Math.max(value, 0), 5) / 5) * 100}%`, color: RATING_COLOR }}
        >
          {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" filled className="[--icon-size:18px]" />
          ))}
        </div>
      </div>
      <span className="type-label-large text-on-surface">
        <span className="sr-only">Rating: </span>
        {rating}
      </span>
    </div>
  );
}

export default function CourseCard({
  blurDataURL,
  thumbnailURL,
  title,
  udemyURL,
  rating,
  headline,
  contentInfo,
  instructionalLevel,
  numReviews,
  priority = false,
}: ICourse & { priority?: boolean }) {
  // Turkish or English, for screen reader pronunciation
  const lang = detectLanguage(`${title} ${headline}`);

  return (
    <Card interactive className="h-full gap-0 p-0">
      <CardHeader className="p-0">
        <a
          href={udemyURL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="group block overflow-hidden"
        >
          <Image
            // No course-specific placeholder exists, share the blog one
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt=""
            // 16:9 like the rendered box; the card is one column of the course grid
            width={640}
            height={360}
            sizes={COURSE_CARD_IMAGE_SIZES}
            blurDataURL={blurDataURL}
            placeholder={blurDataURL ? "blur" : "empty"}
            // The first card is the LCP candidate on the list page
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            draggable={false}
            className="ease-standard aspect-video w-full object-cover duration-300 select-none group-hover:scale-105 motion-safe:transition-transform"
          />
        </a>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 pb-0">
        <p className="type-label-medium text-on-surface-variant">
          {[contentInfo, instructionalLevel].filter(Boolean).join(" · ")}
        </p>
        <a
          href={udemyURL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary ease-standard transition-colors duration-200"
        >
          <h2 lang={lang} className="type-title-large line-clamp-2">
            {title}
          </h2>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p lang={lang} className="type-body-medium text-on-surface-variant line-clamp-2">
          {headline}
        </p>
        <div className="text-on-surface-variant mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
          {rating && <RatingStars rating={rating} />}
          <span className="type-label-large flex items-center gap-1">
            <Icon name="group" className="[--icon-size:18px]" />
            {numReviews}
            <span className="sr-only"> reviews</span>
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto p-4">
        {/* Pointer-only copy of the title link, the card's one link for keyboard and screen readers */}
        <Button asChild className="w-full">
          <a href={udemyURL} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden>
            View on Udemy
            <Icon name="open_in_new" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
