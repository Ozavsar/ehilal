"use client";
import { useMemo, type ReactNode } from "react";
import { articleReveal } from "@/components/view-transitions";
import { TOCScrollArea } from "./table-of-contents/toc";
import MobileTOC from "./table-of-contents/mobile-toc";
import { useScrollSpy } from "./table-of-contents/use-scroll-spy";
import { flattenHeadingTree, type IHeadingNode } from "./table-of-contents/heading-tree";

// Client shell around the server-rendered article body: desktop and mobile TOC share one scroll spy.
// From lg the TOC is a sticky column beside the text; below lg a FAB opens it in a bottom sheet.
export default function ArticleLayout({
  headingTree,
  lang,
  children,
}: {
  headingTree: IHeadingNode[];
  // Language of the article, so the TOC entries (its headings) are read in it too
  lang?: string;
  children: ReactNode;
}) {
  const headingIds = useMemo(() => flattenHeadingTree(headingTree), [headingTree]);
  const activeId = useScrollSpy(headingIds);
  const hasTOC = headingIds.length > 0;

  return (
    <div className="mx-auto flex w-full justify-center gap-16">
      {hasTOC && (
        <nav
          aria-labelledby="toc-title"
          className="order-last hidden w-64 shrink-0 lg:block"
          {...articleReveal(4)}
        >
          {/* Below the theme toggle, which sits over the top-right corner */}
          <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col gap-2">
            <h2 id="toc-title" className="text-on-surface-variant type-title-small px-4">
              On this page
            </h2>
            <TOCScrollArea tree={headingTree} activeId={activeId} lang={lang} />
          </div>
        </nav>
      )}
      {children}
      {hasTOC && <MobileTOC tree={headingTree} activeId={activeId} lang={lang} />}
    </div>
  );
}
