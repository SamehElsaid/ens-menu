"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the dark theme is active.
 *
 * The theme is a `dark` class on `<html>`, written by the toggle and by the
 * inline script in the locale layout, so the class *is* the source of truth and
 * a `MutationObserver` is the correct way to subscribe to it. Reading
 * `prefers-color-scheme` instead would miss an explicit user choice.
 *
 * `false` on the server, matching the un-classed markup the server sends.
 */

const subscribe = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

const getSnapshot = () => document.documentElement.classList.contains("dark");

const getServerSnapshot = () => false;

export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
