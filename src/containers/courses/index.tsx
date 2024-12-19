import TitleSection from "@/components/title-section";
import Pagination from "@/components/pagination";
import { ITEMS_PER_PAGE } from "@/config/constants";
import type { ICourse } from "@/types.d";
import { Suspense } from "react";
import CourseCard from "./course-card";

export default async function CourseContainer({
  courses,
  pageNumber,
}: {
  courses: ICourse[];
  pageNumber: string;
}) {
  const currentPage = parseInt(pageNumber, 10);
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  courses = courses
    ? courses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="container flex flex-col sm:pb-20">
      <TitleSection plainText="my" coloredText="blog" backgroundText="posts" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.udemyURL} {...course} />
        ))}
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </main>
  );
}
