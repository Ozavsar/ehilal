import { notFound } from "next/navigation";
import { Metadata } from "next";
import ArticleContainer from "@/containers/article";
import BlogContainer from "@/containers/blog";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/services/medium";
import { getCleanSlug } from "@/lib/utils";

export const dynamicParams = true;

export default async function BlogPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  if (isNaN(Number(params.page))) {
    const articleId = params.page.split("-").pop() || "";

    try {
      // console.log("Fetching article for slug:", params.page, articleId);
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
        return {
          title: "Article Not Found | Blog",
          description: "The requested article could not be found.",
        };
      }

      return {
        title: `${article.title} | Blog`,
        description: article.description || "Read this article on our blog.",
        openGraph: {
          title: article.title,
          description: article.description,
          type: "article",
          url: article.mediumURL,
          images: article.thumbnailURL ? [article.thumbnailURL] : undefined,
        },
      };
    }

    const pageNum = parseInt(page ?? "1", 10);
    if (pageNum < 1) {
      return {
        title: "Page Not Found | Blog",
        description: "Invalid blog page number.",
      };
    }

    const articles = await getAllArticlePreviews();
    const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
    if (pageNum > totalPages) {
      return {
        title: "Page Not Found | Blog",
        description: "Requested page exceeds available content.",
      };
    }

    return {
      title: `Blog – Page ${pageNum}`,
      description: `Explore our latest articles on page ${pageNum}.`,
      openGraph: {
        title: `Blog – Page ${pageNum}`,
        description: `Discover insightful articles and updates – Page ${pageNum}.`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog",
      description: "Read our latest articles and insights.",
    };
  }
}
