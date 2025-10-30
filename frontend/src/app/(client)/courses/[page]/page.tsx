import { notFound } from "next/navigation";
import CourseContainer from "@/containers/courses";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllCourses } from "@/lib/services/udemy";

export const dynamicParams = true;

export default async function CoursesPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const courses = await getAllCourses();
  if (!courses || courses.length === 0) {
    return notFound();
  }

  return <CourseContainer courses={courses} />;
}

export async function generateStaticParams() {
  const courses = await getAllCourses();
  const pageCount = Math.ceil((courses?.length || 0) / ITEMS_PER_PAGE);

  return Array.from({ length: pageCount || 1 }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}
