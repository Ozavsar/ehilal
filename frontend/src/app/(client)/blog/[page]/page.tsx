import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import BlogContainer from "@/containers/blog";
import ArticleContainer from "@/containers/article";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/services/medium";

export const dynamicParams = true;

const getCachedArticlePreviews = unstable_cache(
  async () => {
    try {
      return await getAllArticlePreviews();
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  },
  ["articles-list"],
  {
    revalidate: 3600, // 1 hour
  },
);

export default async function BlogPage({
  params,
}: {
  params: { page: string };
}) {
  if (isNaN(Number(params.page))) {
    const articleId = params.page.split("-").pop() || "";

    const getCachedArticle = unstable_cache(
      async () => {
        try {
          return await getSingleArticle(articleId);
        } catch (error) {
          console.error("Error fetching articles:", error);
          return null;
        }
      },
      ["article-" + articleId],
      {
        revalidate: 3600, // 1 hour
        tags: ["articles"],
      },
    );

    try {
      console.log("Fetching article for slug:", params.page, articleId);
      const article = await getCachedArticle();

      if (!article) {
        return notFound();
      }

      return <ArticleContainer article={article} />;
    } catch (error) {
      console.error("Error fetching article:", error);
      return notFound();
    }
  } else {
    const pageNum = parseInt(params.page ?? "1", 10);

    if (pageNum < 1) {
      return notFound();
    }

    try {
      const articles = await getCachedArticlePreviews();

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
    const articles = await getCachedArticlePreviews();
    const pageCount = Math.ceil((articles?.length || 0) / ITEMS_PER_PAGE);

    const pageNumbers = Array.from({ length: pageCount || 1 }, (_, i) => ({
      slug: (i + 1).toString(),
    }));

    const blogSlugs = articles.map((article) => {
      const slug = article.mediumURL.split("/").pop();
      return { slug };
    });

    return [...pageNumbers, ...blogSlugs];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ slug: "1" }];
  }
}
