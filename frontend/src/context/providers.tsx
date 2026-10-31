"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { ThemeProvider } from "next-themes";
import { useIdleAfterLoad, whenIdleAfterLoad } from "@/hooks/use-idle-after-load";
import "lenis/dist/lenis.css";

const RocketCursor = dynamic(() => import("@/components/rocket-cursor"), { ssr: false });

function DeferredRocketCursor() {
  return useIdleAfterLoad() ? <RocketCursor /> : null;
}

// Lenis smooth wheel scrolling, loaded once the page is idle; native scrolling under reduced motion
function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;

    const sync = () => {
      if (reducedMotion.matches) {
        lenisRef.current?.destroy();
        lenisRef.current = null;
        return;
      }
      if (lenisRef.current) return;
      import("lenis")
        .then(({ default: LenisClass }) => {
          // Unmounted, reduced motion switched on or already created while the chunk loaded
          if (!active || reducedMotion.matches || lenisRef.current) return;
          // anchors: in-page "#id" links scroll through Lenis instead of fighting it natively
          lenisRef.current = new LenisClass({ autoRaf: true, anchors: true });
        })
        // Without the chunk (e.g. offline) the page keeps scrolling natively
        .catch(() => {});
    };

    const cancelIdle = whenIdleAfterLoad(() => {
      sync();
      reducedMotion.addEventListener("change", sync);
    });
    return () => {
      active = false;
      cancelIdle();
      reducedMotion.removeEventListener("change", sync);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis' wheel inertia would drag a new page back down: stop() + start() drops it and re-reads
  // the scroll position (a layout effect runs before Lenis' next frame)
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
      <DeferredRocketCursor />
    </ThemeProvider>
  );
}
