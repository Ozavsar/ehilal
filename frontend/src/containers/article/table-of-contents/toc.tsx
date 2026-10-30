"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { IHeadingNode } from "./heading-tree";

interface TOCProps {
  tree: IHeadingNode[];
  activeId: string | null;
  onLinkClick?: (id: string) => void;
}

// Nested levels step in by 16px; the top level is a label, sub-levels are body text
const LEVEL_CLASSES = ["type-label-large ps-4", "type-body-medium ps-8", "type-body-medium ps-12"];

/** Moves focus to the heading a TOC link points at (the headings carry tabIndex={-1}), so the next
 * Tab continues from that section. preventScroll: the router scrolls there itself. */
export function focusHeading(id: string) {
  document.getElementById(id)?.focus({ preventScroll: true });
}

// M3 list of in-page links: the current section gets the secondary-container pill
function TOCList({ tree, activeId, onLinkClick, depth }: TOCProps & { depth: number }) {
  const router = useRouter();

  return (
    <ul className="flex flex-col gap-0.5">
      {tree.map((node) => {
        const isActive = activeId === node.id;
        return (
          <li key={node.id}>
            <a
              href={`#${node.id}`}
              aria-current={isActive ? "location" : undefined}
              title={node.text}
              onClick={(event) => {
                // Modified clicks keep the browser default (new tab, copy link)
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                // The router scrolls to the heading; Lenis' own anchor handling would animate on top
                event.stopPropagation();
                router.push(`#${node.id}`);
                // A sheet that closes first moves focus itself (its focus trap would undo this)
                if (onLinkClick) onLinkClick(node.id);
                else focusHeading(node.id);
              }}
              className={cn(
                "state-layer ease-standard flex min-h-10 items-center rounded-full py-2 pe-4 transition-colors duration-200 pointer-coarse:min-h-12",
                "focus-visible:outline-primary focus-visible:outline-2 focus-visible:-outline-offset-2",
                LEVEL_CLASSES[Math.min(depth, LEVEL_CLASSES.length - 1)],
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <span className="line-clamp-2">{node.text}</span>
            </a>
            {node.children.length > 0 && (
              <TOCList
                tree={node.children}
                activeId={activeId}
                onLinkClick={onLinkClick}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// The list in its own scroll area (desktop column, bottom sheet) that keeps the current section in view
export function TOCScrollArea({
  className,
  lang,
  ...props
}: TOCProps & { className?: string; lang?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { activeId } = props;

  useEffect(() => {
    const area = ref.current;
    const active = area?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!area || !active) return;
    // Scroll only this area (scrollIntoView would also move the page)
    const areaRect = area.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.top < areaRect.top) {
      area.scrollTop -= areaRect.top - activeRect.top + 8;
    } else if (activeRect.bottom > areaRect.bottom) {
      area.scrollTop += activeRect.bottom - areaRect.bottom + 8;
    }
  }, [activeId]);

  return (
    <div
      ref={ref}
      // Wheel and touch scroll this list natively instead of Lenis scrolling the page
      data-lenis-prevent
      lang={lang}
      className={cn(
        "scrollbar-thumb-outline-variant min-h-0 scrollbar-thin scrollbar-track-transparent overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <TOCList {...props} depth={0} />
    </div>
  );
}
