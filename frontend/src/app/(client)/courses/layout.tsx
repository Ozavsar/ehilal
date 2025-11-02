import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default async function CoursesLayout({ children }: CoursesLayoutProps) {
  const content = await getPageTitle("courses-page", ["courses-title"]);
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
