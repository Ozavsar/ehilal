import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import ConferenceCard from "./conference-card";
import type { IStrapiConference } from "@/types";

interface IConferencesContainerProps {
  conferences: IStrapiConference[];
  pageNumber: string;
  totalPages: number;
}

export default function ConferencesContainer({
  conferences,
  pageNumber,
  totalPages,
}: IConferencesContainerProps) {
  return (
    <main className="lg:px-page-gutter container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <MotionGrid>
          {conferences.map((conference, index) => (
            <ConferenceCard key={conference.documentId} {...conference} priority={index === 0} />
          ))}
        </MotionGrid>
      </div>
      <Pagination route="CONFERENCES" totalPages={totalPages} currentPage={+pageNumber} />
    </main>
  );
}
