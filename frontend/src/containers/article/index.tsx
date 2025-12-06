import MediumRenderer from "./medium-renderer";
import type { IBlog } from "@/types";

interface IArticleContainerProps {
  article: IBlog;
}

export default async function ArticleContainer({
  article,
}: IArticleContainerProps) {
  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <MediumRenderer paragraphs={article.paragraphs} />
    </main>
  );
}
