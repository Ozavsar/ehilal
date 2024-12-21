import { Suspense } from "react";
import Pagination from "@/components/pagination";
import TitleSection from "@/components/title-section";
import type { IConference } from "@/types.d";
import { ITEMS_PER_PAGE } from "@/config/constants";
import ConferenceCard from "./conference-card";

export default function ConferencesContainer({
  conferences,
  pageNumber,
}: {
  conferences: IConference[];
  pageNumber: string;
}) {
  const currentPage = parseInt(pageNumber, 10);
  const totalPages = Math.ceil(conferences.length / ITEMS_PER_PAGE);
  conferences = conferences
    ? conferences.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];
  return (
    <main className="container flex min-h-screen flex-col justify-between sm:pb-8">
      <TitleSection backgroundText="Speeches" plainText="Conferences" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {conferences.map((conference) => (
          <ConferenceCard key={conference.title} {...conference} />
        ))}
      </div>
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </main>
  );
}
