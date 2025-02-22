import { unstable_cache } from "next/cache";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { Metadata } from "next";

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
  return {
    title: content.SEO_title || "Conferences",
    description:
      content.SEO_description ||
      "Find the latest conferences and events in the tech industry.",
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
