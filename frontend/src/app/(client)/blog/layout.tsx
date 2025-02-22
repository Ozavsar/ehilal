import { unstable_cache } from "next/cache";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const getCachedPageTitle = unstable_cache(
  async () => {
    return await getPageTitle("blog-page");
  },
  ["get-blog-page-title"],
  { tags: ["blog-title"] },
);

export default async function BlogLayout({ children }: BlogLayoutProps) {
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
