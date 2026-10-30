import { NextResponse } from "next/server";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { SITE_URL } from "@/config/site";
import { getAllArticles } from "@/lib/services/blog";

export async function GET() {
  const now = new Date().toISOString();

  // Same merged list as /blog/[page], so the page count matches the listing
  const articles = await getAllArticles();
  const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));

  const pagesXml = Array.from({ length: totalPages }, (_, i) => {
    const url = INTERNAL_ROUTES.BLOG.href(i + 1);
    return `
    <url>
      <loc>${SITE_URL}${url}</loc>
      <lastmod>${now}</lastmod>
    </url>`;
  }).join("\n");

  // Only readable (Medium) articles have an internal page; Substack ones link out
  const articlesXml = articles
    .flatMap((article) => (article.slug ? [{ slug: article.slug, date: article.publishedAt }] : []))
    .map(
      ({ slug, date }) => `
      <url>
        <loc>${SITE_URL}${INTERNAL_ROUTES.BLOG.href(slug)}</loc>
        <lastmod>${date || now}</lastmod>
      </url>`,
    )
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
