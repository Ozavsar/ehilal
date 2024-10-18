import { IArticlePreview } from "@/config/types";
import ArticleCard from "./components/ArticleCard";
import TitleSection from "@/components/TitleSection";

interface Props {
  articles: IArticlePreview[];
}

export default async function BlogContainer({ articles }: Props) {
  return (
    <main className="container flex flex-col sm:pb-20">
      <TitleSection plainText="my" coloredText="blog" backgroundText="posts" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.url} {...article} />
        ))}
      </div>
    </main>
  );
}
