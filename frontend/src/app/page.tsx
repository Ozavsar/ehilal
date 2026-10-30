import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import HomeContainer from "@/containers/home";
import { HOME_SEO } from "@/config/seo";
import { getSiteSettings } from "@/lib/services";
import { getHomePageContent } from "@/lib/services/pages";
import { getStrapiBlurDataURL } from "@/lib/getImage";
import { getStrapiURL, orNotFound } from "@/lib/api/fetchAPI";
import { buildMeta, profilePageJsonLd } from "@/lib/metadata";

export default async function Home() {
  const [content, site] = await Promise.all([orNotFound(getHomePageContent()), getSiteSettings()]);
  if (!content) {
    notFound();
  }

  // Built from a small Strapi format; undefined (no placeholder) if the image host fails
  const blurDataURL = await getStrapiBlurDataURL(content.hero_image);
  // The S3 upload provider returns absolute URLs, the local one /uploads/... paths
  const heroUrl = content.hero_image?.url;
  const imageUrl = heroUrl?.startsWith("/") ? getStrapiURL(heroUrl) : heroUrl;

  return (
    <>
      <JsonLd data={profilePageJsonLd(site, imageUrl)} />
      <HomeContainer content={{ ...content, hero_image: { ...content.hero_image, blurDataURL } }} />
    </>
  );
}

export function generateMetadata(): Promise<Metadata> {
  // The title names the site already; the default OG image (Site Settings) is the home page's card
  return buildMeta({ ...HOME_SEO, path: "/", absoluteTitle: true });
}
