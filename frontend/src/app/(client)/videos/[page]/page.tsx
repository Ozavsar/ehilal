import { notFound } from "next/navigation";
import { Metadata } from "next";
import VideosContainer from "@/containers/videos";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllVideos } from "@/lib/services/videos";
import { withBlurDataURLs } from "@/lib/getImage";
import { buildPageMeta, jsonLdGraph, listBreadcrumbJsonLd } from "@/lib/metadata";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { LIST_SEO, listPageSeo } from "@/config/seo";
import JsonLd from "@/components/json-ld";

export const dynamicParams = true;

// Only canonical page numbers are valid ("01", "1abc" etc. would be duplicate pages)
const PAGE_PARAM_PATTERN = /^[1-9]\d*$/;

/** The requested page, or notFound() for invalid and out-of-range pages. */
async function getPageOrNotFound(page: string) {
  if (!PAGE_PARAM_PATTERN.test(page)) {
    notFound();
  }

  const pageNum = Number(page);
  // Cached per request, so generateMetadata and the page share one result
  const { videos, isComplete } = await getAllVideos();
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

  if (pageNum > totalPages) {
    // Without YouTube the list is shorter: throw rather than cache a 404 for a page that exists
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

  const pageVideos = await withBlurDataURLs(videos, (video) => video.thumbnailURL);

  return (
    <>
      <JsonLd data={jsonLdGraph(listBreadcrumbJsonLd(INTERNAL_ROUTES.VIDEOS, pageNum))} />
      <VideosContainer
        videos={pageVideos}
        pageNumber={pageNum.toString()}
        totalPages={totalPages}
      />
    </>
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
  return buildPageMeta(listPageSeo(LIST_SEO.VIDEOS, pageNum), INTERNAL_ROUTES.VIDEOS.href(pageNum));
}
