import { cache } from "react";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { BlogSource, type IBlog, type IBlogPreview } from "@/types";
import {
  getAllArticlePreviews as getMediumArticles,
  getMediumPostId,
  getSingleArticle,
} from "./medium";
import { getAllArticlePreviews as getSubstackArticles } from "./substack";

const SOURCES = [
  { name: BlogSource.MEDIUM, load: getMediumArticles },
  { name: BlogSource.SUBSTACK, load: getSubstackArticles },
];

const toTime = (iso: string) => Date.parse(iso) || 0;

// Medium + Substack, newest first. A failing source is logged and skipped (complete: false);
// throws only when every source fails. cache() shares the result within one request.
const loadArticles = cache(async () => {
  const errors: unknown[] = [];
  const lists = await Promise.all(
    SOURCES.map(({ name, load }) =>
      load().catch((error: unknown): IBlogPreview[] => {
        console.error(`Failed to load ${name} articles:`, error);
        errors.push(error);
        return [];
      }),
    ),
  );

  if (errors.length === SOURCES.length) {
    throw new AggregateError(errors, "Failed to load blog articles from every source");
  }

  const articles = lists.flat();
  articles.sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
  return { articles, complete: errors.length === 0 };
});

export async function getAllArticles(): Promise<IBlogPreview[]> {
  return (await loadArticles()).articles;
}

// One list page, or null when the page doesn't exist
export async function getArticlesPage(page: number) {
  const { articles, complete } = await loadArticles();
  const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));

  if (!Number.isInteger(page) || page < 1 || page > totalPages) {
    // With a source down the list is shorter; don't turn its later pages into cached 404s
    if (!complete && page > totalPages) {
      throw new Error(`Blog page ${page} is unavailable while an article source is failing`);
    }
    return null;
  }

  return {
    items: articles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    totalPages,
  };
}

// Readable article for a /blog/<slug> segment. Segments without a valid Medium id return null
// without a network request. Shared by generateMetadata and the page (one Medium call per request).
export const getArticleBySlug = cache(async (slug: string): Promise<IBlog | null> => {
  const postId = getMediumPostId(slug);
  return postId ? getSingleArticle(postId) : null;
});
