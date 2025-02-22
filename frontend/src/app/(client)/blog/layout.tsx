import { unstable_cache } from "next/cache";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { Metadata } from "next";

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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPageTitle();
  return {
    title: content.SEO_title || "Blogg",
    description:
      content.SEO_description ||
      "Read Elif Hilal's latest articles and stay updated with the latest news and trends in the tech industry.",
  };
}

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
