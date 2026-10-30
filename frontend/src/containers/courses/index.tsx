import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import CourseCard from "./course-card";
import type { ICourse } from "@/types";

interface ICourseContainerProps {
  courses: ICourse[];
  pageNumber: string;
  totalPages: number;
}

export default function CourseContainer({
  courses,
  pageNumber,
  totalPages,
}: ICourseContainerProps) {
  return (
    <main className="lg:px-page-gutter container flex flex-col justify-between sm:pb-8">
      <MotionGrid className="xl:grid-cols-2">
        {courses.map((course, index) => (
          <CourseCard key={course.udemyURL} {...course} priority={index === 0} />
        ))}
      </MotionGrid>
      {totalPages > 1 && (
        <Pagination route="COURSES" totalPages={totalPages} currentPage={+pageNumber} />
      )}
    </main>
  );
}
