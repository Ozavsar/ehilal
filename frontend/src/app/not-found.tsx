import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { NotFoundClient } from "@/components/not-found-client";
import { getNotFoundPageContent } from "@/lib/services/pages";

// A Strapi outage must not turn every 404 into an error page, so render without CMS content instead
const getContent = cache(async () => {
  try {
    return await getNotFoundPageContent();
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      "Not-found page content could not be loaded:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
});

export default async function NotFound() {
  const content = await getContent();
  return <NotFoundClient imageUrl={content?.image?.url} />;
}

export async function generateMetadata() {
  const content = await getContent();

  return {
    title: content?.SEO_title || "404 Not Found",
    description: content?.SEO_description || "This page does not exist.",
  };
}
