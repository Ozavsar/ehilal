import { Suspense } from "react";
import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import CourseCard from "./course-card";
import type { ICourse } from "@/types";

interface ICourseContainerProps {
  courses: ICourse[];
  pageNumber: string;
  totalPages: number;
}

export default async function CourseContainer({
  courses,
  pageNumber,
  totalPages,
}: ICourseContainerProps) {
  return (
    <main className="container flex flex-col justify-between sm:pb-8 lg:px-24">
      <MotionGrid className="xl:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.udemyURL} {...course} />
        ))}
      </MotionGrid>
      {totalPages > 1 && (
        <Suspense fallback={null}>
          <Pagination totalPages={totalPages} currentPage={+pageNumber} />
        </Suspense>
      )}
    </main>
  );
}
