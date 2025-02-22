import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";
import { Metadata } from "next";

const getCachedHomePageContent = unstable_cache(
  async () => {
    try {
      return await getHomePageContent();
    } catch (error) {
      console.error("Error fetching home page content:", error);
      return null;
    }
  },
  ["home-page-content"],
  {
    tags: ["home-title"],
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedHomePageContent();
  return {
    title: content?.SEO_title || "Portfolio",
    description:
      content?.SEO_description ||
      "Elif Hilal Umucu's portfolio. Find the latest projects and events in the tech industry.",
  };
}

export default async function Home() {
  const content = await getCachedHomePageContent();
  if (!content) {
    return notFound();
  }
  return <HomeContainer content={content} />;
}
