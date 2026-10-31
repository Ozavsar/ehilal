import Link from "next/link";
import { BrandIcon } from "@/components/brand-icon";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import type { ArticleTranslation } from "@/config/translations";
import type { ContentLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import { ARTICLE_STRINGS, formatArticleDate } from "./strings";

/** Author, publication date (and the update date when it is another day) and reading time */
export function ArticleByline({
  author,
  publishedAt,
  updatedAt,
  minutes,
  language,
}: {
  author: string;
  publishedAt?: string;
  updatedAt?: string;
  minutes: number;
  language: ContentLanguage;
}) {
  const strings = ARTICLE_STRINGS[language];
  const published = formatArticleDate(publishedAt, language);
  const updated = formatArticleDate(updatedAt, language);
  const separator = <span aria-hidden="true">·</span>;

  return (
    <p className="text-on-surface-variant type-label-large flex flex-wrap items-center gap-x-2 gap-y-1">
      {/* The site's home page is the author's profile page (ProfilePage JSON-LD) */}
      <Link
        href={INTERNAL_ROUTES.HOME.path}
        rel="author"
        className="text-on-surface hover:text-primary ease-standard transition-colors duration-200"
      >
        {author}
      </Link>
      {published && (
        <>
          {separator}
          <time dateTime={publishedAt}>{published}</time>
        </>
      )}
      {updated && updated !== published && (
        <>
          {separator}
          <span>
            {strings.updated} <time dateTime={updatedAt}>{updated}</time>
          </span>
        </>
      )}
      {separator}
      <span>{strings.minutesRead(minutes)}</span>
    </p>
  );
}

/** M3 assist chip to the article's version in the other language, in that language */
export function TranslationChip({ translation }: { translation: ArticleTranslation }) {
  return (
    <Link
      href={translation.path}
      hrefLang={translation.language}
      lang={translation.language}
      className="state-layer touch-target border-outline-variant text-on-surface type-label-large focus-visible:outline-primary inline-flex h-8 w-fit items-center gap-2 rounded-sm border ps-2 pe-4 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Icon name="language" size={20} className="text-primary" />
      {ARTICLE_STRINGS[translation.language].readInThisLanguage}
    </Link>
  );
}

/** Member-only post: Medium returned only its opening, so the reader is sent there for the rest */
export function LockedNotice({
  mediumUrl,
  language,
}: {
  mediumUrl: string;
  language: ContentLanguage;
}) {
  const strings = ARTICLE_STRINGS[language];
  return (
    // A note, not an <aside>: complementary landmarks belong at the top level, outside <main>
    <div
      role="note"
      aria-labelledby="locked-title"
      className="bg-secondary-container text-on-secondary-container mt-10 flex flex-col items-start gap-3 rounded-md p-4 sm:p-6"
    >
      <p id="locked-title" className="type-title-medium flex items-center gap-2">
        <Icon name="lock" size={20} />
        {strings.lockedTitle}
      </p>
      <p className="type-body-medium">{strings.lockedText}</p>
      <a
        href={mediumUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "default" }), "mt-1")}
      >
        {strings.readFullOnMedium}
        <Icon name="open_in_new" />
        <span className="sr-only"> {strings.opensInNewTab}</span>
      </a>
    </div>
  );
}

/** "Originally published on Medium": the source of the republished text */
export function ArticleOrigin({
  mediumUrl,
  language,
}: {
  mediumUrl: string;
  language: ContentLanguage;
}) {
  const strings = ARTICLE_STRINGS[language];
  return (
    <p className="text-on-surface-variant type-body-medium flex items-center gap-3">
      <BrandIcon brand="medium" size={20} className="shrink-0" />
      <a
        href={mediumUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4 hover:decoration-2"
      >
        {strings.originallyPublished}
        <span className="sr-only"> {strings.opensInNewTab}</span>
      </a>
    </p>
  );
}
