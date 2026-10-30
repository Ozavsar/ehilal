import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import { HOME_SEO, PERSON_KNOWS_ABOUT, type PageSeo } from "@/config/seo";
import { OG_LOCALES, type ContentLanguage } from "@/lib/language";
import { getSiteSettings } from "@/lib/services";
import type { ISiteSettings } from "@/types";

interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface BuildMetaOptions {
  title: string;
  description: string;
  /** og:title / twitter:title; defaults to `title` */
  ogTitle?: string;
  path: string;
  /**
   * The title already names the site: skip the root layout's " | <site name>" template. Titles
   * that would pass MAX_TITLE_LENGTH with it (long article titles) skip it too.
   */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  /** Defaults to the Site Settings' default OG image */
  image?: OgImage;
  /** Content language (og:locale); the site language when omitted */
  language?: ContentLanguage;
  /** Article pages: article:published_time / modified_time */
  article?: { publishedTime?: string; modifiedTime?: string };
}

// Search results cut titles at about 60 characters
const MAX_TITLE_LENGTH = 60;

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** The generated /api/og card with `text` on it */
export const ogCardImage = (text: string, alt: string): OgImage => ({
  url: `${SITE_URL}/api/og?title=${encodeURIComponent(text)}`,
  width: 1200,
  height: 630,
  alt,
});

export async function buildMeta({
  title,
  description,
  ogTitle = title,
  path,
  absoluteTitle = false,
  type = "website",
  image,
  language = "en",
  article,
}: BuildMetaOptions): Promise<Metadata> {
  const site = await getSiteSettings();
  const url = absoluteUrl(path);
  const ogImage = image || {
    ...site.defaultOgImage,
    alt: site.defaultOgImage.alt || `${site.siteName} Open Graph Image`,
  };
  const twitterImageAlt =
    (image ? image.alt : site.defaultOgImage.alt) || `${site.siteName} Twitter Card Image`;
  const common = {
    title: ogTitle,
    description,
    url,
    siteName: site.siteName,
    images: [ogImage],
    locale: OG_LOCALES[language],
  };

  return {
    title:
      absoluteTitle || `${title} | ${site.siteName}`.length > MAX_TITLE_LENGTH
        ? { absolute: title }
        : title,
    description,

    openGraph:
      type === "article"
        ? {
            ...common,
            type: "article",
            publishedTime: article?.publishedTime,
            modifiedTime: article?.modifiedTime,
            authors: [site.siteName],
          }
        : { ...common, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
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

/** buildMeta for a page whose copy is in config/seo.ts (lists: listPageSeo()), with its /api/og card as the image */
export function buildPageMeta(seo: PageSeo, path: string): Promise<Metadata> {
  return buildMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.ogTitle,
    path,
    image: ogCardImage(seo.cardTitle, seo.ogTitle),
  });
}

// ---------------------------------------------------------------------------------------------
// Schema.org JSON-LD (rendered with components/json-ld.tsx). Nodes reference each other by @id:
// the Person and the WebSite are in the root layout, pages add their own nodes and link to them.

type JsonLdNode = Record<string, unknown>;

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Wraps nodes in one document with a single @context */
export const jsonLdGraph = (...nodes: JsonLdNode[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

/** The site owner and the website, for the root layout. `sameAs`: her profiles on other sites. */
export function siteJsonLd(site: ISiteSettings, sameAs: string[]) {
  return jsonLdGraph(
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: site.siteName,
      url: absoluteUrl("/"),
      jobTitle: site.jobTitle,
      description: HOME_SEO.description,
      worksFor: [
        {
          "@type": "Organization",
          name: "Karakod",
          url: site.karakodUrl,
          sameAs: [site.karakodLinkedinUrl],
        },
        { "@type": "Organization", name: "Legalifi", url: site.legalifiUrl },
      ],
      knowsAbout: PERSON_KNOWS_ABOUT,
      sameAs: [...new Set(sameAs)],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: absoluteUrl("/"),
      name: site.siteName,
      description: site.siteDescription,
      inLanguage: "en",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
  );
}

/** Home page: a profile page about the Person, with her photo */
export function profilePageJsonLd(site: ISiteSettings, imageUrl: string | undefined) {
  return jsonLdGraph({
    "@type": "ProfilePage",
    "@id": `${absoluteUrl("/")}#webpage`,
    url: absoluteUrl("/"),
    name: HOME_SEO.title,
    description: HOME_SEO.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    // Same @id as the root layout's Person: parsers merge the two nodes
    mainEntity: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: site.siteName,
      ...(imageUrl && { image: imageUrl }),
    },
  });
}

/** Home → … → the current page. Each item is a name and a site path. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Page `page` of a list: Home → List, plus "Page n" from page 2 */
export function listBreadcrumbJsonLd(
  route: { label: string; href: (page?: number) => string },
  page: number,
): JsonLdNode {
  return breadcrumbJsonLd([
    { name: route.label, path: route.href() },
    ...(page > 1 ? [{ name: `Page ${page}`, path: route.href(page) }] : []),
  ]);
}

interface BlogPostingOptions {
  path: string;
  headline: string;
  description: string;
  imageUrl: string;
  datePublished?: string;
  dateModified?: string;
  language: ContentLanguage;
  site: ISiteSettings;
}

/** An article page (/blog/<slug>), written and published by the Person */
export function blogPostingJsonLd({
  path,
  headline,
  description,
  imageUrl,
  datePublished,
  dateModified,
  language,
  site,
}: BlogPostingOptions): JsonLdNode {
  const url = absoluteUrl(path);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    headline,
    description,
    image: [imageUrl],
    ...(datePublished && { datePublished }),
    ...((dateModified || datePublished) && { dateModified: dateModified || datePublished }),
    inLanguage: language,
    author: { "@type": "Person", "@id": PERSON_ID, name: site.siteName, url: absoluteUrl("/") },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
