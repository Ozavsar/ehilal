import type { Metadata } from "next";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const DEFAULT_OG = `${SITE_URL}/api/og`;
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";
const TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@elifhilalumucu";
const DEFAULT_BANNER =
  process.env.NEXT_PUBLIC_DEFAULT_BANNER || `${SITE_URL}/api/og`;
const TWITTER_USER_ID =
  process.env.NEXT_PUBLIC_TWITTER_USER_ID || "1035512458935521280";
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
      images: [image || DEFAULT_OG],
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
