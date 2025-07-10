import CourseCard from "./course-card";
import type { ICourse } from "@/types.d";

interface ICourseContainerProps {
  courses: ICourse[];
}

export default async function CourseContainer({
  courses,
}: ICourseContainerProps) {
  return (
     <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.udemyURL} {...course} />
        ))}
      </div>
    </main>
  );
}
