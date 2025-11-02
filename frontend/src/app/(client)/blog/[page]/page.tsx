import { notFound } from "next/navigation";
import { Metadata } from "next";
import ArticleContainer from "@/containers/article";
import BlogContainer from "@/containers/blog";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/services/medium";
import { getCleanSlug } from "@/lib/utils";
import { buildMeta } from "@/lib/metadata";

export const dynamicParams = true;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

export default async function BlogPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  if (isNaN(Number(params.page))) {
    const articleId = params.page.split("-").pop() || "";

    try {
      const article = await getSingleArticle(articleId);

      if (!article) {
        return notFound();
      }

      return <ArticleContainer article={article} />;
    } catch (error) {
      console.error("Error fetching article:", params.page, error);
      return notFound();
    }
  } else {
    const pageNum = parseInt(params.page ?? "1", 10);

    if (pageNum < 1) {
      return notFound();
    }

    try {
      const articles = await getAllArticlePreviews();

      if (!articles || articles.length === 0) {
        return notFound();
      }

      const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
      if (pageNum > totalPages) {
        return notFound();
      }

      return (
        <BlogContainer articles={articles} pageNumber={pageNum.toString()} />
      );
    } catch (error) {
      return notFound();
    }
  }
}

export async function generateStaticParams() {
  try {
    const articles = await getAllArticlePreviews();
    const pageCount = Math.ceil((articles?.length || 0) / ITEMS_PER_PAGE);

    const pageNumbers = Array.from({ length: pageCount || 1 }, (_, i) => ({
      page: (i + 1).toString(),
    }));

    const blogSlugs = articles.map((article) => {
      const slug = getCleanSlug(article.mediumURL.split("/").pop()!);
      return { page: slug };
    });

    return [...pageNumbers, ...blogSlugs];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ page: "1" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  try {
    const { page } = await params;

    if (isNaN(Number(page))) {
      const articleId = page.split("-").pop() || "";
      const article = await getSingleArticle(articleId);
      if (!article) {
        return buildMeta({
          title: "Article Not Found",
          description: "The requested article could not be found.",
          path: `/blog/${page}`,
        });
      }

      return buildMeta({
        title: article.title,
        description:
          article.description ||
          `
          Read the article "${article.title}" by ${SITE_NAME}.`,
        path: `/blog/${page}`,
        type: "article",
        image: {
          url: article.thumbnailURL,
          alt: article.title,
        },
      });
    }

    const pageNum = parseInt(page, 10);
    if (pageNum < 1) throw new Error("Invalid page number");

    const articles = await getAllArticlePreviews();
    const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
    if (pageNum > totalPages) throw new Error("Page exceeds total pages");

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
  } catch (error) {
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
