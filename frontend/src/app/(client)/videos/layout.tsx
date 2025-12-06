import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface VideosLayoutProps {
  children: React.ReactNode;
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
