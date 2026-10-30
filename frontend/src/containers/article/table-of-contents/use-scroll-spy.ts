import { useEffect, useState } from "react";

// A heading becomes current once its top passes this share of the viewport height
const ACTIVE_LINE = 0.25;

// Id of the section being read: the last heading above the active line. Scrolling up through a
// long section keeps it current, and at the very bottom the last heading wins (short final
// sections never reach the line). Lenis scrolls the window, so plain scroll events cover it too.
export function useScrollSpy(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = headingIds.flatMap((id) => document.getElementById(id) ?? []);
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * ACTIVE_LINE;
      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > line) break;
        current = heading.id;
      }
      const { scrollHeight } = document.documentElement;
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= scrollHeight - 2) {
        current = headings.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headingIds]);

  return activeId;
}
