import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { orNotFound } from "@/lib/api/fetchAPI";

interface ConferencesLayoutProps {
  children: React.ReactNode;
}

export default async function ConferencesLayout({ children }: ConferencesLayoutProps) {
  const content = await orNotFound(getPageTitle("conferences-page", ["conferences-title"]));
  return (
    <>
      <TitleSection text={content.page_title} backgroundText={content.page_title_background} />
      {children}
    </>
  );
}
