import MediumRenderer from "./medium-renderer";
import type { IBlog } from "@/types";

interface IArticleContainerProps {
  article: IBlog;
}

export default function ArticleContainer({ article }: IArticleContainerProps) {
  return (
    // M3 top margin: below the theme toggle row on compact screens, 32dp from the window edge above.
    // <main> is the (client) template's.
    <div className="px-4 pt-4 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <MediumRenderer
        postId={article.id}
        title={article.title}
        subtitle={article.subtitle}
        previewImage={article.previewImage}
        paragraphs={article.paragraphs}
      />
    </div>
  );
}
