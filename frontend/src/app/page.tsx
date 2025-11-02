import { notFound } from "next/navigation";
import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";
import { getImage } from "@/lib/getImage";

export default async function Home() {
  const content = await getHomePageContent();
  if (!content) {
    return notFound();
  }
  const placeholder = await getImage(content!.hero_image.url);
  const contentWithPlaceholder = {
    ...content,
    hero_image: { ...content!.hero_image, blurDataURL: placeholder.base64 },
  };

  return <HomeContainer content={contentWithPlaceholder} />;
}
