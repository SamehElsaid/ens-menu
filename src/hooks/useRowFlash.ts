"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Just past the 1200ms tint, so the class is gone before a second mutation on
    the same row needs to restart it. */
const FLASH_MS = 1300;

const NONE: ReadonlySet<string> = new Set();

/**
 * "Which row did I just change?" — MOTION-BLUEPRINT.md §10.12 W-1, §10.13 A-1.
 *
 * An admin or console grid refetches after a mutation, and the row that changed
 * looks exactly like the forty that did not. A toast says the save worked but
 * not *where*, and the operator's eyes are on the row, not the corner of the
 * screen. Passing the mutated key here tints that row for 1.2 seconds.
 *
 * A tint rather than a movement, on purpose: these lists are clicked through at
 * speed, and a row that shifts under a pointer already travelling towards it is
 * a misclick. The timer is the only state; nothing here animates in JS.
 */
export function useRowFlash() {
  const [flashed, setFlashed] = useState<ReadonlySet<string>>(NONE);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const flashRow = useCallback((key: string | number | null | undefined) => {
    if (key === null || key === undefined) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setFlashed(new Set([String(key)]));
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setFlashed(NONE);
    }, FLASH_MS);
  }, []);

  return { flashedRowKeys: flashed, flashRow };
}
