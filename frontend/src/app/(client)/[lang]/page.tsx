import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";
import { Metadata } from "next";
import { getImage } from "@/lib/getImage";
import { Locale } from "@/config/constants/i18n";
import { translateDeepl, translateOpenAI } from "@/lib/i18n";
import { IStrapiHomePage } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePageContent();

  const title = content?.SEO_title
    ? `${content.SEO_title} | Elif Hilal Umucu`
    : "Portfolio | Elif Hilal Umucu";

  const description = content?.SEO_description
    ? content.SEO_description
    : "Elif Hilal Umucu's portfolio. Find the latest projects and events in the tech industry.";

  return { title, description };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const content = await getHomePageContent();
  const translatedContent = await translateOpenAI<IStrapiHomePage>({
    content,
    keys: ["greeting", "introduction"],
    locale: lang,
  });
  console.log("Translated Content:", translatedContent);
  if (!content) {
    return notFound();
  }
  const placeholder = await getImage(translatedContent!.hero_image.url);
  const contentWithPlaceholder = {
    ...translatedContent,
    hero_image: { ...content!.hero_image, blurDataURL: placeholder.base64 },
  };

  return <HomeContainer content={contentWithPlaceholder} />;
}
