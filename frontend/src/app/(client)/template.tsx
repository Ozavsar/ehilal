import { FadeThroughTransition } from "@/components/view-transitions";

// The root template keys on "(client)" for every page in this group, so the fade through between
// blog, videos, courses, conferences and contact needs a template at this level too.
// <main> sits here rather than in the containers so that it also holds the page titles the list
// layouts render above the page: the skip link (#main) lands before the <h1> and the title is
// inside a landmark. Outside the view transition, which animates the page content inside it.
export default function ClientTemplate({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="flex flex-col">
      <FadeThroughTransition>{children}</FadeThroughTransition>
    </main>
  );
}
