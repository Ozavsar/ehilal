import BlogContainer from "@/containers/blog";
import { getAllArticlePreviews } from "@/lib/medium";

export default async function Blog() {
  const articles = await getAllArticlePreviews();

  return <BlogContainer articles={articles} />;
}
