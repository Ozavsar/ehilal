import { IBlog } from "@/types";
import MediumRenderer from "./medium-renderer";

interface IArticleContainerProps {
  article: IBlog;
}

export default async function ArticleContainer({
  article,
}: IArticleContainerProps) {
  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <div className="flex flex-col">
        <MediumRenderer paragraphs={article.paragraphs} />
      </div>
    </main>
  );
}
