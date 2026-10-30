import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import { SharedAxisXTransition } from "@/components/view-transitions";
import { LIST_GRID_CLASS_NAME, LIST_PAGE_CLASS_NAME } from "@/containers/list-layout";
import ArticleCard from "./article-card";
import type { IBlogPreview } from "@/types";

interface IBlogContainerProps {
  articles: IBlogPreview[]; // items of the current page
  currentPage: number;
  totalPages: number;
}

export default function BlogContainer({ articles, currentPage, totalPages }: IBlogContainerProps) {
  return (
    <div className={LIST_PAGE_CLASS_NAME}>
      <SharedAxisXTransition>
        <MotionGrid className={LIST_GRID_CLASS_NAME}>
          {articles.map((article, index) => (
            <ArticleCard key={article.externalURL} {...article} priority={index === 0} />
          ))}
        </MotionGrid>
      </SharedAxisXTransition>
      <Pagination route="BLOG" totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
