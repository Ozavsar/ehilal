// Shared layout of the list pages (blog, videos, courses, conferences). The card image `sizes` is
// derived from these classes and the navigation rail (96px from 600px up): change them together.

/** `container`: window margins (16px compact, 24px from medium) around the 1200px content column */
export const LIST_PAGE_CLASS_NAME = "container flex flex-col gap-8 pb-8 sm:pb-12";

/** One column compact, two from medium (600px), three from large (1200px); gaps 16px / 24px.
 * Three columns at 840px would leave ~220px cards next to the rail, too narrow for the titles
 * (md:grid-cols-2 overrides MotionGrid's default). */
export const LIST_GRID_CLASS_NAME = "gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3";

/**
 * Rendered width of a card (and its full-bleed image) in that grid:
 * - compact: viewport minus 2 x 16px margins
 * - medium and expanded: (viewport - 96px rail - 2 x 24px margins - 24px gap) / 2
 * - large and up: (viewport - 96px rail - 2 x 24px margins - 2 x 24px gaps) / 3, until the
 *   1200px content column is full at 1344px: (1200px - 2 x 24px) / 3 = 384px
 * calc() instead of a bare "100vw" keeps next/image from dropping the srcset widths below 640px.
 */
export const LIST_CARD_IMAGE_SIZES =
  "(min-width: 1344px) 384px, (min-width: 1200px) calc((100vw - 192px) / 3), (min-width: 600px) calc((100vw - 168px) / 2), calc(100vw - 32px)";

/** Courses: few and text-heavy cards, so at most two columns (from medium) */
export const COURSE_GRID_CLASS_NAME = "gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2";

/** Card width in the course grid: two columns from medium, (1200px - 24px) / 2 = 588px from 1344px */
export const COURSE_CARD_IMAGE_SIZES =
  "(min-width: 1344px) 588px, (min-width: 600px) calc((100vw - 168px) / 2), calc(100vw - 32px)";
