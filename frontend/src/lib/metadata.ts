import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import { HOME_SEO, PERSON_KNOWS_ABOUT, type PageSeo } from "@/config/seo";
import { OG_LOCALES, type ContentLanguage } from "@/lib/language";
import { fitTitle, MAX_TITLE_LENGTH, stripSymbols } from "@/lib/seo-text";
import { getSiteSettings } from "@/lib/services";
import type { ICourse, IImage, ISiteSettings } from "@/types";

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
  /** The same page in each language, this one included (hreflang); English is the x-default */
  languages?: Partial<Record<ContentLanguage, string>>;
}

/** The article RSS feed (app/feed.xml), announced in every page's <head> */
export const FEED_PATH = "/feed.xml";

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
  ogTitle,
  path,
  absoluteTitle = false,
  type = "website",
  image,
  language = "en",
  article,
  languages,
}: BuildMetaOptions): Promise<Metadata> {
  const site = await getSiteSettings();
  const url = absoluteUrl(path);
  // Article titles come from Medium: no emoji in results, cut to what results show
  const pageTitle = fitTitle(title);
  const ogImage = image || {
    ...site.defaultOgImage,
    alt: site.defaultOgImage.alt || `${site.siteName} Open Graph Image`,
  };
  const twitterImageAlt =
    (image ? image.alt : site.defaultOgImage.alt) || `${site.siteName} Twitter Card Image`;
  const socialTitle = ogTitle ?? stripSymbols(title);
  const common = {
    title: socialTitle,
    description,
    url,
    siteName: site.siteName,
    images: [ogImage],
    locale: OG_LOCALES[language],
  };

  return {
    title:
      absoluteTitle || `${pageTitle} | ${site.siteName}`.length > MAX_TITLE_LENGTH
        ? { absolute: pageTitle }
        : pageTitle,
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
      title: socialTitle,
      description,
      site: site.twitterHandle,
      siteId: site.twitterUserId,
      creator: site.twitterHandle,
      creatorId: site.twitterUserId,
      images: [{ url: ogImage.url, alt: twitterImageAlt }],
    },
    alternates: {
      canonical: url,
      ...(languages && {
        languages: {
          ...Object.fromEntries(
            Object.entries(languages).map(([code, href]) => [code, absoluteUrl(href)]),
          ),
          ...(languages.en && { "x-default": absoluteUrl(languages.en) }),
        },
      }),
      types: { "application/rss+xml": [{ url: FEED_PATH, title: `${site.siteName} — Articles` }] },
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

// The companies' own @id (their sites' Organization JSON-LD uses "<origin>#organization"), so
// search engines join the nodes of both sites; ours when the URL isn't one
const organizationId = (url: string, fallback: string) => {
  try {
    return `${new URL(url).origin}#organization`;
  } catch {
    return `${SITE_URL}/#${fallback}`;
  }
};

/** Wraps nodes in one document with a single @context */
export const jsonLdGraph = (...nodes: JsonLdNode[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

/**
 * The site owner, the companies she co-founded and the website, for the root layout. `sameAs`: her
 * profiles on other sites; `portrait`: the home page photo (absolute URL), when Strapi has one.
 */
export function siteJsonLd(
  site: ISiteSettings,
  sameAs: string[],
  portrait?: Pick<IImage, "url" | "width" | "height">,
) {
  const karakodId = organizationId(site.karakodUrl, "karakod");
  const legalifiId = organizationId(site.legalifiUrl, "legalifi");
  return jsonLdGraph(
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: site.siteName,
      url: absoluteUrl("/"),
      ...(portrait && {
        image: {
          "@type": "ImageObject",
          url: portrait.url,
          ...(portrait.width &&
            portrait.height && { width: portrait.width, height: portrait.height }),
        },
      }),
      jobTitle: site.jobTitle,
      hasOccupation: { "@type": "Occupation", name: site.jobTitle },
      description: HOME_SEO.description,
      worksFor: [{ "@id": karakodId }, { "@id": legalifiId }],
      knowsAbout: PERSON_KNOWS_ABOUT,
      // She writes in both (the blog has Turkish and English articles)
      knowsLanguage: ["tr", "en"],
      sameAs: [...new Set(sameAs)],
    },
    {
      "@type": "Organization",
      "@id": karakodId,
      name: "Karakod",
      url: site.karakodUrl,
      sameAs: [site.karakodLinkedinUrl],
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "Organization",
      "@id": legalifiId,
      name: "Legalifi",
      url: site.legalifiUrl,
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: absoluteUrl("/"),
      name: site.siteName,
      alternateName: new URL(SITE_URL).hostname,
      description: site.siteDescription,
      inLanguage: "en",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
  );
}

/** Home page: a profile page about the Person (the root layout's node, photo included) */
export function profilePageJsonLd(dateModified: string | undefined) {
  return jsonLdGraph({
    "@type": "ProfilePage",
    "@id": `${absoluteUrl("/")}#webpage`,
    url: absoluteUrl("/"),
    name: HOME_SEO.title,
    description: HOME_SEO.description,
    inLanguage: "en",
    ...(dateModified && { dateModified }),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
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

/**
 * A list page's Udemy courses, taught by the Person. No rich result (Google's course list needs
 * course pages on this site, Course info was retired in 2025): it tells search engines who the
 * instructor is. `firstPosition`: the first course's place in the whole list (page 2 goes on).
 */
export function courseListJsonLd(
  courses: Pick<ICourse, "title" | "headline" | "udemyURL">[],
  firstPosition = 1,
): JsonLdNode {
  return {
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: firstPosition + index,
      item: {
        "@type": "Course",
        name: course.title,
        ...(course.headline && { description: course.headline }),
        url: course.udemyURL,
        provider: { "@type": "Organization", name: "Udemy", sameAs: "https://www.udemy.com/" },
        instructor: { "@id": PERSON_ID },
      },
    })),
  };
}

interface BlogPostingOptions {
  path: string;
  headline: string;
  description: string;
  /** The cover (or the generated card) first, then the other sizes */
  imageUrls: string[];
  /** The Medium original the article is republished from */
  basedOnUrl: string;
  wordCount: number;
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
  imageUrls,
  basedOnUrl,
  wordCount,
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
    headline: stripSymbols(headline),
    description,
    image: [...new Set(imageUrls)],
    // Not sameAs: the Medium post is the original this page is based on, not the same page
    isBasedOn: basedOnUrl,
    wordCount,
    ...(datePublished && { datePublished }),
    ...((dateModified || datePublished) && { dateModified: dateModified || datePublished }),
    inLanguage: language,
    author: { "@type": "Person", "@id": PERSON_ID, name: site.siteName, url: absoluteUrl("/") },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
