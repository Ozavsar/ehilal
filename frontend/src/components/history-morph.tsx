"use client";

import { useInsertionEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Back/Forward between the blog list and an article morphs the cover and title like a link click.
// React commits a popstate navigation synchronously (no view transition), so the popstate is held
// back from Next's listener and replayed a task later (not a microtask: React reads `window.event`).
// Owns Back/Forward scroll restoration ("manual"): the browser would scroll the old page first.

const BLOG_LIST = /^\/blog(?:\/[1-9]\d*)?$/;
const BLOG_ARTICLE = /^\/blog\/.+-[0-9a-f]{8,12}$/;

type NavigationLike = EventTarget & {
  currentEntry: { key: string } | null;
  activation?: { navigationType: string } | null;
};
type NavigateEventLike = Event & { navigationType: string; destination: { key: string } };

const getNavigation = () => (window as Window & { navigation?: NavigationLike }).navigation;

const isMorphTraversal = (from: string, to: string) =>
  (BLOG_ARTICLE.test(from) && BLOG_LIST.test(to)) ||
  (BLOG_LIST.test(from) && BLOG_ARTICLE.test(to));

// Scroll positions per history entry key, in sessionStorage so a reload or a Back from another
// document finds them too
const STORAGE_KEY = "history-scroll";
const MAX_ENTRIES = 50;
let scrollByEntry: Map<string, number> | null = null;

function savedScrolls() {
  if (!scrollByEntry) {
    scrollByEntry = new Map();
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        for (const item of saved) {
          if (Array.isArray(item) && typeof item[0] === "string" && typeof item[1] === "number") {
            scrollByEntry.set(item[0], item[1]);
          }
        }
      }
    } catch {
      // Storage blocked or unreadable: in-memory only
    }
  }
  return scrollByEntry;
}

function saveScroll(key: string, y: number) {
  const scrolls = savedScrolls();
  scrolls.delete(key); // re-insert as the newest
  scrolls.set(key, y);
  for (const oldest of scrolls.keys()) {
    if (scrolls.size <= MAX_ENTRIES) break;
    scrolls.delete(oldest);
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...scrolls]));
  } catch {
    // Storage full or blocked: keep the in-memory copy
  }
}

// Module state: one instance, mounted once in the root layout
// Scroll position of the Back/Forward destination, applied with its page
let pendingScroll: number | null = null;
// The page on screen (the location runs ahead of it while a replay is pending)
let currentPath = "";
let currentKey: string | undefined;
let replaying = false;
let pendingReplay: ReturnType<typeof setTimeout> | undefined;

export default function HistoryMorph() {
  const pathname = usePathname();

  // Scroll before React checks which shared elements are in the viewport (only those pair up);
  // the min-height keeps the old page from clamping the position meanwhile.
  useInsertionEffect(() => {
    if (pendingScroll === null) return;
    document.documentElement.style.minHeight = `${pendingScroll + window.innerHeight}px`;
    window.scrollTo(0, pendingScroll);
  }, [pathname]);
  useLayoutEffect(() => {
    currentPath = pathname;
    currentKey = getNavigation()?.currentEntry?.key;
    if (pendingScroll === null) return;
    document.documentElement.style.removeProperty("min-height");
    window.scrollTo(0, pendingScroll);
    pendingScroll = null;
  }, [pathname]);

  // A layout effect, so a reload gets its scroll position before the hydrated page paints
  useLayoutEffect(() => {
    const navigation = getNavigation();
    if (!navigation || typeof document.startViewTransition !== "function") return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    // New entries inherit the mode from the current one
    const previousMode = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const loadType = navigation.activation?.navigationType;
    const loadKey = navigation.currentEntry?.key;
    const loadScroll = loadKey ? savedScrolls().get(loadKey) : undefined;
    if ((loadType === "reload" || loadType === "traverse") && loadScroll !== undefined) {
      window.scrollTo(0, loadScroll);
    }

    const onNavigate = (event: Event) => {
      const { navigationType, destination } = event as NavigateEventLike;
      // Next replaces the entry's state after every commit: same entry, mid-swap scroll position
      if (navigationType === "replace") return;
      const key = currentKey ?? navigation.currentEntry?.key;
      if (key) saveScroll(key, window.scrollY);
      pendingScroll =
        navigationType === "traverse" ? (savedScrolls().get(destination.key) ?? null) : null;
    };
    const onPageHide = () => {
      const key = currentKey ?? navigation.currentEntry?.key;
      if (key) saveScroll(key, window.scrollY);
    };

    // Capture phase: runs before Next's own popstate listener on window
    const onPopState = (event: PopStateEvent) => {
      if (replaying) return;
      clearTimeout(pendingReplay);
      if (location.pathname === currentPath) {
        // Same page (a #heading entry or a cancelled replay): nothing re-renders, restore now
        if (pendingScroll !== null) window.scrollTo(0, pendingScroll);
        pendingScroll = null;
        return;
      }
      if (reducedMotion.matches || !isMorphTraversal(currentPath, location.pathname)) return;
      event.stopImmediatePropagation();
      const { state } = event;
      pendingReplay = setTimeout(() => {
        replaying = true;
        try {
          window.dispatchEvent(new PopStateEvent("popstate", { state }));
        } finally {
          replaying = false;
        }
      });
    };

    navigation.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPopState, { capture: true });
    window.addEventListener("pagehide", onPageHide);
    return () => {
      history.scrollRestoration = previousMode;
      navigation.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPopState, { capture: true });
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
