import { NextResponse } from "next/server";
import { getAllArticlePreviews } from "@/lib/services/medium";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { getCleanSlug } from "@/lib/utils";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();
  const articles = await getAllArticlePreviews();
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);

  const pagesXml = Array.from({ length: totalPages }, (_, i) => {
    const url = INTERNAL_ROUTES.BLOG.href(i + 1);
    return `
    <url>
      <loc>${baseUrl}${url}</loc>
      <lastmod>${now}</lastmod>
    </url>`;
  }).join("\n");

  const articlesXml = articles
    .map((article) => {
      const slug = getCleanSlug(article.mediumURL.split("/").pop()!);
      if (!slug) return "";
      const date = article.pubDate
        ? new Date(article.pubDate).toISOString()
        : now;
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
