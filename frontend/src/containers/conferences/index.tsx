import { Suspense } from "react";
import Pagination from "@/components/pagination";
import TitleSection from "@/components/title-section";
import ConferenceCard from "./conference-card";
import type { IPageTitle, IStrapiConference } from "@/types.d";

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
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <div className="flex flex-col">
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conference) => (
            <ConferenceCard key={conference.title} {...conference} />
          ))}
        </div>
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={+pageNumber} />
      </Suspense>
    </main>
  );
}
