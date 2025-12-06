import { useEffect, useState } from "react";

export function useScrollSpy() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeId;
}
