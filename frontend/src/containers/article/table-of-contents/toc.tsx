"use client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export default function TOC({
  tree,
  activeId,
  containerRef,
  onLinkClick,
  className,
}: {
  tree: any[];
  activeId: string | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onLinkClick?: () => void;
  className?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 1320px)");
  const headerOffset = isMobile ? 96 : 32;

  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const elementTop = target.getBoundingClientRect().top + window.scrollY;
    const scrollTarget = elementTop - headerOffset;

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth",
    });

    if (onLinkClick) onLinkClick();
  };

  return (
    <ul className={cn("space-y-2 pl-2", className)}>
      {tree.map((node) => {
        const isActive = activeId === node.id;
        return (
          <li key={node.id}>
            <button
              onClick={() => handleScrollTo(node.id)}
              className={`block text-start text-xs transition-colors ${
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-primary/70"
              }`}
            >
              <p className="line-clamp-2">{node.text}</p>
            </button>
            {node.children.length > 0 && (
              <div className="ml-4 border-l pl-3">
                <TOC
                  tree={node.children}
                  activeId={activeId}
                  containerRef={containerRef}
                  onLinkClick={onLinkClick}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
