import TitleSection from "@/components/title-section";
import { LIST_SEO } from "@/config/seo";
import { getPageTitle } from "@/lib/services/pages";
import { orNotFound } from "@/lib/api/fetchAPI";

interface ConferencesLayoutProps {
  children: React.ReactNode;
}

export default async function ConferencesLayout({ children }: ConferencesLayoutProps) {
  const content = await orNotFound(getPageTitle("conferences-page", ["conferences-title"]));
  return (
    <>
      <TitleSection
        as="h1"
        text={content.page_title}
        backgroundText={content.page_title_background}
        subtitle={LIST_SEO.CONFERENCES.subtitle}
      />
      {children}
    </>
  );
}
