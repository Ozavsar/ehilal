import { notFound } from "next/navigation";
import CourseContainer from "@/containers/courses";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllCourses } from "@/lib/services/udemy";
import { Metadata } from "next";
import { buildMeta } from "@/lib/metadata";

export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

// Only canonical page numbers are valid ("01", "1abc" etc. would be duplicate pages)
const parsePageNumber = (page: string | undefined) =>
  page && /^[1-9]\d*$/.test(page) ? Number(page) : NaN;

export default async function CoursesPage(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const pageNum = parsePageNumber(params.page);

  if (isNaN(pageNum)) {
    return notFound();
  }

  const courses = await getAllCourses();
  if (!courses || courses.length === 0) {
    return notFound();
  }

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  if (pageNum > totalPages) {
    return notFound();
  }

  return (
    <CourseContainer
      courses={courses.slice((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE)}
      pageNumber={pageNum.toString()}
      totalPages={totalPages}
    />
  );
}

export async function generateStaticParams() {
  const courses = await getAllCourses();
  const pageCount = Math.ceil((courses?.length || 0) / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount || 1 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  try {
    const { page } = await params;
    const pageNum = parsePageNumber(page);

    if (isNaN(pageNum)) {
      return buildMeta({
        title: "Page Not Found",
        description: "Invalid courses page number.",
        path: "/courses",
      });
    }

    const courses = await getAllCourses();
    if (!courses || courses.length === 0) {
      return buildMeta({
        title: "Courses",
        description: `Explore online courses and workshops by ${SITE_NAME} on modern web development, design, and productivity.`,
        path: "/courses",
        image: {
          url: `${SITE_URL}/api/og?title=courses`,
          alt: `Courses and Workshops by ${SITE_NAME}`,
        },
      });
    }

    const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
    if (pageNum > totalPages) {
      return buildMeta({
        title: "Page Not Found",
        description: "Requested page exceeds available course listings.",
        path: "/courses",
      });
    }

    const title = pageNum > 1 ? `Courses – Page ${pageNum}` : "Courses & Workshops";
    const description =
      pageNum > 1
        ? `Discover ${SITE_NAME}’s courses and workshops on page ${pageNum}. Learn and grow with topics in modern web development, UX, and AI.`
        : `Browse all courses and workshops by ${SITE_NAME} — from full-stack development to creative coding and professional growth.`;

    return buildMeta({
      title,
      description,
      path: `/courses${pageNum > 1 ? `/${pageNum}` : ""}`,
      type: "website",
      image: {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
        alt: `Courses and Workshops by ${SITE_NAME}`,
      },
    });
  } catch (error) {
    console.error("Error generating metadata for Courses:", error);
    return buildMeta({
      title: "Courses",
      description: `Explore online courses and workshops by ${SITE_NAME} on modern web development and design.`,
      path: "/courses",
    });
  }
}
