"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/icon";
import { useIdleAfterLoad } from "@/hooks/use-idle-after-load";
import { cn } from "@/lib/utils";
import type { IHeadingNode } from "./heading-tree";

// vaul and the Radix dialog under it aren't part of the blog route's first bundle (list pages
// share it): the drawer loads once the page is idle, or when the button is used before that
const MobileTOCDrawer = dynamic(() => import("./mobile-toc-drawer"));

// Below lg: an M3 extended FAB (secondary colours, so it stays quieter than the text) that opens
// the TOC in a bottom sheet. On compact screens it sits above the navigation bar.
export default function MobileTOC({
  tree,
  activeId,
  lang,
  labels,
}: {
  tree: IHeadingNode[];
  activeId: string | null;
  lang?: string;
  // In the article's language: the sheet title ("On this page") and the button ("Contents")
  labels: { title: string; button: string };
}) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const idle = useIdleAfterLoad();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        lang={lang}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
        className={cn(
          "state-layer bg-secondary-container text-on-secondary-container type-label-large shadow-elevation-3 hover:shadow-elevation-4 fixed z-(--z-floating) flex h-14 items-center gap-3 rounded-lg ps-4 pe-5",
          "right-4 bottom-[calc(var(--spacing-nav-bar,5rem)+1rem)] sm:right-6 sm:bottom-6 lg:hidden",
          "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          // Enters with the page: emphasized decelerate fade and scale, none with reduced motion
          "ease-emphasized-decelerate transition-[opacity,scale] duration-500 motion-reduce:transition-none starting:scale-80 starting:opacity-0",
        )}
      >
        <Icon name="toc" />
        {labels.button}
      </button>
      {(idle || requested) && (
        <MobileTOCDrawer
          open={open}
          onOpenChange={setOpen}
          tree={tree}
          activeId={activeId}
          lang={lang}
          title={labels.title}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
