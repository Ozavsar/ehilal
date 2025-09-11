/**
 * Updated pagination logic to include ellipsis for better UX
 * @param currentPage - Page currently active
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of visible pages (default: 7)
 * @returns Array containing page numbers and ellipsis ("...") where appropriate
 */
export function generatePagination(
  currentPage: number,
  totalPages: number,
  maxVisible = 7,
): (number | "...")[] {
  // Input validation
  if (currentPage < 1 || totalPages < 1 || currentPage > totalPages) {
    return [];
  }

  // If total pages are less than or equal to maxVisible, show all pages
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const sidePages = Math.floor((maxVisible - 3) / 2); // First, last and current page

  // First page is always shown
  pages.push(1);

  // Left side logic
  const leftStart = Math.max(2, currentPage - sidePages);
  const leftEnd = Math.min(currentPage + sidePages, totalPages - 1);

  // Is left ellipsis needed?
  if (leftStart > 2) {
    pages.push("...");
  }

  // Middle section pages
  for (let i = leftStart; i <= leftEnd; i++) {
    if (i !== 1 && i !== totalPages) {
      // First and last page are already added
      pages.push(i);
    }
  }

  // Is right ellipsis needed?
  if (leftEnd < totalPages - 1) {
    pages.push("...");
  }

  // Last page (if greater than 1)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  // Duplicate check and sorting
  const uniquePages: (number | "...")[] = [];
  const seenNumbers = new Set<number>();

  for (const page of pages) {
    if (page === "...") {
      // Add ellipsis only between numbers
      if (
        uniquePages.length > 0 &&
        uniquePages[uniquePages.length - 1] !== "..."
      ) {
        uniquePages.push(page);
      }
    } else if (!seenNumbers.has(page)) {
      seenNumbers.add(page);
      uniquePages.push(page);
    }
  }

  return uniquePages;
}

// /**
//  * Helper to get pagination info
//  * @param currentPage - Current active page
//  * @param totalItems - Total number of items
//  * @param itemsPerPage - Number of items per page
//  * @returns Object containing pagination details
//  */
// export function getPaginationInfo(
//   currentPage: number,
//   totalItems: number,
//   itemsPerPage: number,
// ) {
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, totalItems);

//   return {
//     totalPages,
//     startItem,
//     endItem,
//     hasNext: currentPage < totalPages,
//     hasPrev: currentPage > 1,
//     isFirstPage: currentPage === 1,
//     isLastPage: currentPage === totalPages,
//   };
// }

// /**
//  * URL-safe pagination parameters
//  */
// export function createPaginationUrl(
//   baseUrl: string,
//   page: number,
//   searchParams?: URLSearchParams,
// ) {
//   const url = new URL(baseUrl, window.location.origin);

//   if (searchParams) {
//     searchParams.forEach((value, key) => {
//       if (key !== "page") {
//         url.searchParams.set(key, value);
//       }
//     });
//   }

//   if (page > 1) {
//     url.searchParams.set("page", page.toString());
//   }

//   return url.toString();
// }
