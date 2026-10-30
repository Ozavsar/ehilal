import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";
import { getImage } from "@/lib/getImage";
import { orNotFound } from "@/lib/api/fetchAPI";

export default async function Home() {
  const content = await orNotFound(getHomePageContent());
  if (!content) {
    notFound();
  }

  // The blur placeholder is cosmetic: if the image host fails, render without it
  let blurDataURL: string | undefined;
  try {
    blurDataURL = (await getImage(content.hero_image.url)).base64;
  } catch (error) {
    console.error(`Failed to get placeholder for ${content.hero_image.url}`, error);
  }

  return (
    <HomeContainer content={{ ...content, hero_image: { ...content.hero_image, blurDataURL } }} />
  );
}
