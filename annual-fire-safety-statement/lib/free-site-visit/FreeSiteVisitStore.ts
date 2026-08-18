/**
 * FreeSiteVisitStore — module-level singleton for the global Free Site Visit
 * modal state.
 *
 * Replaces the previous React-Context-based store so the whole React tree
 * stays server-only. There is no Provider to wrap children in (which in
 * the previous design forced the entire page tree across a client
 * boundary and inflated hydration time).
 *
 * Components subscribe via `useFreeSiteVisitState()` (a thin hook that
 * listens for setState). The button's open() / close() methods work the
 * same as before — code in `FreeSiteVisitButton`, `FreeSiteVisitModal`,
 * and `FreeSiteVisitMobileSticky` doesn't have to change, only the import.
 *
 * This is intentionally not using any external store — the surface area
 * is tiny and a custom store keeps the bundle dependency-free.
 */

import { useSyncExternalStore } from "react";
import type { FreeSiteVisitSource } from "@/lib/free-site-visit/analytics";

export interface FreeSiteVisitState {
  isOpen: boolean;
  source: FreeSiteVisitSource;
  preselectedService: string | undefined;
  autoOpened: boolean;
}

type Listener = () => void;

let state: FreeSiteVisitState = {
  isOpen: false,
  source: "other",
  preselectedService: undefined,
  autoOpened: false,
};

const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

export function getFreeSiteVisitState(): FreeSiteVisitState {
  return state;
}

export function openFreeSiteVisit(
  options: {
    source?: FreeSiteVisitSource;
    service?: string;
  } = {},
) {
  const nextSource = options.source ?? "other";
  state = {
    ...state,
    isOpen: true,
    source: nextSource,
    preselectedService: options.service,
    autoOpened: nextSource === "auto_30s",
  };
  notify();
}

export function closeFreeSiteVisit() {
  state = { ...state, isOpen: false };
  notify();
  // Reset transient fields after microtask so the next open() is clean.
  queueMicrotask(() => {
    state = {
      ...state,
      source: "other",
      preselectedService: undefined,
      autoOpened: false,
    };
    notify();
  });
}

export function markFreeSiteVisitSubmitted() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem("fsv.session.submitted", "1");
  } catch {
    /* ignored */
  }
}

/**
 * Subscribe to the Free Site Visit state. Components re-render when
 * any field changes. Equivalent in semantics to `useFreeSiteVisit()`
 * but reads from a module singleton instead of React Context.
 */
export function useFreeSiteVisitState() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => state,
    () => state,
  );
}
