import { useSyncExternalStore } from "react";

// Cap on the wait for `load`, so a hanging request can't hold deferred work back forever
const MAX_LOAD_WAIT_MS = 5000;

/** Runs `callback` once the page has loaded and the browser is idle; returns a cancel function. */
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

// A page-wide flag, true from `extraDelayMs` after whenIdleAfterLoad on (across client navigations)
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
 * Like useIdleAfterLoad, two seconds later: for speculative requests (nav prefetches), which
 * Lighthouse would otherwise charge to a late LCP.
 */
export const useSettledAfterLoad = createAfterLoadFlag(2000);
