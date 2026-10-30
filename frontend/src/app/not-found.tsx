import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import type { Metadata } from "next";
import NotFoundView from "@/containers/not-found";
import { PAGE_SEO } from "@/config/seo";
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
  return <NotFoundView image={content?.image} />;
}

// No canonical or social tags: the page answers 404 for any path, and Next.js marks it noindex
export const metadata: Metadata = {
  title: PAGE_SEO.NOT_FOUND.title,
  description: PAGE_SEO.NOT_FOUND.description,
};
