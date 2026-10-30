import { useSyncExternalStore } from "react";

/**
 * Where the rocket cursor (and its dock in the navigation rail) exists: the primary pointer is a
 * mouse or trackpad, so touchscreen laptops still get it, the window is wide, and the user hasn't
 * asked for reduced motion. Phones and touch tablets never match.
 */
export const ROCKET_QUERY =
  "(pointer: fine) and (min-width: 769px) and (prefers-reduced-motion: no-preference)";

const STORAGE_KEY = "rocket-parked";

/**
 * flying: the rocket follows the pointer. landing / launching: the cursor animates it onto or off
 * the dock. parked: it sits on the dock, drawn by the dock itself; the cursor's rocket is hidden.
 */
export type RocketPhase = "flying" | "landing" | "parked" | "launching";

let phase: RocketPhase | undefined;
let cursorAttached = false;
let pad: HTMLElement | null = null;
const listeners = new Set<() => void>();

function readStored(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Storage blocked (private mode, site data off): the rocket simply flies
    return false;
  }
}

function getPhase(): RocketPhase {
  phase ??= readStored() ? "parked" : "flying";
  return phase;
}

function setPhase(next: RocketPhase) {
  if (next === getPhase()) return;
  phase = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Parked or on its way there: what the dock button shows as pressed. */
export function isRocketParked(phase: RocketPhase): boolean {
  return phase === "landing" || phase === "parked";
}

/**
 * The page-wide rocket state shared by the cursor (`components/rocket-cursor.tsx`, loaded once the
 * page is idle) and the dock (`components/header/rocket-dock.tsx`). Parked survives navigations
 * (one module) and reloads (localStorage).
 */
export const rocketDock = {
  getPhase,
  subscribe,

  /** Park a flying rocket or launch a parked one; mid-flight it turns around. */
  toggle() {
    const park = !isRocketParked(getPhase());
    try {
      if (park) window.localStorage.setItem(STORAGE_KEY, "1");
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Not remembered after a reload, still works on this page
    }
    // Without the cursor (not loaded yet) there is nothing to animate
    if (park) setPhase(cursorAttached ? "landing" : "parked");
    else setPhase(cursorAttached ? "launching" : "flying");
  },

  /** The cursor finished its landing or take-off animation. */
  finish() {
    const current = getPhase();
    if (current === "landing") setPhase("parked");
    else if (current === "launching") setPhase("flying");
  },

  /** The cursor is mounted and animates phase changes; returns the detach function. */
  attachCursor() {
    cursorAttached = true;
    return () => {
      cursorAttached = false;
      rocketDock.finish();
    };
  },

  /** The dock's landing pad: the rocket's parking spot, measured by the cursor. */
  setPad(element: HTMLElement | null) {
    pad = element;
  },
  getPad: () => pad,
};

/** The rocket phase; "flying" on the server and during hydration. */
export function useRocketPhase(): RocketPhase {
  return useSyncExternalStore(subscribe, getPhase, () => "flying");
}
