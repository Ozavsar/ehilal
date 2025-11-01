import { NextResponse } from "next/server";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();
  const videos = await getAllVideos();
  const totalPages = Math.ceil((videos?.length || 0) / ITEMS_PER_PAGE);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${Array.from(
      { length: totalPages },
      (_, i) => `
      <url>
        <loc>${baseUrl}${INTERNAL_ROUTES.VIDEOS.href(i + 1)}</loc>
        <lastmod>${now}</lastmod>
      </url>`,
    ).join("\n")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
