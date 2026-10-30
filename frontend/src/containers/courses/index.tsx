import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import { SharedAxisXTransition } from "@/components/view-transitions";
import { COURSE_GRID_CLASS_NAME, LIST_PAGE_CLASS_NAME } from "@/containers/list-layout";
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
    <div className={LIST_PAGE_CLASS_NAME}>
      <SharedAxisXTransition>
        <MotionGrid className={COURSE_GRID_CLASS_NAME}>
          {courses.map((course, index) => (
            <CourseCard key={course.udemyURL} {...course} priority={index === 0} />
          ))}
        </MotionGrid>
      </SharedAxisXTransition>
      {totalPages > 1 && (
        <Pagination route="COURSES" totalPages={totalPages} currentPage={+pageNumber} />
      )}
    </div>
  );
}
