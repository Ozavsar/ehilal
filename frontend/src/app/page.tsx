import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import HomeContainer from "@/containers/home";
import { HOME_SEO } from "@/config/seo";
import { getHomePageContent } from "@/lib/services/pages";
import { getStrapiBlurDataURL } from "@/lib/getImage";
import { orNotFound } from "@/lib/api/fetchAPI";
import { buildMeta, profilePageJsonLd } from "@/lib/metadata";

export default async function Home() {
  const content = await orNotFound(getHomePageContent());
  if (!content) {
    notFound();
  }

  // Built from a small Strapi format; undefined (no placeholder) if the image host fails
  const blurDataURL = await getStrapiBlurDataURL(content.hero_image);

  return (
    <>
      {/* The Person it is about (photo included) is in the root layout */}
      <JsonLd data={profilePageJsonLd(content.updatedAt || undefined)} />
      <HomeContainer content={{ ...content, hero_image: { ...content.hero_image, blurDataURL } }} />
    </>
  );
}

export function generateMetadata(): Promise<Metadata> {
  // The title names the site already; the default OG image (Site Settings) is the home page's card
  return buildMeta({ ...HOME_SEO, path: "/", absoluteTitle: true });
}
