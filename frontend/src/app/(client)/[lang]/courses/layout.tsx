import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageTitle("courses-page", ["courses-title"]);
  const title = content?.SEO_title ? content.SEO_title : "Courses";
  const description = content?.SEO_description
    ? content.SEO_description
    : "Find the latest courses and events in the tech industry.";
  return {
    title,
    description,
  };
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
