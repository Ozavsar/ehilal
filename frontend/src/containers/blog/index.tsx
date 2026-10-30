import { Suspense } from "react";
import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import ArticleCard from "./article-card";
import type { IBlogPreview } from "@/types";

interface IBlogContainerProps {
  articles: IBlogPreview[]; // items of the current page
  currentPage: number;
  totalPages: number;
}

export default function BlogContainer({ articles, currentPage, totalPages }: IBlogContainerProps) {
  return (
    <main className="lg:px-page-gutter container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <MotionGrid>
          {articles.map((article) => (
            <ArticleCard key={article.externalURL} {...article} />
          ))}
        </MotionGrid>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </main>
  );
}
