"use client";

import { useRef, type RefObject } from "react";
import { Icon } from "@/components/icon";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { TOCScrollArea, focusHeading } from "./toc";
import type { IHeadingNode } from "./heading-tree";

interface MobileTOCDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: IHeadingNode[];
  activeId: string | null;
  lang?: string;
  title: string;
  // The button that opens the drawer; it sits outside vaul, so Radix can't return focus to it itself
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

// Bottom sheet content: the Drawer primitive brings the surface, handle and scrim
export default function MobileTOCDrawer({
  open,
  onOpenChange,
  tree,
  activeId,
  lang,
  title,
  returnFocusRef,
}: MobileTOCDrawerProps) {
  // Heading of the link chosen in the sheet: focus lands there once the sheet has closed
  const chosenIdRef = useRef<string | null>(null);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent
        aria-describedby={undefined}
        onScroll={(e) => e.stopPropagation()}
        onOpenAutoFocus={(event) => {
          // vaul would leave focus on the FAB behind the sheet: start at the current section's link
          event.preventDefault();
          const content = event.currentTarget as HTMLElement;
          const link =
            content.querySelector<HTMLElement>('[aria-current="location"]') ??
            content.querySelector<HTMLElement>("a");
          link?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const chosenId = chosenIdRef.current;
          chosenIdRef.current = null;
          if (chosenId) focusHeading(chosenId);
          else returnFocusRef.current?.focus({ preventScroll: true });
        }}
      >
        <div className="mx-auto flex w-full max-w-160 flex-col gap-2 px-4 pt-2 pb-6 sm:px-6">
          <div className="flex min-h-12 items-center justify-between gap-4 ps-4">
            <DrawerTitle lang={lang} className="text-on-surface type-title-large">
              {title}
            </DrawerTitle>
            {/* M3 standard icon button */}
            <DrawerClose
              aria-label="Close"
              className="state-layer touch-target text-on-surface-variant focus-visible:outline-primary flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2"
            >
              <Icon name="close" />
            </DrawerClose>
          </div>
          <TOCScrollArea
            tree={tree}
            activeId={activeId}
            lang={lang}
            onLinkClick={(id) => {
              chosenIdRef.current = id;
              onOpenChange(false);
            }}
            className="max-h-[60dvh]"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
