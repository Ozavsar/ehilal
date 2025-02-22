import { unstable_cache } from "next/cache";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

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
