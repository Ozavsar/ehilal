import MotionGrid from "@/components/motion-grid";
import Pagination from "@/components/pagination";
import { SharedAxisXTransition } from "@/components/view-transitions";
import { LIST_GRID_CLASS_NAME, LIST_PAGE_CLASS_NAME } from "@/containers/list-layout";
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
    <div className={LIST_PAGE_CLASS_NAME}>
      <SharedAxisXTransition>
        <MotionGrid className={LIST_GRID_CLASS_NAME}>
          {conferences.map((conference, index) => (
            <ConferenceCard key={conference.documentId} {...conference} priority={index === 0} />
          ))}
        </MotionGrid>
      </SharedAxisXTransition>
      <Pagination route="CONFERENCES" totalPages={totalPages} currentPage={+pageNumber} />
    </div>
  );
}
