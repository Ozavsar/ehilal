import TitleSection from "@/components/title-section";
import CourseCard from "./course-card";
import type { ICourse, IPageTitle } from "@/types.d";

interface ICourseContainerProps {
  courses: ICourse[];
  content: IPageTitle;
}

export default async function CourseContainer({
  courses,
  content,
}: ICourseContainerProps) {
  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <TitleSection
          text={content.page_title}
          backgroundText={content.page_title_background}
        />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.udemyURL} {...course} />
          ))}
        </div>
      </div>
    </main>
  );
}
