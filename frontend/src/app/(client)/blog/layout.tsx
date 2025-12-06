import TitleSection from "@/components/title-section";
import { getPageTitle } from "@/lib/services/pages";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default async function BlogLayout({ children }: BlogLayoutProps) {
  const content = await getPageTitle("blog-page", ["blog-title"]);
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
