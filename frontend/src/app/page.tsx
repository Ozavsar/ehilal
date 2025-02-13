import HomeContainer from "@/containers/home";
import { getHomePageContent } from "@/lib/services/pages";

export default async function Home() {
  const content = await getHomePageContent();
  return <HomeContainer content={content} />;
}
