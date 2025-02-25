import { unstable_cache } from "next/cache";
import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface ConferencesLayoutProps {
  children: React.ReactNode;
}

const getCachedPageTitle = unstable_cache(
  async () => {
    return await getPageTitle("conferences-page");
  },
  ["get-conferences-page-title"],
  { tags: ["conferences-title"] },
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPageTitle();
  const title = content?.SEO_title ? content.SEO_title : "Conferences";
  const description = content?.SEO_description
    ? content.SEO_description
    : "Find the latest conferences and events in the tech industry.";
  return {
    title,
    description,
  };
}

export default async function ConferencesLayout({
  children,
}: ConferencesLayoutProps) {
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
