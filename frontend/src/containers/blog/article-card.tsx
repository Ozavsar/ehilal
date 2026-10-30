import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { buttonVariants } from "@/components/ui/button";
import { LuBookOpen, LuExternalLink } from "react-icons/lu";
import LinkButton from "@/components/link-button";
import type { IBlogPreview } from "@/types";

// Pin the time zone so the day doesn't depend on the server
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

function getDateParts(date: Date) {
  if (isNaN(date.getTime())) return null;
  const parts = DATE_FORMAT.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return { month: part("month"), day: part("day"), year: part("year") };
}

interface ArticleLinkProps {
  slug: string | null;
  externalURL: string;
  title: string;
  source: string;
  className?: string;
  children: ReactNode;
}

// Internal article page when the article is readable here, otherwise the source site
function ArticleLink({ slug, externalURL, title, source, className, children }: ArticleLinkProps) {
  if (slug) {
    return (
      <Link
        href={INTERNAL_ROUTES.BLOG.href(slug)}
        title={`Read more about ${title}`}
        aria-label={`Read more about ${title}`}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={externalURL}
      target="_blank"
      rel="noopener noreferrer"
      title={`Read the full article on ${source}`}
      aria-label={`Read the full article on ${source}`}
      className={className}
    >
      {children}
    </a>
  );
}

export default function ArticleCard({
  thumbnailURL,
  title,
  externalURL,
  externalBlogSource,
  description,
  publishedAt,
  blurDataURL,
  slug,
  priority = false,
}: IBlogPreview & { priority?: boolean }) {
  // publishedAt is ISO 8601 ("" if unknown, then the date ribbon is hidden)
  const published = getDateParts(new Date(publishedAt));
  const showYear = published !== null && getDateParts(new Date())?.year !== published.year;
  const linkProps = { slug, externalURL, title, source: externalBlogSource };

  return (
    <Card className="h-full overflow-visible pt-0">
      <CardHeader className="relative overflow-visible px-0">
        <ArticleLink
          {...linkProps}
          className="group relative block overflow-hidden rounded-t-md focus-visible:outline-none"
        >
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={`${title} Thumbnail`}
            title={`${title} Thumbnail`}
            // 16:9 like the rendered box; the card is one grid column (1 below md, 2 up to xl, 3 from xl)
            width={640}
            height={360}
            sizes="(min-width: 1140px) 360px, (min-width: 720px) 372px, (min-width: 540px) 508px, calc(100vw - 32px)"
            blurDataURL={blurDataURL}
            placeholder={blurDataURL ? "blur" : "empty"}
            draggable={false}
            // The first card is the LCP candidate on the list page
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="aspect-video object-cover transition-transform duration-500 select-none group-hover:scale-105 group-focus-visible:scale-105"
          />
          {/* Hover cue and keyboard focus indicator, same as the video and conference cards */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <span className="bg-primary flex size-12 items-center justify-center rounded-full text-white shadow-md">
              {slug ? <LuBookOpen size={22} /> : <LuExternalLink size={20} />}
            </span>
          </span>
        </ArticleLink>
        {published && (
          <time
            dateTime={publishedAt}
            className="bg-primary text-primary-foreground before:border-b-primary absolute bottom-5 -left-2 isolate flex size-12 flex-col items-center justify-center shadow-md before:absolute before:-top-1.5 before:left-0.5 before:rotate-135 before:border-[6.5px] before:border-transparent before:shadow-md before:content-['']"
          >
            <span className="text-sm leading-none font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {published.month}
            </span>
            <span className="text-lg leading-none font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {published.day}
            </span>
            {showYear && (
              <span className="text-2xs mt-0.5 leading-none font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {published.year}
              </span>
            )}
          </time>
        )}
      </CardHeader>
      <CardContent>
        <ArticleLink {...linkProps}>
          <h3 className="h5 hover:text-primary mb-2 transition-colors duration-300">{title}</h3>
        </ArticleLink>
        <p className="text-muted-foreground line-clamp-3 text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto flex gap-4">
        {slug ? (
          <ArticleLink
            {...linkProps}
            className={buttonVariants({
              size: "sm",
              variant: "default",
            })}
          >
            Read Now!
          </ArticleLink>
        ) : null}

        <LinkButton
          href={externalURL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Read the full article on ${externalBlogSource}`}
        >
          {slug ? `or read on ${externalBlogSource}` : `Read on ${externalBlogSource}`}
          <span>
            <LuExternalLink />
          </span>
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
