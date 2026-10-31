import { ViewTransition, type CSSProperties, type ReactNode } from "react";

// Page transitions (React <ViewTransition>). Each boundary animates only for its own transition
// types (`default: "none"`), so back/forward, refreshes and Suspense reveals swap instantly.
// The animations are the ::view-transition rules in app/globals.css.

/** Between the destinations of the navigation rail / bar */
export const NAV_TOP = "nav-top";
/** To a later page of a list */
export const NAV_FORWARD = "nav-forward";
/** To an earlier page of a list, or back from an article to the blog */
export const NAV_BACK = "nav-back";
/** From a blog card to its article: the article reveals its body after the morph */
export const ARTICLE_OPEN = "article-open";
/** Opening or closing the full-screen photo gallery (a state change, not a navigation) */
export const GALLERY = "gallery";
export const GALLERY_OPEN = "gallery-open";
export const GALLERY_CLOSE = "gallery-close";

const FADE_THROUGH = { [NAV_TOP]: "fade-through", default: "none" };
const SHARED_AXIS_X = {
  [NAV_FORWARD]: "axis-x-forward",
  [NAV_BACK]: "axis-x-back",
  default: "none",
};

/** M3 fade through: the page content when moving between top-level destinations */
export function FadeThroughTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={FADE_THROUGH} exit={FADE_THROUGH} default="none">
      {children}
    </ViewTransition>
  );
}

/** M3 shared axis X between list pages. A shared name, not enter/exit: React runs no enter/exit
 * for a boundary this deep when only the route param changes. One list grid per page. */
export function SharedAxisXTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition name="list-grid" share={SHARED_AXIS_X} default="none">
      {children}
    </ViewTransition>
  );
}

/** Container transform from a blog card to its article: thumbnail → cover, title → <h1> */
export function ArticleMorph({
  postId,
  part,
  children,
}: {
  postId: string;
  part: "cover" | "title";
  children: ReactNode;
}) {
  return (
    <ViewTransition name={`article-${part}-${postId}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

/** Props for an article part revealed after the card → article morph, in this order */
export const articleReveal = (order: number) => ({
  "data-article-reveal": "",
  style: { "--reveal-order": order } as CSSProperties,
});
