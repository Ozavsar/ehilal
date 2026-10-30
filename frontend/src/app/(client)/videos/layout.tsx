import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { orNotFound } from "@/lib/api/fetchAPI";

interface VideosLayoutProps {
  children: React.ReactNode;
}

export default async function VideosLayout({ children }: VideosLayoutProps) {
  const content = await orNotFound(getPageTitle("videos-page", ["videos-title"]));
  return (
    <>
      <TitleSection
        as="h1"
        text={content.page_title}
        backgroundText={content.page_title_background}
      />
      {children}
    </>
  );
}
