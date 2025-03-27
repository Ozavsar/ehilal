import { NotFoundClient } from "@/components/not-found-client";
import { getNotFoundPageContent } from "@/lib/services/pages";
import { unstable_cache } from "next/cache";

const getCachedNotFoundPage = unstable_cache(
  async () => {
    try {
      return await getNotFoundPageContent();
    } catch (error) {
      console.error("Error fetching the not found page content:", error);
      return null;
    }
  },
  ["not-found-page-content"],
  {
    tags: ["not-title"],
  },
);

export default async function NotFound() {
  const content = await getCachedNotFoundPage();
  return <NotFoundClient imageUrl={content?.image.url} />;
}

export async function generateMetadata() {
  const content = await getCachedNotFoundPage();
  const title = content?.SEO_title ? content.SEO_title : "404 Not Found";
  const description = content?.SEO_description
    ? content.SEO_description
    : "This page does not exist.";

  return {
    title,
    description,
  };
}
