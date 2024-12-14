import TitleSection from "@/components/title-section";
import ArticleCard from "./components/article-card";
import BlogList from "./components/blog-list";
import type { IBlog } from "@/types.d";

export default async function BlogContainer({
  articles,
}: {
  articles: IBlog[];
}) {
  return (
    <main className="container flex flex-col sm:pb-20">
      <TitleSection plainText="my" coloredText="blog" backgroundText="posts" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* <BlogList articles={articles} /> */}
        {articles.map((article) => (
          <ArticleCard key={article.mediumUrl} {...article} />
        ))}
      </div>
    </main>
  );
}
