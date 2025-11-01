"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import TOC from "./toc";

export default function MobileTOC({
  tree,
  activeId,
  containerRef,
}: {
  tree: any[];
  activeId: string | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <Button size="sm" className="fixed bottom-16 right-4 z-50 2xl:hidden">
          Table of Contents
        </Button>
      </DrawerTrigger>

      <DrawerContent className="rounded-t-2xl border-t bg-background/95 shadow-2xl backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md px-6 pb-8 pt-4">
          <DrawerHeader className="flex items-center justify-between px-0">
            <DrawerTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-lg text-primary">📘</span>
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

          <div className="mb-4 h-px w-full bg-border" />

          <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent max-h-[60vh] overflow-y-auto pr-2">
            <TOC
              tree={tree}
              activeId={activeId}
              containerRef={containerRef}
              onLinkClick={() => setOpen(false)}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
