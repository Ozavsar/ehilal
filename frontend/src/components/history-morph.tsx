"use client";

import { useInsertionEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Browser Back/Forward between a blog list page and an article: lets the cover and title morph
// like they do on a link click. React commits a navigation started in a `popstate` event
// synchronously (so the browser can restore the scroll position against the new page), and a
// synchronous commit runs no view transition. Here such a popstate is held back from Next's
// listener and replayed a task later (not a microtask: React reads `window.event`, which is still
// the original popstate then), so the restore becomes an ordinary transition and the
// <ViewTransition> pairs (components/view-transitions.tsx) animate.
// The browser restores the scroll position before popstate, which would scroll the old page, so
// while this is active it restores Back/Forward scroll positions itself (scrollRestoration
// "manual"), together with the new page.
// Needs the View Transitions and Navigation APIs; anything else keeps the browser's behaviour, and
// reduced motion keeps the instant swap. Remove this component and its <HistoryMorph /> to drop
// the feature.

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

// Scroll positions per history entry key, kept in sessionStorage so a reload or a Back into this
// site from another document finds them too (the browser doesn't restore "manual" entries)
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
      // Storage blocked or unreadable: positions last for this document only
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
// Scroll position of the entry a Back/Forward press goes to, applied with its page
let pendingScroll: number | null = null;
// The page on screen: its path and history entry (ahead of it while a replay is pending)
let currentPath = "";
let currentKey: string | undefined;
let replaying = false;
let pendingReplay: ReturnType<typeof setTimeout> | undefined;

export default function HistoryMorph() {
  const pathname = usePathname();

  // Both run while React swaps the page (inside the view transition's update, out of sight).
  // The scroll position goes back before React checks which shared elements are in the viewport
  // (only those pair up); the min-height keeps the old page from clamping it meanwhile.
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

  // A layout effect: a reload or a Back from another document gets its position before the
  // hydrated page paints again
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

    // Fires before every navigation: remember where this entry was left, and for Back/Forward
    // where the destination was
    const onNavigate = (event: Event) => {
      const { navigationType, destination } = event as NavigateEventLike;
      // Next replaces the entry's state after every commit: same entry, mid-swap scroll position
      if (navigationType === "replace") return;
      const key = currentKey ?? navigation.currentEntry?.key;
      if (key) saveScroll(key, window.scrollY);
      pendingScroll =
        navigationType === "traverse" ? (savedScrolls().get(destination.key) ?? null) : null;
    };
    // Leaving the document some other way (address bar, closing the tab)
    const onPageHide = () => {
      const key = currentKey ?? navigation.currentEntry?.key;
      if (key) saveScroll(key, window.scrollY);
    };

    // Capture phase: runs before Next's own popstate listener on window
    const onPopState = (event: PopStateEvent) => {
      if (replaying) return;
      // A newer Back/Forward press replaces a replay that hasn't run yet
      clearTimeout(pendingReplay);
      if (location.pathname === currentPath) {
        // The page on screen already (a #heading entry, or a press that cancelled a pending
        // replay): nothing re-renders, so restore right away
        if (pendingScroll !== null) window.scrollTo(0, pendingScroll);
        pendingScroll = null;
        return;
      }
      // Otherwise Next commits the page now and the layout effect above restores the scroll
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
