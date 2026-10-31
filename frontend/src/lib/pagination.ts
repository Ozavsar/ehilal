/** Page numbers for a pagination bar, with "..." where pages are skipped */
export function generatePagination(
  currentPage: number,
  totalPages: number,
  maxVisible = 5,
): (number | "...")[] {
  if (currentPage < 1 || totalPages < 1 || currentPage > totalPages) {
    return [];
  }

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const sidePages = Math.floor((maxVisible - 3) / 2); // First, last and current page

  pages.push(1);

  const leftStart = Math.max(2, currentPage - sidePages);
  const leftEnd = Math.min(currentPage + sidePages, totalPages - 1);

  if (leftStart > 2) {
    pages.push("...");
  }

  for (let i = leftStart; i <= leftEnd; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (leftEnd < totalPages - 1) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  const uniquePages: (number | "...")[] = [];
  const seenNumbers = new Set<number>();

  for (const page of pages) {
    if (page === "...") {
      if (uniquePages.length > 0 && uniquePages[uniquePages.length - 1] !== "...") {
        uniquePages.push(page);
      }
    } else if (!seenNumbers.has(page)) {
      seenNumbers.add(page);
      uniquePages.push(page);
    }
  }

  return uniquePages;
}
