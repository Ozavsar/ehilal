import type { Metadata } from "next";
import {
  DEFAULT_BANNER,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  TWITTER_USER_ID,
} from "@/config/site";

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

export function buildMeta({
  title,
  description,
  path,
  type = "website",
  image,
}: BuildMetaOptions): Metadata {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type,
      url,
      siteName: SITE_NAME,
      images: [image || DEFAULT_BANNER],
      locale: "en_US",
      alternateLocale: ["tr_TR"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: TWITTER_HANDLE,
      siteId: TWITTER_USER_ID,
      creator: TWITTER_HANDLE,
      creatorId: TWITTER_USER_ID,
      images: [
        {
          url: image?.url || DEFAULT_BANNER,
          alt: image?.alt || `${SITE_NAME} Twitter Card Image`,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
}
