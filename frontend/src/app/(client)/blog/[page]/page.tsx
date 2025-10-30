import { notFound } from "next/navigation";
import BlogContainer from "@/containers/blog";
import ArticleContainer from "@/containers/article";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/services/medium";

export const dynamicParams = true;

export default async function BlogPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  if (isNaN(Number(params.page))) {
    const articleId = params.page.split("-").pop() || "";

    try {
      console.log("Fetching article for slug:", params.page, articleId);
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
      const slug = article.mediumURL.split("/").pop();
      return { page: slug };
    });

    return [...pageNumbers, ...blogSlugs];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ page: "1" }];
  }
}
