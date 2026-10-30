import { NextResponse } from "next/server";
import { SITE_URL } from "@/config/site";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
// The index only changes when a sitemap route is added or edited, i.e. on a deploy: prerendered at
// build time and refreshed daily instead of reading the file system on every request
export const revalidate = 86400;

export async function GET() {
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
      loc: `${SITE_URL}/${dir.name}`,
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
