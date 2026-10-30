import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import { getSiteSettings } from "@/lib/services";

interface BuildMetaOptions {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
}

export async function buildMeta({
  title,
  description,
  path,
  type = "website",
  image,
}: BuildMetaOptions): Promise<Metadata> {
  const site = await getSiteSettings();
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImage = image || {
    ...site.defaultOgImage,
    alt: site.defaultOgImage.alt || `${site.siteName} Open Graph Image`,
  };
  const twitterImageAlt =
    (image ? image.alt : site.defaultOgImage.alt) || `${site.siteName} Twitter Card Image`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type,
      url,
      siteName: site.siteName,
      images: [ogImage],
      locale: "en_US",
      alternateLocale: ["tr_TR"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: site.twitterHandle,
      siteId: site.twitterUserId,
      creator: site.twitterHandle,
      creatorId: site.twitterUserId,
      images: [{ url: ogImage.url, alt: twitterImageAlt }],
    },
    alternates: {
      canonical: url,
    },
  };
}
