import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface VideosLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageTitle("videos-page", ["videos-title"]);
  const title = content?.SEO_title ? content.SEO_title : "Videos";
  const description = content?.SEO_description
    ? content.SEO_description
    : "Find the latest videos and events in the tech industry.";
  return {
    title,
    description,
  };
}

export default async function VideosLayout({ children }: VideosLayoutProps) {
  const content = await getPageTitle("videos-page", ["videos-title"]);
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
