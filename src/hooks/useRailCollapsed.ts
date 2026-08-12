"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ens.console.rail-collapsed";
/** Same-tab notification; `storage` only fires in the *other* tabs. */
const CHANGE_EVENT = "ens:rail-collapsed";

/**
 * Authoritative once the operator has toggled in this tab, so the rail still
 * works where `localStorage` throws (private browsing, blocked storage).
 */
let current: boolean | null = null;

function subscribe(onChange: () => void) {
  const onStorage = () => {
    current = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readCollapsed(): boolean {
  if (current !== null) return current;
  try {
    current = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    current = false;
  }
  return current;
}

/* The server has no preference to read, so it renders the rail expanded and
   hydration corrects it. Guessing collapsed instead would make the content
   column jump inwards for the majority who never collapsed it. */
const serverCollapsed = () => false;

/**
 * Rail collapse state — CONSOLE-REDESIGN.md §2.
 *
 * Backed by an external store rather than an effect, which also means a second
 * tab following the same preference stays in step with the first.
 */
export function useRailCollapsed(): {
  collapsed: boolean;
  toggle: () => void;
} {
  const collapsed = useSyncExternalStore(
    subscribe,
    readCollapsed,
    serverCollapsed,
  );

  const toggle = useCallback(() => {
    const next = !readCollapsed();
    current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* Preference is not worth failing a click over. */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { collapsed, toggle };
}
