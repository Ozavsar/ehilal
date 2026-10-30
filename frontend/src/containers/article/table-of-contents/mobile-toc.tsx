"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LuList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useIdleAfterLoad } from "@/hooks/use-idle-after-load";
import type { IHeadingNode } from "./heading-tree";

// vaul and the Radix dialog under it aren't part of the blog route's first bundle (list pages
// share it): the drawer loads once the page is idle, or when the button is used before that
const MobileTOCDrawer = dynamic(() => import("./mobile-toc-drawer"));

export default function MobileTOC({
  tree,
  activeId,
}: {
  tree: IHeadingNode[];
  activeId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const idle = useIdleAfterLoad();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={triggerRef}
        size="icon"
        aria-label="Table of contents"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
        className="fixed right-4 bottom-16 z-(--z-floating) 2xl:hidden"
      >
        <LuList className="size-5" />
      </Button>
      {(idle || requested) && (
        <MobileTOCDrawer
          open={open}
          onOpenChange={setOpen}
          tree={tree}
          activeId={activeId}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
