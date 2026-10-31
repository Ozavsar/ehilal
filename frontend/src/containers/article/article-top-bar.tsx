"use client";

import { useEffect, useState } from "react";
import { articleReveal } from "@/components/view-transitions";
import { cn } from "@/lib/utils";
import BackToBlog from "./back-to-blog";

export const ARTICLE_TITLE_ID = "article-title";

// Sticky M3 small top app bar; once the article title scrolls under it, the back button shrinks to
// its icon and the title takes the headline slot
export default function ArticleTopBar({ title, lang }: { title: string; lang?: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const heading = document.getElementById(ARTICLE_TITLE_ID);
    if (!heading) return;
    // The 64px bar covers the top of the viewport, so the title counts as gone once it is under it
    const observer = new IntersectionObserver(
      ([entry]) =>
        setScrolled(!!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-scrolled={scrolled || undefined}
      className="bg-surface data-scrolled:bg-surface-container ease-standard sticky top-0 z-(--z-raised) -mx-4 mb-4 flex h-16 items-center gap-1 px-1 transition-colors duration-200 sm:-mx-6 sm:px-3"
      {...articleReveal(0)}
    >
      <BackToBlog iconOnly={scrolled} />
      <p
        lang={lang}
        aria-hidden={!scrolled}
        className={cn(
          "text-on-surface type-title-large ease-standard min-w-0 flex-1 truncate transition-[opacity,translate] duration-200",
          scrolled ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {title}
      </p>
    </div>
  );
}
