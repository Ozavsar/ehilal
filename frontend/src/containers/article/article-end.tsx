import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Card } from "@/components/ui/card";
import type { ContentLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import type { ArticleLinks, LinkedArticle } from "./article-links";
import { ARTICLE_STRINGS, formatArticleDate } from "./strings";

// Related thumbnails: 112px wide on compact screens, 160px from medium
const THUMBNAIL_SIZES = "(min-width: 600px) 160px, 112px";

// The card's one link, stretched over the whole card (its ::after covers the card), so the card is
// a single click target and a single stop for keyboard and screen reader users
const STRETCHED_LINK =
  "ease-standard transition-colors duration-200 after:absolute after:inset-0 hover:text-primary";

/** An M3 filled card leading to another article: a label above its title */
export function ArticleLinkCard({
  label,
  title,
  href,
  icon,
  align = "start",
  hrefLang,
  lang,
}: {
  label: ReactNode;
  title: string;
  href: string;
  icon: "arrow_back" | "arrow_forward" | "language";
  align?: "start" | "end";
  hrefLang?: string;
  lang?: string;
}) {
  return (
    <Card
      interactive
      lang={lang}
      className={cn("w-full gap-1 p-4", align === "end" && "items-end text-end")}
    >
      <span className="text-on-surface-variant type-label-large flex items-center gap-2">
        {align === "start" && <Icon name={icon} size={20} />}
        {label}
        {align === "end" && <Icon name={icon} size={20} />}
      </span>
      <Link href={href} hrefLang={hrefLang} className={cn("type-title-medium", STRETCHED_LINK)}>
        {title}
      </Link>
    </Card>
  );
}

/** Previous and next part of a numbered series */
export function SeriesNavigation({
  series,
  language,
}: {
  series: NonNullable<ArticleLinks["series"]>;
  language: ContentLanguage;
}) {
  const strings = ARTICLE_STRINGS[language];
  return (
    <nav aria-labelledby="series-title" className="mt-12 flex flex-col gap-4">
      <h2 id="series-title" className="text-on-surface type-title-large">
        {strings.seriesTitle}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {series.previous && (
          <li className="flex">
            <ArticleLinkCard
              label={strings.previousPart}
              title={series.previous.title}
              href={series.previous.path}
              icon="arrow_back"
            />
          </li>
        )}
        {series.next && (
          <li className="flex sm:col-start-2">
            <ArticleLinkCard
              label={strings.nextPart}
              title={series.next.title}
              href={series.next.path}
              icon="arrow_forward"
              align="end"
            />
          </li>
        )}
      </ul>
    </nav>
  );
}

function RelatedArticleCard({
  article,
  language,
}: {
  article: LinkedArticle;
  language: ContentLanguage;
}) {
  const published = formatArticleDate(article.publishedAt, language, "short");
  return (
    <Card interactive className="flex-row items-center gap-4 p-3">
      <div className="bg-surface-container relative aspect-video w-28 shrink-0 overflow-hidden rounded-sm sm:w-40">
        <Image
          src={article.thumbnailURL || "/images/blog/default-blog.jpg"}
          // Decorative: the title next to it names the card
          alt=""
          fill
          sizes={THUMBNAIL_SIZES}
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {published && (
          <time
            dateTime={article.publishedAt}
            className="text-on-surface-variant type-label-medium"
          >
            {published}
          </time>
        )}
        <h3 className="type-title-medium line-clamp-3">
          <Link href={article.path} className={STRETCHED_LINK}>
            {article.title}
          </Link>
        </h3>
      </div>
    </Card>
  );
}

/** Up to three other articles in the same language */
export function RelatedArticles({
  articles,
  language,
}: {
  articles: LinkedArticle[];
  language: ContentLanguage;
}) {
  return (
    <section aria-labelledby="related-title" className="mt-12 flex flex-col gap-4">
      <h2 id="related-title" className="text-on-surface type-title-large">
        {ARTICLE_STRINGS[language].relatedTitle}
      </h2>
      <ul className="flex flex-col gap-3">
        {articles.map((article) => (
          <li key={article.postId}>
            <RelatedArticleCard article={article} language={language} />
          </li>
        ))}
      </ul>
    </section>
  );
}
