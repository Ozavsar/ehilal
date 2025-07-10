import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import BlogContainer from "@/containers/blog";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllArticlePreviews } from "@/lib/services/medium";

export const dynamicParams = true;

const getCachedArticles = unstable_cache(
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
    revalidate: 86400, // 24 hours
  },
);

export default async function BlogPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  try {
    const articles = await getCachedArticles();

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
    console.error("Error in Blog page:", error);
    return notFound();
  }
}

export async function generateStaticParams() {
  try {
    const articles = await getCachedArticles();
    const pageCount = Math.ceil((articles?.length || 0) / ITEMS_PER_PAGE);

    return Array.from({ length: pageCount || 1 }, (_, i) => ({
      slug: (i + 1).toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ slug: "1" }];
  }
}
