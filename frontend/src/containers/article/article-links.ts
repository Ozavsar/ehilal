import type { ArticleTranslation } from "@/config/translations";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { detectLanguage, type ContentLanguage } from "@/lib/language";
import { getMediumPostId } from "@/lib/services/medium";
import type { IBlogPreview } from "@/types";

// Links from an article page to other articles of the site, picked from the (cached) article list

/** A Medium article readable on this site */
export interface LinkedArticle {
  postId: string;
  title: string;
  path: string;
  thumbnailURL: string;
  publishedAt: string;
}

const RELATED_COUNT = 3;

// "… Serisi #2", "… Series #2", "…Serisi#4 Kriptografi", "… — Web Serisi 1", "… Rehberim #1"
const SERIES_TITLE = /^(.*?)\s*(?:(?:serisi|series)\s*#?|#)\s*(\d+)(?!\d)/iu;

/** Series name (normalised for comparison) and part number of a numbered title, else null */
function parseSeries(title: string): { key: string; part: number } | null {
  const match = SERIES_TITLE.exec(title);
  if (!match?.[1] || !match[2]) return null;
  // "HTML, Listeler ve İçerik Alıştırmaları— Web Serisi 2": the series is the part after the dash
  const name = match[1].split(/[—–]|\s-\s/).pop() ?? "";
  // Case, accents, emoji and punctuation don't count ("📌 Blockchain: …" is "Blockchain: …")
  const key = name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
  return key ? { key, part: Number(match[2]) } : null;
}

interface Candidate extends LinkedArticle {
  language: ContentLanguage;
  tags: string[];
}

function toCandidates(articles: IBlogPreview[]): Candidate[] {
  return articles.flatMap((article) => {
    const postId = article.slug ? getMediumPostId(article.slug) : null;
    if (!article.slug || !postId) return [];
    return {
      postId,
      title: article.title,
      path: INTERNAL_ROUTES.BLOG.href(article.slug),
      thumbnailURL: article.thumbnailURL,
      publishedAt: article.publishedAt,
      // Same detection as the blog card
      language: detectLanguage(`${article.title} ${article.description}`),
      tags: article.tags ?? [],
    };
  });
}

const toLinked = ({
  postId,
  title,
  path,
  thumbnailURL,
  publishedAt,
}: Candidate): LinkedArticle => ({
  postId,
  title,
  path,
  thumbnailURL,
  publishedAt,
});

export interface ArticleLinks {
  /** Medium post id → /blog/<slug>, for links in the text that point at a republished post */
  postPaths: Map<string, string>;
  /** Neighbouring parts of a numbered series in the same language */
  series: { previous: LinkedArticle | null; next: LinkedArticle | null } | null;
  /** Same language, most shared Medium tags first, then the newest */
  related: LinkedArticle[];
}

export function getArticleLinks(
  articles: IBlogPreview[],
  article: { id: string; title: string },
  language: ContentLanguage,
  translation: ArticleTranslation | null,
): ArticleLinks {
  const candidates = toCandidates(articles);
  const postPaths = new Map(candidates.map((c) => [c.postId, c.path]));
  const own = candidates.find((c) => c.postId === article.id);
  const others = candidates.filter((c) => c.postId !== article.id && c.language === language);

  let series: ArticleLinks["series"] = null;
  const current = parseSeries(article.title);
  if (current) {
    const parts = others.flatMap((c) => {
      const parsed = parseSeries(c.title);
      return parsed?.key === current.key ? [{ ...parsed, article: c }] : [];
    });
    // The closest part on each side (a series may skip a number); the list is newest first
    const previous = parts
      .filter((p) => p.part < current.part)
      .reduce<(typeof parts)[number] | null>(
        (best, p) => (!best || p.part > best.part ? p : best),
        null,
      );
    const next = parts
      .filter((p) => p.part > current.part)
      .reduce<(typeof parts)[number] | null>(
        (best, p) => (!best || p.part < best.part ? p : best),
        null,
      );
    if (previous || next) {
      series = {
        previous: previous ? toLinked(previous.article) : null,
        next: next ? toLinked(next.article) : null,
      };
    }
  }

  // Each article is linked once at the end of the page
  const linked = new Set([series?.previous?.path, series?.next?.path, translation?.path]);
  const tags = new Set(own?.tags);
  const sharedTags = (c: Candidate) => c.tags.filter((tag) => tags.has(tag)).length;
  const related = others
    .filter((c) => !linked.has(c.path))
    .map((c) => ({ c, score: sharedTags(c) }))
    // Stable sort: equal scores keep the list's newest-first order
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_COUNT)
    .map(({ c }) => toLinked(c));

  return { postPaths, series, related };
}
