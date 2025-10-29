import { Suspense } from "react";
import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import ConferenceCard from "./conference-card";
import type { IStrapiConference } from "@/types.d";

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
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8 lg:px-24">
      <div className="flex flex-col">
        <MotionGrid>
          {conferences.map((conference) => (
            <ConferenceCard key={conference.title} {...conference} />
          ))}
        </MotionGrid>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={+pageNumber} />
      </Suspense>
    </main>
  );
}
