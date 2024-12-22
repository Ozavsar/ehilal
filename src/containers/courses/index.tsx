import TitleSection from "@/components/title-section";
import type { ICourse } from "@/types.d";
import CourseCard from "./course-card";

export default async function CourseContainer({
  courses,
}: {
  courses: ICourse[];
  pageNumber?: string;
}) {
  // const currentPage = parseInt(pageNumber, 10);
  // const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  // courses = courses
  //   ? courses.slice(
  //       (currentPage - 1) * ITEMS_PER_PAGE,
  //       currentPage * ITEMS_PER_PAGE,
  //     )
  //   : [];

  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <TitleSection
          plainText="my"
          coloredText="courses"
          backgroundText="udemy"
        />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.udemyURL} {...course} />
          ))}
        </div>
      </div>
      {/* <Suspense fallback={null}>
        <Pagination totalPages={totalPages} />
      </Suspense> */}
    </main>
  );
}
