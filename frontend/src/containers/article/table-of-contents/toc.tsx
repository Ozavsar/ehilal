"use client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  onLinkClick?: (id: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const handleScrollTo = (id: string) => {
    router.push(`#${id}`);
    if (onLinkClick) onLinkClick(id);
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
