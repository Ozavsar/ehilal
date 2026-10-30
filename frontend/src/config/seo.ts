import { SUBSTACK_USERNAME, YOUTUBE_CHANNEL_HANDLE } from "@/config/constants";
import { SITE_URL } from "@/config/site";

// Page titles, descriptions and social titles. Written here on purpose rather than in Strapi: the
// CMS keeps the site identity (Site Settings: name, job title, default OG image), the copy that
// search results show lives with the code. Rules: `title` + " | <site name>" ≤ 60 characters,
// descriptions 140–160 characters, English (the site language).

export interface PageSeo {
  /** <title>, before the " | <site name>" suffix of the root layout's template */
  title: string;
  description: string;
  /** og:title / twitter:title, shown without the suffix */
  ogTitle: string;
  /** Text of the generated /api/og card */
  cardTitle: string;
}

export interface ListPageSeo extends PageSeo {
  /** Shorter title of pages 2..N (" – Page n" is added), so they stay within 60 characters */
  pagedTitle: string;
  /** Description of pages 2..N, so every page of a list has its own */
  pagedDescription: (page: number) => string;
}

export const HOME_SEO = {
  // Already contains the name: rendered without the template suffix
  title: "Elif Hilal Kara | Legal Engineer for Law, Web3 and AI",
  description:
    "Elif Hilal Kara is a legal engineer working where law meets Web3, RWA tokenization and AI. Co-founder of Karakod and Legalifi, speaker and Udemy instructor.",
  ogTitle: "Elif Hilal Kara — Legal Engineer for Law, Web3 and AI",
  cardTitle: "Elif Hilal Kara",
} as const satisfies PageSeo;

export const LIST_SEO = {
  BLOG: {
    title: "Blog on Law, Web3, Tokenization and AI",
    pagedTitle: "Blog on Law, Web3 and AI",
    description:
      "Articles by legal engineer Elif Hilal Kara on Web3 regulation, RWA tokenization with ERC-3643, AI and legal tech, plus the Karakod LC³ Gündem newsletter.",
    pagedDescription: (page) =>
      `Page ${page} of the articles by Elif Hilal Kara on Web3 regulation, RWA tokenization, AI and legal tech, and the Karakod LC³ Gündem newsletter issues.`,
    ogTitle: "Articles on Law, Web3 and AI by Elif Hilal Kara",
    cardTitle: "Blog",
  },
  VIDEOS: {
    title: "Videos on Legal Engineering and Web3",
    pagedTitle: "Videos on Legal Engineering",
    description:
      "Talks, interviews and explainers by Elif Hilal Kara on legal engineering, blockchain, data protection law (KVKK), DevRel and AI, including her TEDxKTU talk.",
    pagedDescription: (page) =>
      `Page ${page} of the talks, interviews and explainers by Elif Hilal Kara on legal engineering, blockchain, data protection law (KVKK), DevRel and AI.`,
    ogTitle: "Videos and Talks by Elif Hilal Kara",
    cardTitle: "Videos",
  },
  COURSES: {
    title: "Courses on Blockchain and Web3",
    pagedTitle: "Courses on Blockchain and Web3",
    description:
      "Udemy courses and workshops by legal engineer Elif Hilal Kara on blockchain, Web3, technology and financial literacy, from first principles to practice.",
    pagedDescription: (page) =>
      `Page ${page} of the Udemy courses and workshops by legal engineer Elif Hilal Kara on blockchain, Web3, technology and financial literacy, from basics to practice.`,
    ogTitle: "Blockchain and Web3 Courses by Elif Hilal Kara",
    cardTitle: "Courses",
  },
  CONFERENCES: {
    title: "Conference Talks, Panels and Masterclasses",
    pagedTitle: "Conference Talks and Panels",
    description:
      "Conferences, panels, bootcamps and masterclasses where Elif Hilal Kara has spoken on legal engineering, crypto law, tokenization regulation and AI in law.",
    pagedDescription: (page) =>
      `Page ${page} of the conferences, panels and masterclasses where Elif Hilal Kara has spoken on legal engineering, crypto law, tokenization and AI in law.`,
    ogTitle: "Conference Talks and Panels by Elif Hilal Kara",
    cardTitle: "Conferences",
  },
} as const satisfies Record<"BLOG" | "VIDEOS" | "COURSES" | "CONFERENCES", ListPageSeo>;

export const PAGE_SEO = {
  CONTACT: {
    title: "Contact for Talks and Collaborations",
    description:
      "Contact Elif Hilal Kara for speaking invitations, workshops, legal engineering and tokenization projects, collaborations with Karakod or Legalifi and media.",
    ogTitle: "Contact Elif Hilal Kara",
    cardTitle: "Contact",
  },
  NOT_FOUND: {
    title: "Page Not Found",
    description:
      "This page does not exist or has moved. Browse the articles, videos, courses and conference talks of legal engineer Elif Hilal Kara on law, Web3 and AI.",
    ogTitle: "Page Not Found",
    cardTitle: "404",
  },
  ARTICLE_NOT_FOUND: {
    title: "Article Not Found",
    description:
      "This article does not exist or is no longer available. Read the other articles by legal engineer Elif Hilal Kara on law, Web3, tokenization and AI.",
    ogTitle: "Article Not Found",
    cardTitle: "Blog",
  },
} as const satisfies Record<string, PageSeo>;

/** Title and description of page `page` of a list (page 1 is the list's own copy) */
export function listPageSeo(seo: ListPageSeo, page: number): PageSeo {
  if (page <= 1) return seo;
  return {
    title: `${seo.pagedTitle} – Page ${page}`,
    description: seo.pagedDescription(page),
    ogTitle: `${seo.pagedTitle} – Page ${page}`,
    cardTitle: `${seo.cardTitle} – Page ${page}`,
  };
}

/** Article description when the post has no subtitle */
export const articleFallbackDescription = (title: string, siteName: string) =>
  `“${title}”, an article by ${siteName} on law, Web3, tokenization and AI.`;

// Only the live site may be indexed: the same hosts as app/robots.ts and next.config.mjs (which
// sends X-Robots-Tag: noindex everywhere else)
const PRODUCTION_HOSTS = new Set(["ehilal.net", "www.ehilal.net"]);
export const IS_PRODUCTION_SITE = (() => {
  try {
    return PRODUCTION_HOSTS.has(new URL(SITE_URL).hostname);
  } catch {
    return false;
  }
})();

// Person JSON-LD (root layout)
export const PERSON_KNOWS_ABOUT = [
  "Legal engineering",
  "Legal technology",
  "Blockchain law",
  "Web3",
  "Real-world asset tokenization",
  "ERC-3643",
  "Smart contracts",
  "Artificial intelligence",
  "Data protection law",
];

// Known profiles, used in the Person's `sameAs` while the Strapi social links leave them empty
export const MEDIUM_PROFILE_URL = "https://medium.com/@elifhilalkara";
export const SUBSTACK_PROFILE_URL = `https://${SUBSTACK_USERNAME}.substack.com`;
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}`;
