import { ITEMS_PER_PAGE } from "@/config/constants";
import CourseContainer from "@/containers/courses";
import { getAllCourses } from "@/lib/services/udemy";
import { Metadata } from "next";

export const revalidate = 60 * 60 * 24;
export const dynamicParams = false; // show 404 if the page is not found

export const metadata: Metadata = {
  title: "Courses",
};

export default async function Courses({
  params,
}: {
  params: { slug: string };
}) {
  if (!Number.isNaN(params.slug ? params.slug : "1")) {
    const courses = await getAllCourses();
    return <CourseContainer courses={courses} />;
  } else {
    return null;
  }
}

export async function generateStaticParams() {
  const courses = await getAllCourses();
  const pageCount = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const pageCounts = Array.from({ length: pageCount }, (_, i) => i + 1);

  return [
    ...pageCounts.map((pageNumber) => {
      return {
        slug: pageNumber.toString(),
      };
    }),
  ];
}
