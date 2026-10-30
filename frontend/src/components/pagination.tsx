import Link from "next/link";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { generatePagination } from "@/lib/pagination";
import { Icon } from "@/components/icon";
import { NAV_BACK, NAV_FORWARD } from "@/components/view-transitions";
import { cn } from "@/lib/utils";

/** The paginated lists: the INTERNAL_ROUTES entries that build page links with href(). */
type ListRoute = {
  [K in keyof typeof INTERNAL_ROUTES]: (typeof INTERNAL_ROUTES)[K] extends { href: unknown }
    ? K
    : never;
}[keyof typeof INTERNAL_ROUTES];

interface IPaginationProps {
  route: ListRoute;
  totalPages: number;
  currentPage: number;
}

// Server component: the list route comes in as a prop instead of usePathname(). The links keep
// Next's default scroll, so a new page opens at the top instead of where the old one was left.
// Each link tags its navigation forward or back, for the list's M3 shared axis transition.
export default function Pagination({ route, totalPages, currentPage }: IPaginationProps) {
  // Page 1 is the bare list path (/blog), pages 2..N are /blog/<n>
  const createPageURL = (pageNumber: number) => INTERNAL_ROUTES[route].href(pageNumber);

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="z-(--z-pagination) mx-auto mt-8 flex items-center gap-1 self-end sm:gap-2"
    >
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <ul className="flex items-center gap-1">
        {allPages.map((page, index) => (
          // Two "..." entries can appear, so the value alone is not a unique key
          <li key={`${page}-${index}`}>
            <PaginationNumber
              href={page === "..." ? "" : createPageURL(page)}
              page={page}
              isActive={currentPage === page}
              isForward={typeof page === "number" && page > currentPage}
            />
          </li>
        ))}
      </ul>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </nav>
  );
}

// 40dp circles like M3 icon buttons (48dp touch targets): the current page is the selected
// (secondary-container) one, the others carry a state layer.
const itemClassName =
  "touch-target relative type-label-large flex size-10 items-center justify-center rounded-full outline-primary focus-visible:outline-3 focus-visible:outline-offset-2";

function PaginationNumber({
  page,
  href,
  isActive,
  isForward,
}: {
  page: number | string;
  href: string;
  isActive: boolean;
  isForward: boolean;
}) {
  if (page === "...") {
    return <span className={cn(itemClassName, "text-on-surface-variant")}>…</span>;
  }

  return isActive ? (
    <span
      aria-current="page"
      className={cn(itemClassName, "bg-secondary-container text-on-secondary-container")}
    >
      {page}
    </span>
  ) : (
    <Link
      href={href}
      aria-label={`Page ${page}`}
      transitionTypes={[isForward ? NAV_FORWARD : NAV_BACK]}
      className={cn(itemClassName, "state-layer text-on-surface-variant")}
    >
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const label = direction === "left" ? "Previous page" : "Next page";
  const icon = <Icon name={direction === "left" ? "arrow_back" : "arrow_forward"} />;

  // A disabled arrow is plain text for assistive tech too: no link, no name to announce
  return isDisabled ? (
    <span aria-hidden="true" className={cn(itemClassName, "text-on-surface/38")}>
      {icon}
    </span>
  ) : (
    <Link
      className={cn(itemClassName, "state-layer text-on-surface-variant")}
      href={href}
      aria-label={label}
      transitionTypes={[direction === "left" ? NAV_BACK : NAV_FORWARD]}
    >
      {icon}
    </Link>
  );
}
