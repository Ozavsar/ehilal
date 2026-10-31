"use client";
import { useMemo, type ReactNode } from "react";
import { articleReveal } from "@/components/view-transitions";
import type { ContentLanguage } from "@/lib/language";
import { TOCScrollArea } from "./table-of-contents/toc";
import MobileTOC from "./table-of-contents/mobile-toc";
import { useScrollSpy } from "./table-of-contents/use-scroll-spy";
import { flattenHeadingTree, type IHeadingNode } from "./table-of-contents/heading-tree";
import { ARTICLE_STRINGS } from "./strings";

// Client shell around the server-rendered article body; desktop and mobile TOC share one scroll spy.
// The TOC follows the article in the DOM so the <h1> is the first heading screen readers list.
export default function ArticleLayout({
  headingTree,
  lang,
  children,
}: {
  headingTree: IHeadingNode[];
  lang: ContentLanguage;
  children: ReactNode;
}) {
  const headingIds = useMemo(() => flattenHeadingTree(headingTree), [headingTree]);
  const activeId = useScrollSpy(headingIds);
  const hasTOC = headingIds.length > 0;
  const strings = ARTICLE_STRINGS[lang];

  return (
    <div className="mx-auto flex w-full justify-center gap-16">
      {children}
      {hasTOC && (
        <nav
          aria-labelledby="toc-title"
          lang={lang}
          className="hidden w-64 shrink-0 lg:block"
          {...articleReveal(4)}
        >
          {/* Below the theme toggle, which sits over the top-right corner */}
          <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col gap-2">
            <h2 id="toc-title" className="text-on-surface-variant type-title-small px-4">
              {strings.onThisPage}
            </h2>
            <TOCScrollArea tree={headingTree} activeId={activeId} />
          </div>
        </nav>
      )}
      {hasTOC && (
        <MobileTOC
          tree={headingTree}
          activeId={activeId}
          lang={lang}
          labels={{ title: strings.onThisPage, button: strings.contents }}
        />
      )}
    </div>
  );
}
