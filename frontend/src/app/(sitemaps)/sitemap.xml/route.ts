import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const appDir = path.join(process.cwd(), "src/app/(sitemaps)");
  const files = fs.readdirSync(appDir, { withFileTypes: true });

  const sitemapDirs = files.filter(
    (entry) =>
      entry.isDirectory() &&
      entry.name.startsWith("sitemap-") &&
      entry.name.endsWith(".xml") &&
      fs.existsSync(path.join(appDir, entry.name, "route.ts")),
  );

  const sitemapEntries = sitemapDirs.map((dir) => {
    const routeFile = path.join(appDir, dir.name, "route.ts");
    const stats = fs.statSync(routeFile);
    const lastmod = stats.mtime.toISOString();
    return {
      loc: `${baseUrl}/${dir.name}`,
      lastmod,
    };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (entry) => `  <sitemap>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
