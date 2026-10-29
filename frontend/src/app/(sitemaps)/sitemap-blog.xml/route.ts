import { NextResponse } from "next/server";
import { getAllArticlePreviews as getAllMediumArticlePreviews } from "@/lib/services/medium";
import { getAllArticlePreviews as getAllSubstackArticlePreviews } from "@/lib/services/substack";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { getCleanSlug } from "@/lib/utils";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();

  // Same sources as /blog/[page], so the page count matches the listing
  const [mediumArticles, substackArticles] = await Promise.all([
    getAllMediumArticlePreviews(),
    getAllSubstackArticlePreviews().catch(() => []),
  ]);
  const articles = [...mediumArticles, ...substackArticles];
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  const pagesXml = Array.from({ length: totalPages }, (_, i) => {
    const url = INTERNAL_ROUTES.BLOG.href(i + 1);
    return `
    <url>
      <loc>${baseUrl}${url}</loc>
      <lastmod>${now}</lastmod>
    </url>`;
  }).join("\n");

  // Only readable (Medium) articles have an internal page; Substack ones link out
  const articlesXml = articles
    .filter((article) => article.isReadable)
    .map((article) => {
      const slug = getCleanSlug(article.externalURL.split("/").pop()!);
      if (!slug) return "";
      const pubTime = new Date(article.pubDate).getTime();
      const date = Number.isNaN(pubTime) ? now : new Date(pubTime).toISOString();
      return `
      <url>
        <loc>${baseUrl}${INTERNAL_ROUTES.BLOG.href(slug)}</loc>
        <lastmod>${date}</lastmod>
      </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pagesXml}
  ${articlesXml}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
