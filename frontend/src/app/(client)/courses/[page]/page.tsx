import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CourseContainer from "@/containers/courses";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllCourses } from "@/lib/services/udemy";

export const dynamicParams = true;

const getCachedCourses = unstable_cache(
  async () => {
    try {
      return await getAllCourses();
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  },
  ["courses-list"],
  {
    revalidate: 86400, // 24 hours
  },
);

export const metadata: Metadata = {
  title: "Courses",
};

export default async function CoursesPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const courses = await getCachedCourses();
  if (!courses || courses.length === 0) {
    return notFound();
  }

  return <CourseContainer courses={courses} />;
}

export async function generateStaticParams() {
  const courses = await getCachedCourses();
  const pageCount = Math.ceil((courses?.length || 0) / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount || 1 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}
