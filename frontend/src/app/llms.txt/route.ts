import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { HOME_SEO, LIST_SEO, PAGE_SEO } from "@/config/seo";
import { unstable_rethrow } from "next/navigation";
import { absoluteUrl, FEED_PATH } from "@/lib/metadata";
import { stripSymbols } from "@/lib/seo-text";
import { getSiteSettings } from "@/lib/services";
import { getAllArticles } from "@/lib/services/blog";

// llms.txt (llmstxt.org): a plain summary of who the site is about and where things are, for AI
// assistants and tools that read it. Search engines ignore it. Refreshed hourly with the articles;
// without them it still lists the pages.
export const revalidate = 3600;

// The newest articles readable on this site
const ARTICLE_COUNT = 15;

export async function GET() {
  const [site, articles] = await Promise.all([
    getSiteSettings(),
    getAllArticles().catch((error: unknown) => {
      unstable_rethrow(error);
      return [];
    }),
  ]);

  const page = (label: string, path: string, description: string) =>
    `- [${label}](${absoluteUrl(path)}): ${description}`;
  const latest = articles
    .filter((article) => article.slug)
    .slice(0, ARTICLE_COUNT)
    .map(
      (article) =>
        `- [${stripSymbols(article.title)}](${absoluteUrl(INTERNAL_ROUTES.BLOG.href(article.slug ?? ""))})`,
    );

  const text = [
    `# ${site.siteName}`,
    "",
    `> ${HOME_SEO.description}`,
    "",
    "Articles are in Turkish and English; Turkish and English versions of the same article link to each other.",
    "",
    "## Pages",
    page(
      "Home",
      INTERNAL_ROUTES.HOME.path,
      `who ${site.siteName} is (${site.jobTitle}), with her profiles`,
    ),
    page(INTERNAL_ROUTES.BLOG.label, INTERNAL_ROUTES.BLOG.href(), LIST_SEO.BLOG.description),
    page(
      INTERNAL_ROUTES.CONFERENCES.label,
      INTERNAL_ROUTES.CONFERENCES.href(),
      LIST_SEO.CONFERENCES.description,
    ),
    page(INTERNAL_ROUTES.VIDEOS.label, INTERNAL_ROUTES.VIDEOS.href(), LIST_SEO.VIDEOS.description),
    page(
      INTERNAL_ROUTES.COURSES.label,
      INTERNAL_ROUTES.COURSES.href(),
      LIST_SEO.COURSES.description,
    ),
    page(INTERNAL_ROUTES.CONTACT.label, INTERNAL_ROUTES.CONTACT.path, PAGE_SEO.CONTACT.description),
    `- [RSS feed of the articles](${absoluteUrl(FEED_PATH)})`,
    "",
    ...(latest.length ? ["## Latest articles", ...latest, ""] : []),
    "## Organizations",
    `- [Karakod](${site.karakodUrl}), [Legalifi](${site.legalifiUrl}): companies she co-founded`,
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
