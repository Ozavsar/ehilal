import BlogContainer from "@/containers/blog";
import { getAllArticlePreviews } from "@/lib/medium";

export const revalidate = 60 * 60 * 24; // 24 hours

export default async function Blog({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const articles = await getAllArticlePreviews();

  return <BlogContainer articles={articles} searchParams={searchParams} />;
}
