"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query is an external store, so it is read as one.
 *
 * `useSyncExternalStore` is the right primitive here rather than
 * `useState` + `useEffect`: it subscribes without the extra render that writing
 * the initial value into state costs, it tears down correctly, and its third
 * argument gives the server an explicit snapshot instead of leaving the first
 * client render to disagree with the markup.
 */

/**
 * Every motion query answers `false` on the server.
 *
 * That is the conservative direction for all of them: no reduced-motion
 * override applied where CSS is already handling it, and no pointer-driven
 * effect mounted until a real pointer has been confirmed.
 */
const serverSnapshot = () => false;

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
