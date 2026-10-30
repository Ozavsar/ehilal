import { NextResponse } from "next/server";
import { SITE_URL } from "@/config/site";
import { getAllConferences } from "@/lib/services/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";

export async function GET() {
  const now = new Date().toISOString();

  const response = await getAllConferences(0, 1);
  const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${Array.from(
      { length: totalPages },
      (_, i) => `
      <url>
        <loc>${SITE_URL}${INTERNAL_ROUTES.CONFERENCES.href(i + 1)}</loc>
        <lastmod>${now}</lastmod>
      </url>`,
    ).join("\n")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
