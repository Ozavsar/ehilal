"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ThemeProvider } from "next-themes";
import "lenis/dist/lenis.css";

// Lenis smooth wheel scrolling on the window. With reduced motion it isn't created at all, so the
// page scrolls natively. Keyboard, scrollbar and touch scrolling are native either way.
function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reducedMotion.matches) {
        lenisRef.current?.destroy();
        lenisRef.current = null;
      } else {
        // anchors: in-page "#id" links scroll through Lenis instead of fighting it natively
        lenisRef.current ??= new Lenis({ autoRaf: true, anchors: true });
      }
    };

    sync();
    reducedMotion.addEventListener("change", sync);
    return () => {
      reducedMotion.removeEventListener("change", sync);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Next scrolls a new page to the top natively, but wheel inertia still running in Lenis would
  // drag it back down. stop() + start() (Lenis' public reset) drops the inertia and re-reads the
  // real scroll position; a layout effect runs before Lenis' next frame.
  useLayoutEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.stop();
    lenis.start();
  }, [pathname]);

  return null;
}

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // disableTransitionOnChange: colours switch at once, the theme toggle's view transition animates
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <SmoothScroll />
    </ThemeProvider>
  );
}
