import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageTitle("blog-page", ["blog-title"]);
  const title = content?.SEO_title ? content.SEO_title : "Blog";
  const description = content?.SEO_description
    ? content.SEO_description
    : "Read Elif Hilal's latest articles and stay updated with the latest news and trends in the tech industry.";
  return {
    title,
    description,
  };
}

export default async function BlogLayout({ children }: BlogLayoutProps) {
  const content = await getPageTitle("blog-page", ["blog-title"]);
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
