import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";
import { orNotFound } from "@/lib/api/fetchAPI";

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default async function CoursesLayout({ children }: CoursesLayoutProps) {
  const content = await orNotFound(getPageTitle("courses-page", ["courses-title"]));
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
