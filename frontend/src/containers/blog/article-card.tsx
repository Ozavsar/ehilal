import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import LinkButton from "@/components/link-button";
import { ARTICLE_OPEN, ArticleMorph } from "@/components/view-transitions";
import { detectLanguage } from "@/lib/language";
import { getMediumPostId } from "@/lib/services/medium";
import { LIST_CARD_IMAGE_SIZES } from "@/containers/list-layout";
import type { IBlogPreview } from "@/types";

// Pin the time zone so the day doesn't depend on the server
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

function formatDate(date: Date) {
  return isNaN(date.getTime()) ? null : DATE_FORMAT.format(date);
}

interface ArticleLinkProps {
  slug: string | null;
  externalURL: string;
  /** A pointer-only copy of the card's title link: out of the tab order and the accessibility tree */
  duplicate?: boolean;
  className?: string;
  children: ReactNode;
}

// Internal article page when the article is readable here, otherwise the source site
function ArticleLink({ slug, externalURL, duplicate, className, children }: ArticleLinkProps) {
  const duplicateProps = duplicate ? { tabIndex: -1, "aria-hidden": true } : {};
  if (slug) {
    return (
      <Link
        href={INTERNAL_ROUTES.BLOG.href(slug)}
        transitionTypes={[ARTICLE_OPEN]}
        className={className}
        {...duplicateProps}
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
      className={className}
      {...duplicateProps}
    >
      {children}
      {!duplicate && <span className="sr-only"> (opens in a new tab)</span>}
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
  // publishedAt is ISO 8601 ("" if unknown, then no date is shown)
  const published = formatDate(new Date(publishedAt));
  const linkProps = { slug, externalURL };
  const lang = detectLanguage(`${title} ${description}`);
  // Articles readable here morph into the article page: thumbnail → cover, title → <h1>
  const postId = slug ? getMediumPostId(slug) : null;
  const morph = (part: "cover" | "title", node: ReactNode) =>
    postId ? (
      <ArticleMorph postId={postId} part={part}>
        {node}
      </ArticleMorph>
    ) : (
      node
    );

  return (
    <Card interactive className="h-full gap-0 p-0">
      <CardHeader className="p-0">
        {morph(
          "cover",
          <ArticleLink
            {...linkProps}
            duplicate
            // Rounded like the card corner it sits in, so the morph starts from the same shape
            className="group relative block overflow-hidden rounded-t-md"
          >
            <Image
              src={thumbnailURL || "/images/blog/default-blog.jpg"}
              // Decorative: the title right below names the card
              alt=""
              width={640}
              height={360}
              sizes={LIST_CARD_IMAGE_SIZES}
              blurDataURL={blurDataURL}
              placeholder={blurDataURL ? "blur" : "empty"}
              draggable={false}
              // The first card is the LCP candidate on the list page
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className="ease-standard aspect-video w-full object-cover duration-300 select-none group-hover:scale-105 motion-safe:transition-transform"
            />
            <span
              aria-hidden="true"
              className="bg-scrim/40 ease-standard absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <span className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full">
                <Icon name={slug ? "menu_book" : "open_in_new"} />
              </span>
            </span>
          </ArticleLink>,
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pb-0">
        {published && (
          <time dateTime={publishedAt} className="type-label-medium text-on-surface-variant">
            {published}
          </time>
        )}
        <ArticleLink
          {...linkProps}
          className="hover:text-primary ease-standard transition-colors duration-200"
        >
          {morph(
            "title",
            <h2 lang={lang} className="type-title-large line-clamp-3">
              {title}
            </h2>,
          )}
        </ArticleLink>
        <p lang={lang} className="type-body-medium text-on-surface-variant line-clamp-3">
          {description}
        </p>
      </CardContent>
      {/* M3 card actions: end-aligned, the main action last */}
      <CardFooter className="mt-auto flex flex-wrap items-center justify-end gap-2 p-4">
        <LinkButton
          href={externalURL}
          target="_blank"
          rel="noopener noreferrer"
          // Without an article page here, the title already links to the source site
          {...(slug ? {} : { tabIndex: -1, "aria-hidden": true })}
        >
          Read on {externalBlogSource}
          <Icon name="open_in_new" />
        </LinkButton>
        {slug ? (
          <ArticleLink {...linkProps} duplicate className={buttonVariants({ variant: "default" })}>
            Read now
          </ArticleLink>
        ) : null}
      </CardFooter>
    </Card>
  );
}
