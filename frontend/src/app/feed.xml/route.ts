import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { LIST_SEO } from "@/config/seo";
import { absoluteUrl, FEED_PATH } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/services";
import { getAllArticles } from "@/lib/services/blog";

// RSS 2.0 feed of every article (Medium + Substack), newest first; a failure throws, so ISR keeps
// serving the last good feed
export const revalidate = 3600;

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const escapeXml = (text: string) => text.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);

// RFC 822 date, as RSS requires; undefined for unknown dates
const rssDate = (iso: string | undefined) => {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? undefined : new Date(time).toUTCString();
};

export async function GET() {
  const [site, articles] = await Promise.all([getSiteSettings(), getAllArticles()]);
  const blogUrl = absoluteUrl(INTERNAL_ROUTES.BLOG.href());

  const items = articles.map((article) => {
    // Medium articles are read on this site; Substack issues only link out
    const link = article.slug
      ? absoluteUrl(INTERNAL_ROUTES.BLOG.href(article.slug))
      : article.externalURL;
    const published = rssDate(article.publishedAt);
    return [
      "<item>",
      `<title>${escapeXml(article.title)}</title>`,
      `<link>${escapeXml(link)}</link>`,
      `<guid isPermaLink="true">${escapeXml(link)}</guid>`,
      article.description && `<description>${escapeXml(article.description)}</description>`,
      `<dc:creator>${escapeXml(site.siteName)}</dc:creator>`,
      published && `<pubDate>${published}</pubDate>`,
      "</item>",
    ]
      .filter(Boolean)
      .join("");
  });

  const lastBuild = rssDate(articles[0]?.updatedAt || articles[0]?.publishedAt);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    `<title>${escapeXml(`${site.siteName} — ${LIST_SEO.BLOG.title}`)}</title>`,
    `<link>${escapeXml(blogUrl)}</link>`,
    `<description>${escapeXml(LIST_SEO.BLOG.description)}</description>`,
    `<atom:link href="${escapeXml(absoluteUrl(FEED_PATH))}" rel="self" type="application/rss+xml"/>`,
    lastBuild && `<lastBuildDate>${lastBuild}</lastBuildDate>`,
    ...items,
    "</channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
