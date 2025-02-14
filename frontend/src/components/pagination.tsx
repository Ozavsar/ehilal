"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { generatePagination } from "@/lib/utils";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

interface IPaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({
  totalPages,
  currentPage,
}: IPaginationProps) {
  const pathname = usePathname();

  const createPageURL = (pageNumber: number | string) => {
    return pathname.replace(/\/\d+$/, `/${pageNumber}`);
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="z-[9] mx-auto mt-8 flex self-end">
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;

          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={page}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center text-sm border border-muted",
    {
      "rounded-l-md": position === "first" || position === "single",
      "rounded-r-md": position === "last" || position === "single",
      "bg-primary border-accent text-muted": isActive,
      "hover:bg-muted": !isActive && position !== "middle",
      "text-gray-300": position === "middle",
    },
  );

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className} scroll={false}>
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
  const className = clsx(
    "flex h-10 w-10 items-center justify-center rounded-md border border-muted",
    {
      "pointer-events-none text-gray-500": isDisabled,
      "hover:bg-muted": !isDisabled,
      "mr-2 md:mr-4": direction === "left",
      "ml-2 md:ml-4": direction === "right",
    },
  );

  const icon =
    direction === "left" ? (
      <LuArrowLeft className="w-4" />
    ) : (
      <LuArrowRight className="w-4" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href} scroll={false}>
      {icon}
    </Link>
  );
}
