import { cache } from "react";
import { notFound, permanentRedirect, unstable_rethrow } from "next/navigation";
import { Metadata } from "next";
import ArticleContainer from "@/containers/article";
import BlogContainer from "@/containers/blog";
import JsonLd from "@/components/json-ld";
import TitleSection from "@/components/title-section";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { LIST_SEO, PAGE_SEO, listPageSeo } from "@/config/seo";
import { getTranslation, type ArticleTranslation } from "@/config/translations";
import { getSiteSettings } from "@/lib/services";
import { getAllArticles, getArticleBySlug, getArticlesPage } from "@/lib/services/blog";
import { getMediumPostId } from "@/lib/services/medium";
import { getPageTitle } from "@/lib/services/pages";
import { orNotFound } from "@/lib/api/fetchAPI";
import { withBlurDataURLs } from "@/lib/getImage";
import { detectArticleLanguage } from "@/lib/language";
import { articleDescription, stripSymbols } from "@/lib/seo-text";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildMeta,
  buildPageMeta,
  jsonLdGraph,
  listBreadcrumbJsonLd,
  ogCardImage,
} from "@/lib/metadata";
import type { IBlog } from "@/types";

export const dynamicParams = true;

// A list page number or an article slug ("<title>-<medium post id>"); "01", "1e0" etc. are neither
const parsePageNumber = (segment: string) => (/^[1-9]\d*$/.test(segment) ? Number(segment) : NaN);

const getArticleCard = (article: IBlog) =>
  ogCardImage(stripSymbols(article.title), stripSymbols(article.title));

const getArticleImage = (article: IBlog) =>
  article.previewImage?.id
    ? {
        url: `https://miro.medium.com/v2/resize:fit:1200/${article.previewImage.id}`,
        alt: article.previewImage.alt || stripSymbols(article.title),
      }
    : getArticleCard(article);

const countWords = (article: IBlog) =>
  article.paragraphs.reduce((sum, { text }) => sum + (text.match(/\S+/g)?.length ?? 0), 0);

// The post query has no dates; the (cached) article list does
const getArticleDates = cache(
  async (slug: string): Promise<{ publishedAt?: string; updatedAt?: string }> => {
    try {
      const preview = (await getAllArticles()).find((article) => article.slug === slug);
      return { publishedAt: preview?.publishedAt || undefined, updatedAt: preview?.updatedAt };
    } catch (error) {
      // Every source failed (already logged): no dates
      unstable_rethrow(error);
      return {};
    }
  },
);

// The article in the other language (config/translations.ts), if the (cached) list has it
const getArticleTranslation = cache(async (postId: string): Promise<ArticleTranslation | null> => {
  const translation = getTranslation(postId);
  if (!translation) return null;
  try {
    const other = (await getAllArticles()).find(
      (article) => article.slug && getMediumPostId(article.slug) === translation.id,
    );
    return other?.slug
      ? {
          language: translation.language,
          title: other.title,
          path: INTERNAL_ROUTES.BLOG.href(other.slug),
        }
      : null;
  } catch (error) {
    // Every source failed (already logged): no translation link
    unstable_rethrow(error);
    return null;
  }
});

async function ArticlePage({ article }: { article: IBlog }) {
  const [site, dates, translation] = await Promise.all([
    getSiteSettings(),
    getArticleDates(article.slug),
    getArticleTranslation(article.id),
  ]);
  const path = INTERNAL_ROUTES.BLOG.href(article.slug);
  const language = detectArticleLanguage(article);
  const structuredData = jsonLdGraph(
    blogPostingJsonLd({
      path,
      headline: article.title,
      description: articleDescription(article, language, site.siteName),
      imageUrls: [getArticleImage(article).url, getArticleCard(article).url],
      basedOnUrl: article.mediumUrl,
      wordCount: countWords(article),
      datePublished: dates.publishedAt,
      dateModified: dates.updatedAt,
      language,
      site,
    }),
    breadcrumbJsonLd([
      { name: INTERNAL_ROUTES.BLOG.label, path: INTERNAL_ROUTES.BLOG.href() },
      { name: article.title, path },
    ]),
  );

  return (
    <>
      <JsonLd data={structuredData} />
      <ArticleContainer
        article={article}
        language={language}
        publishedAt={dates.publishedAt}
        updatedAt={dates.updatedAt}
        translation={translation}
      />
    </>
  );
}

export default async function BlogPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;
  const pageNum = parsePageNumber(page);

  if (isNaN(pageNum)) {
    // Unknown ids → null; a Medium failure throws so ISR keeps the last good page, not a 404
    const article = await getArticleBySlug(page);
    if (!article) {
      notFound();
    }
    if (article.slug !== page && getMediumPostId(article.slug) === article.id) {
      permanentRedirect(INTERNAL_ROUTES.BLOG.href(article.slug));
    }
    return <ArticlePage article={article} />;
  }

  const result = await getArticlesPage(pageNum);
  if (!result) {
    notFound();
  }

  const [articles, title] = await Promise.all([
    withBlurDataURLs(result.items, (article) => article.thumbnailURL),
    orNotFound(getPageTitle("blog-page", ["blog-title"])),
  ]);

  // The list page title lives here, not in a blog layout: an article page has its own <h1>
  return (
    <>
      <JsonLd data={jsonLdGraph(listBreadcrumbJsonLd(INTERNAL_ROUTES.BLOG, pageNum))} />
      <TitleSection
        as="h1"
        text={title.page_title}
        backgroundText={title.page_title_background}
        subtitle={LIST_SEO.BLOG.subtitle}
      />
      <BlogContainer articles={articles} currentPage={pageNum} totalPages={result.totalPages} />
    </>
  );
}

// Only list pages are prebuilt: per-article Medium requests from parallel build workers get
// throttled (503) and one failed prerender fails the whole build. Articles render on first request.
export async function generateStaticParams() {
  try {
    const articles = await getAllArticles();
    const pageCount = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
    return Array.from({ length: pageCount }, (_, i) => ({ page: (i + 1).toString() }));
  } catch {
    // Every source is down (already logged): render on demand instead of failing the build
    return [];
  }
}

// 404s get no canonical or social tags
const notFoundMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata => ({
  title,
  description,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parsePageNumber(page);
  const isArticle = isNaN(pageNum);

  // Invalid segments 404 without a network request
  if (isArticle && !getMediumPostId(page)) {
    return notFoundMeta(PAGE_SEO.ARTICLE_NOT_FOUND);
  }

  try {
    if (isArticle) {
      const article = await getArticleBySlug(page);
      if (!article) {
        return notFoundMeta(PAGE_SEO.ARTICLE_NOT_FOUND);
      }

      const [{ siteName }, dates, translation] = await Promise.all([
        getSiteSettings(),
        getArticleDates(article.slug),
        getArticleTranslation(article.id),
      ]);
      const path = INTERNAL_ROUTES.BLOG.href(article.slug);
      const language = detectArticleLanguage(article);
      // Self-canonical: the site's copy should rank, not the Medium original
      return buildMeta({
        title: article.title,
        description: articleDescription(article, language, siteName),
        path,
        type: "article",
        image: getArticleImage(article),
        language,
        article: { publishedTime: dates.publishedAt, modifiedTime: dates.updatedAt },
        ...(translation && {
          languages: { [language]: path, [translation.language]: translation.path },
        }),
      });
    }

    const result = await getArticlesPage(pageNum);
    if (!result) {
      return notFoundMeta(PAGE_SEO.NOT_FOUND);
    }

    return buildPageMeta(listPageSeo(LIST_SEO.BLOG, pageNum), INTERNAL_ROUTES.BLOG.href(pageNum));
  } catch {
    // The page throws the same (cached) error and error.tsx shows it
    return buildPageMeta(LIST_SEO.BLOG, INTERNAL_ROUTES.BLOG.href());
  }
}
