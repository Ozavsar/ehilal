import MediumRenderer from "./medium-renderer";
import type { IBlog } from "@/types";

interface IArticleContainerProps {
  article: IBlog;
}

export default function ArticleContainer({ article }: IArticleContainerProps) {
  return (
    <main className="lg:px-page-gutter container flex min-h-screen flex-col justify-between sm:pb-8">
      <MediumRenderer paragraphs={article.paragraphs} />
    </main>
  );
}
