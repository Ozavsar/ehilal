import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";
import { getStrapiBlurDataURL } from "@/lib/getImage";
import { orNotFound } from "@/lib/api/fetchAPI";

export default async function Home() {
  const content = await orNotFound(getHomePageContent());
  if (!content) {
    notFound();
  }

  // Built from a small Strapi format; undefined (no placeholder) if the image host fails
  const blurDataURL = await getStrapiBlurDataURL(content.hero_image);

  return (
    <HomeContainer content={{ ...content, hero_image: { ...content.hero_image, blurDataURL } }} />
  );
}
