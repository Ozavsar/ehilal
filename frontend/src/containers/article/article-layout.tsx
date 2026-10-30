"use client";
import type { ReactNode } from "react";
import TOC from "./table-of-contents/toc";
import MobileTOC from "./table-of-contents/mobile-toc";
import { useScrollSpy } from "./table-of-contents/use-scroll-spy";
import type { IHeadingNode } from "./table-of-contents/heading-tree";

// Client shell around the server-rendered article body: desktop and mobile TOC share one scroll spy
export default function ArticleLayout({
  headingTree,
  children,
}: {
  headingTree: IHeadingNode[];
  children: ReactNode;
}) {
  const activeId = useScrollSpy();

  return (
    <div className="relative mx-auto flex max-w-4xl justify-center">
      <aside className="scrollbar-thin scrollbar-thumb-primary fixed top-32 left-[calc(50%-42rem)] hidden h-[80vh] w-80 overflow-y-auto 2xl:block">
        <h4 className="text-muted-foreground mb-2 font-semibold tracking-wide uppercase">
          Table of Contents
        </h4>
        <TOC tree={headingTree} activeId={activeId} />
      </aside>
      {children}
      <MobileTOC tree={headingTree} activeId={activeId} />
    </div>
  );
}
