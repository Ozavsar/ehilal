"use client";

import { useState } from "react";
import { LuList } from "react-icons/lu";
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
        <Button size="icon" className="fixed right-4 bottom-16 z-50 2xl:hidden">
          <LuList className="size-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="bg-background/95 supports-[backdrop-filter]:bg-background/90 rounded-t-2xl border-t shadow-2xl backdrop-blur-md"
        onScroll={(e) => e.stopPropagation()}
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
