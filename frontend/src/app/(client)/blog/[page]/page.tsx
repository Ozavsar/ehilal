import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import ArticleContainer from "@/containers/article";
import BlogContainer from "@/containers/blog";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { getAllArticles, getArticleBySlug, getArticlesPage } from "@/lib/services/blog";
import { getMediumPostId } from "@/lib/services/medium";
import { buildMeta } from "@/lib/metadata";

export const dynamicParams = true;

// The segment is either a list page number or an article slug ("<title>-<medium post id>").
// Only canonical page numbers are valid ("01", "1.5", "1e0" etc. would be duplicate pages).
const parsePageNumber = (segment: string) => (/^[1-9]\d*$/.test(segment) ? Number(segment) : NaN);

export default async function BlogPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;
  const pageNum = parsePageNumber(page);

  if (isNaN(pageNum)) {
    // Unknown ids return null; a Medium network/HTTP failure throws so error.tsx handles it and
    // ISR keeps serving the last good version instead of caching a redirect or a 404
    const article = await getArticleBySlug(page);
    if (!article) {
      notFound();
    }
    if (article.slug !== page && getMediumPostId(article.slug) === article.id) {
      permanentRedirect(INTERNAL_ROUTES.BLOG.href(article.slug));
    }
    return <ArticleContainer article={article} />;
  }

  const result = await getArticlesPage(pageNum);
  if (!result) {
    notFound();
  }

  return (
    <BlogContainer articles={result.items} currentPage={pageNum} totalPages={result.totalPages} />
  );
}

export async function generateStaticParams() {
  try {
    const articles = await getAllArticles();
    const pageCount = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
    const pages = Array.from({ length: pageCount }, (_, i) => ({ page: (i + 1).toString() }));
    const slugs = articles.flatMap((article) => (article.slug ? [{ page: article.slug }] : []));
    return [...pages, ...slugs];
  } catch {
    // Every source is down (already logged): render the pages on demand instead of failing the build
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parsePageNumber(page);
  const isArticle = isNaN(pageNum);

  // Invalid segments 404 in the page; don't fetch anything for them
  if (isArticle && !getMediumPostId(page)) {
    return buildMeta({
      title: "Article Not Found",
      description: "The requested article could not be found.",
      path: `/blog/${page}`,
    });
  }

  try {
    if (isArticle) {
      const article = await getArticleBySlug(page);
      if (!article) {
        return buildMeta({
          title: "Article Not Found",
          description: "The requested article could not be found.",
          path: `/blog/${page}`,
        });
      }

      return buildMeta({
        title: article.title,
        description: article.subtitle || `Read the article "${article.title}" by ${SITE_NAME}.`,
        path: INTERNAL_ROUTES.BLOG.href(article.slug),
        type: "article",
        image: {
          url: article.previewImage?.id
            ? `https://miro.medium.com/v2/resize:fit:1200/${article.previewImage.id}`
            : `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}`,
          alt: article.previewImage?.alt || article.title,
        },
      });
    }

    const result = await getArticlesPage(pageNum);
    if (!result) {
      return buildMeta({
        title: "Page Not Found",
        description: "Requested page exceeds available blog listings.",
        path: "/blog",
      });
    }

    const title = pageNum > 1 ? `Blog – Page ${pageNum}` : "Blog";
    const description = `Explore ${SITE_NAME}'s latest articles and insights${
      pageNum > 1 ? ` on page ${pageNum}` : ""
    }.`;

    return buildMeta({
      title,
      description,
      path: `/blog${pageNum > 1 ? `/${pageNum}` : ""}`,
      type: "website",
      image: {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
        alt: `Blog Articles by ${SITE_NAME}`,
      },
    });
  } catch {
    // The page throws the same (cached) error and error.tsx shows it
    return buildMeta({
      title: "Blog",
      description: `Read ${SITE_NAME}'s latest articles and insights.`,
      path: "/blog",
      image: {
        url: `${SITE_URL}/api/og?title=blog`,
        alt: `Blog Articles by ${SITE_NAME}`,
      },
    });
  }
}
