import { notFound } from "next/navigation";
import { Metadata } from "next";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";
import { withBlurDataURLs } from "@/lib/getImage";
import { buildMeta } from "@/lib/metadata";
import { SITE_URL } from "@/config/site";
import { getSiteSettings } from "@/lib/services";

export const dynamicParams = true;

// Only canonical page numbers are valid ("01", "1abc" etc. would be duplicate pages)
const PAGE_PARAM_PATTERN = /^[1-9]\d*$/;

/**
 * The requested page, or notFound() for invalid and out-of-range pages.
 * A Strapi failure propagates to error.tsx, so ISR keeps the last good version instead of caching a 404.
 */
async function getPageOrNotFound(page: string) {
  if (!PAGE_PARAM_PATTERN.test(page)) {
    notFound();
  }

  const pageNum = Number(page);
  // Cached per request, so generateMetadata and the page share one result
  const { videos, isComplete } = await getAllVideos();
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

  if (pageNum > totalPages) {
    // Without the YouTube videos the list is shorter, so a page that normally exists would 404 (and be cached)
    if (!isComplete) {
      throw new Error(`Videos page ${pageNum} is unavailable while YouTube videos can't be loaded`);
    }
    notFound();
  }

  return {
    videos: videos.slice((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE),
    pageNum,
    totalPages,
  };
}

export default async function VideosPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;
  const { videos, pageNum, totalPages } = await getPageOrNotFound(page);

  // Placeholders only for the videos on this page
  const pageVideos = await withBlurDataURLs(videos, (video) => video.thumbnailURL);

  return (
    <VideosContainer videos={pageVideos} pageNumber={pageNum.toString()} totalPages={totalPages} />
  );
}

export async function generateStaticParams() {
  const { videos } = await getAllVideos();
  const pageCount = Math.ceil(videos.length / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await props.params;
  const { pageNum } = await getPageOrNotFound(page);
  const { siteName } = await getSiteSettings();

  const title = pageNum > 1 ? `Videos – Page ${pageNum}` : "Videos";
  const description = `Explore ${siteName}'s collection of insightful videos on web development, programming, and more${pageNum > 1 ? ` — page ${pageNum}` : ""}.`;

  return buildMeta({
    title,
    description,
    path: `/videos${pageNum > 1 ? `/${pageNum}` : ""}`,
    type: "website",
    image: {
      url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
      alt: `Videos by ${siteName}`,
    },
  });
}
