import { useSyncExternalStore } from "react";

// Upper bound for the wait on the load event (a hanging request must not hold deferred work back forever)
const MAX_LOAD_WAIT_MS = 5000;

/**
 * Runs `callback` once the page has loaded and the browser is idle, so decorative work (smooth
 * scrolling, the rocket cursor, off-screen slides) doesn't compete with the first render.
 * Returns a function that cancels the pending call.
 */
export function whenIdleAfterLoad(callback: () => void): () => void {
  let cancelled = false;
  let cancelIdle = () => {};
  let loadTimer: number | undefined;

  const onLoad = () => {
    window.clearTimeout(loadTimer);
    window.removeEventListener("load", onLoad);
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(callback, { timeout: 2000 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      // Safari has no requestIdleCallback
      const id = window.setTimeout(callback, 300);
      cancelIdle = () => window.clearTimeout(id);
    }
  };

  if (document.readyState === "complete") {
    onLoad();
  } else {
    window.addEventListener("load", onLoad);
    loadTimer = window.setTimeout(onLoad, MAX_LOAD_WAIT_MS);
  }

  return () => {
    cancelled = true;
    window.clearTimeout(loadTimer);
    window.removeEventListener("load", onLoad);
    cancelIdle();
  };
}

// A page-wide flag that turns true `extraDelayMs` after whenIdleAfterLoad and stays true across
// client-side navigations. One listener set and one timer per flag, however many components read it.
function createAfterLoadFlag(extraDelayMs: number) {
  let ready = false;
  let started = false;
  const listeners = new Set<() => void>();

  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    if (!started) {
      started = true;
      whenIdleAfterLoad(() => {
        window.setTimeout(() => {
          ready = true;
          listeners.forEach((listener) => listener());
        }, extraDelayMs);
      });
    }
    return () => {
      listeners.delete(onChange);
    };
  };

  return () =>
    useSyncExternalStore(
      subscribe,
      () => ready,
      () => false,
    );
}

/** False on the server, during hydration and until the page has loaded and gone idle; then true. */
export const useIdleAfterLoad = createAfterLoadFlag(0);

/**
 * Like useIdleAfterLoad, two seconds later: for speculative network work (nav prefetches). Pages
 * with entrance animations report their LCP late, and Lighthouse's mobile simulation charges every
 * request started before the LCP to it; requests started at idle still land inside that window.
 */
export const useSettledAfterLoad = createAfterLoadFlag(2000);
