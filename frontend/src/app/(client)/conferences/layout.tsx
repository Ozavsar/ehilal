import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface ConferencesLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageTitle("conferences-page", ["conferences-title"]);
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
  const content = await getPageTitle("conferences-page", ["conferences-title"]);
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
