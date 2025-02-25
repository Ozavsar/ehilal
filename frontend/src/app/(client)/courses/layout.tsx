import { unstable_cache } from "next/cache";
import { Metadata } from "next";
import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface CoursesLayoutProps {
  children: React.ReactNode;
}

const getCachedPageTitle = unstable_cache(
  async () => {
    return await getPageTitle("courses-page");
  },
  ["get-courses-page-title"],
  { tags: ["courses-title"] },
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedPageTitle();
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
