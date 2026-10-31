import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { SITE_URL } from "@/config/site";
import { fetchAPI } from "@/lib/api/fetchAPI";
import { getAllArticles } from "@/lib/services/blog";
import { getAllVideos } from "@/lib/services/videos";
import type { IStrapiBasePage, IStrapiCollectionResponse, IStrapiResponse } from "@/types";

// The Strapi requests carry their content's cache tags, so Strapi webhooks refresh it as well
export const revalidate = 3600;

type Timestamp = Pick<IStrapiBasePage, "updatedAt">;

// A source that is down leaves its URLs out (or undated) instead of failing the build or the route
async function attempt<T>(label: string, load: () => Promise<T>): Promise<T | undefined> {
  try {
    return await load();
  } catch (error) {
    unstable_rethrow(error);
    console.error(
      `Sitemap: ${label} could not be loaded:`,
      error instanceof Error ? error.message : error,
    );
    return undefined;
  }
}

// Same tags as the page's own request for that content
async function singleTypeUpdatedAt(path: string, tags: string[]) {
  const response = await fetchAPI<IStrapiResponse<Timestamp | null>>(
    path,
    { fields: ["updatedAt"] },
    { tags },
  );
  return response.data?.updatedAt;
}

async function collectionUpdatedAt(path: string, tags: string[]) {
  const response = await fetchAPI<IStrapiCollectionResponse<Timestamp>>(
    path,
    { fields: ["updatedAt"], sort: { updatedAt: "desc" }, pagination: { start: 0, limit: 1 } },
    { tags },
  );
  return response.data[0]?.updatedAt;
}

// Newest of the given dates; undefined when none is known (no <lastmod> beats a made-up one)
function latest(dates: (string | undefined)[]): string | undefined {
  const times = dates.map((date) => (date ? Date.parse(date) : NaN)).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)).toISOString() : undefined;
}

// Same URLs as the canonicals (lib/metadata.ts), the home page with its trailing slash
const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
  url: `${SITE_URL}${path}`,
  ...(lastModified && { lastModified }),
});

/**
 * Every indexable page: home, contact, page 1 of each list (pages 2..N carry no content of their
 * own) and the articles readable on this site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [home, siteSettings, contact, articles, conferences, strapiVideos, videoList] =
    await Promise.all([
      attempt("home page", () => singleTypeUpdatedAt("/home-page", ["home-title"])),
      attempt("site settings", () => singleTypeUpdatedAt("/site-setting", ["site-settings"])),
      attempt("contact page", () => singleTypeUpdatedAt("/contact-page", ["contact-title"])),
      attempt("articles", getAllArticles),
      attempt("conferences", () => collectionUpdatedAt("/conferences", ["conferences"])),
      attempt("Strapi videos", () => collectionUpdatedAt("/videos", ["videos"])),
      attempt("videos", getAllVideos),
    ]);

  // Only Medium articles have a page here; Substack ones link out
  const readableArticles = (articles ?? []).flatMap((article) =>
    article.slug
      ? [entry(INTERNAL_ROUTES.BLOG.href(article.slug), article.updatedAt || article.publishedAt)]
      : [],
  );

  return [
    // The home page shows the persona fields of the Site Settings too
    entry(INTERNAL_ROUTES.HOME.path, latest([home, siteSettings])),
    entry(
      INTERNAL_ROUTES.BLOG.href(),
      latest((articles ?? []).map((a) => a.updatedAt || a.publishedAt)),
    ),
    ...readableArticles,
    entry(INTERNAL_ROUTES.CONFERENCES.href(), latest([conferences])),
    entry(
      INTERNAL_ROUTES.VIDEOS.href(),
      latest([strapiVideos, ...(videoList?.videos ?? []).map((video) => video.publish_date)]),
    ),
    entry(INTERNAL_ROUTES.COURSES.href()),
    entry(INTERNAL_ROUTES.CONTACT.path, latest([contact])),
  ];
}
