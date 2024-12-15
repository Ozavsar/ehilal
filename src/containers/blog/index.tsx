import TitleSection from "@/components/title-section";
import ArticleCard from "./components/article-card";
import type { IBlog } from "@/types.d";
import Pagination from "@/components/pagination";
import { ITEMS_PER_PAGE } from "@/config/constants";

export default async function BlogContainer({
  articles,
  searchParams,
}: {
  articles: IBlog[];
  searchParams: { page?: string };
}) {
  const currentPage = parseInt(searchParams.page || "1", 10);

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  articles = articles
    ? articles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex flex-col sm:pb-20">
      <TitleSection plainText="my" coloredText="blog" backgroundText="posts" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* <BlogList articles={articles} /> */}
        {articles.map((article) => (
          <ArticleCard key={article.mediumUrl} {...article} />
        ))}
      </div>
      <Pagination totalPages={totalPages} />
    </main>
  );
}
