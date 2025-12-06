import { NextResponse } from "next/server";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();

  const staticRoutes = [
    INTERNAL_ROUTES.HOME.path,
    INTERNAL_ROUTES.CONTACT.path,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticRoutes
      .map(
        (path) => `
      <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${now}</lastmod>
      </url>`,
      )
      .join("\n")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
