import { notFound } from "next/navigation";
import CourseContainer from "@/containers/courses";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllCourses } from "@/lib/services/udemy";
import { withBlurDataURLs } from "@/lib/getImage";
import { Metadata } from "next";
import { buildPageMeta, courseListJsonLd, jsonLdGraph, listBreadcrumbJsonLd } from "@/lib/metadata";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { LIST_SEO, listPageSeo } from "@/config/seo";
import JsonLd from "@/components/json-ld";

export const dynamicParams = true;

// Only canonical page numbers are valid ("01", "1abc" etc. would be duplicate pages)
const PAGE_PARAM_PATTERN = /^[1-9]\d*$/;

/**
 * The requested page, or notFound() for invalid and out-of-range pages.
 * A Udemy failure propagates to error.tsx, so ISR keeps the last good version instead of caching a 404.
 */
async function getPageOrNotFound(page: string) {
  if (!PAGE_PARAM_PATTERN.test(page)) {
    notFound();
  }

  const pageNum = Number(page);
  // Cached per request, so generateMetadata and the page share one result
  const courses = await getAllCourses();
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  if (pageNum > totalPages) {
    notFound();
  }

  return {
    courses: courses.slice((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE),
    pageNum,
    totalPages,
  };
}

export default async function CoursesPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;
  const { courses, pageNum, totalPages } = await getPageOrNotFound(page);

  // Placeholders only for the courses on this page
  const pageCourses = await withBlurDataURLs(courses, (course) => course.thumbnailURL);

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          listBreadcrumbJsonLd(INTERNAL_ROUTES.COURSES, pageNum),
          courseListJsonLd(courses, (pageNum - 1) * ITEMS_PER_PAGE + 1),
        )}
      />
      <CourseContainer
        courses={pageCourses}
        pageNumber={pageNum.toString()}
        totalPages={totalPages}
      />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const courses = await getAllCourses();
    const pageCount = Math.ceil(courses.length / ITEMS_PER_PAGE);

    return Array.from({ length: pageCount }, (_, i) => ({
      page: (i + 1).toString(),
    }));
  } catch (error) {
    // Don't fail the build when Udemy is down: pages are rendered on demand instead (dynamicParams)
    console.error("Course pages could not be listed for prerendering:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const { pageNum } = await getPageOrNotFound(page);
  return buildPageMeta(
    listPageSeo(LIST_SEO.COURSES, pageNum),
    INTERNAL_ROUTES.COURSES.href(pageNum),
  );
}
