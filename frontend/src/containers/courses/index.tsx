import MotionGrid from "@/components/motion-grid";
import CourseCard from "./course-card";
import type { ICourse } from "@/types.d";

interface ICourseContainerProps {
  courses: ICourse[];
}

export default async function CourseContainer({
  courses,
}: ICourseContainerProps) {
  return (
    <main className="container flex flex-col justify-between sm:pb-8 lg:px-24">
      <MotionGrid className="xl:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.udemyURL} {...course} />
        ))}
      </MotionGrid>
    </main>
  );
}
