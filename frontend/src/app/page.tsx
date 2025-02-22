import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";

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

export default async function Home() {
  const content = await getCachedHomePageContent();
  if (!content) {
    return notFound();
  }
  return <HomeContainer content={content} />;
}
