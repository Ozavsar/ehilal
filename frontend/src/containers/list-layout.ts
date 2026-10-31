// Shared layout of the list pages. The card image `sizes` derive from these classes and the 96px
// rail: change them together.

/** `container`: window margins (16px compact, 24px from medium) around the 1200px content column */
export const LIST_PAGE_CLASS_NAME = "container flex flex-col gap-8 pb-8 sm:pb-12";

/** 1 / 2 (from 600px) / 3 (from 1200px) columns. md:grid-cols-2 overrides MotionGrid's default:
 * three columns at 840px would be too narrow for the titles. */
export const LIST_GRID_CLASS_NAME = "gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3";

/**
 * Card width: (100vw - rail - margins - gaps) / columns, 384px once the content column is full.
 * calc() instead of a bare "100vw" keeps next/image from dropping the srcset widths below 640px.
 */
export const LIST_CARD_IMAGE_SIZES =
  "(min-width: 1344px) 384px, (min-width: 1200px) calc((100vw - 192px) / 3), (min-width: 600px) calc((100vw - 168px) / 2), calc(100vw - 32px)";

/** Courses: few and text-heavy cards, so at most two columns (from medium) */
export const COURSE_GRID_CLASS_NAME = "gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2";

/** Card width in the course grid: two columns from medium, (1200px - 24px) / 2 = 588px from 1344px */
export const COURSE_CARD_IMAGE_SIZES =
  "(min-width: 1344px) 588px, (min-width: 600px) calc((100vw - 168px) / 2), calc(100vw - 32px)";
