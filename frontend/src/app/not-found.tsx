import { NotFoundClient } from "@/components/not-found-client";
import { getNotFoundPageContent } from "@/lib/services/pages";

export default async function NotFound() {
  const content = await getNotFoundPageContent();
  return <NotFoundClient imageUrl={content?.image.url} />;
}

export async function generateMetadata() {
  const content = await getNotFoundPageContent();
  const title = content?.SEO_title ? content.SEO_title : "404 Not Found";
  const description = content?.SEO_description
    ? content.SEO_description
    : "This page does not exist.";

  return {
    title,
    description,
  };
}
