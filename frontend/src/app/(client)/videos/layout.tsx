import { unstable_cache } from "next/cache";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { Metadata } from "next";

interface VideosLayoutProps {
  children: React.ReactNode;
}

const getCachedPageTitle = unstable_cache(
  async () => {
    return await getPageTitle("videos-page");
  },
  ["get-videos-page-title"],
  { tags: ["videos-title"] },
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPageTitle();
  return {
    title: content.SEO_title || "Videos",
    description:
      content.SEO_description ||
      "Find the latest videos and events in the tech industry.",
  };
}

export default async function VideosLayout({ children }: VideosLayoutProps) {
  const content = await getCachedPageTitle();
  return (
    <>
      <TitleSection
        text={content.page_title}
        backgroundText={content.page_title_background}
      />
      {children}
    </>
  );
}
