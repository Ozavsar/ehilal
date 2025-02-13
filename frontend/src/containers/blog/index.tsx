import TitleSection from "@/components/title-section";
import ArticleCard from "./article-card";
import Pagination from "@/components/pagination";
import { ITEMS_PER_PAGE } from "@/config/constants";
import type { IBlog } from "@/types.d";
import { Suspense } from "react";

export default async function BlogContainer({
  articles,
  pageNumber,
}: {
  articles: IBlog[];
  pageNumber: string;
}) {
  const currentPage = parseInt(pageNumber, 10);

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  articles = articles
    ? articles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <TitleSection text="my blog" backgroundText="medium" />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.mediumURL} {...article} />
          ))}
        </div>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}
