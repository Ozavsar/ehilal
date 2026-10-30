"use client";

import type { RefObject } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import TOC from "./toc";
import type { IHeadingNode } from "./heading-tree";

interface MobileTOCDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: IHeadingNode[];
  activeId: string | null;
  // The button that opens the drawer; it sits outside vaul, so Radix can't return focus to it itself
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileTOCDrawer({
  open,
  onOpenChange,
  tree,
  activeId,
  returnFocusRef,
}: MobileTOCDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent
        aria-describedby={undefined}
        className="bg-background rounded-t-2xl border-t shadow-2xl"
        onScroll={(e) => e.stopPropagation()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus({ preventScroll: true });
        }}
      >
        <div className="mx-auto w-full max-w-md px-6 pt-4 pb-8">
          <DrawerHeader className="flex items-center justify-between px-0">
            <DrawerTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <span className="text-primary text-lg">📘</span>
              Table of Contents
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="bg-border mb-4 h-px w-full" />

          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 max-h-[60vh] overflow-y-auto pr-2">
            <TOC tree={tree} activeId={activeId} onLinkClick={() => onOpenChange(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
