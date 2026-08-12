"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Turns pointer position into a target the frame loop damps toward.
 *
 * Scoped to the hero section rather than to `window`, so a pointer three
 * screens down the page is not moving a scene that has already been disposed.
 *
 * Never mounted on touch: `(hover: none)` short-circuits this entirely at the
 * caller, which is the point of the `enabled` flag. A pointer-following effect
 * under a thumb is work nobody can see, and on a touch device `pointermove`
 * fires during scrolling — the worst possible moment to be doing layout reads.
 */
export function usePointerTarget({
  sectionRef,
  onPointer,
  enabled,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /** Reports a position normalised to -1…1, and 0,0 when the pointer leaves. */
  onPointer: (x: number, y: number) => void;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    /* The rect read is deferred into a rAF so a burst of `pointermove` events
       cannot turn into a burst of forced layouts. */
    const apply = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      onPointer(Math.min(Math.max(x, -1), 1), Math.min(Math.max(y, -1), 1));
    };

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    /* Rest, not snap: the frame loop damps back from wherever it was, so the
       pane relaxes over about 700ms when the pointer leaves. */
    const onLeave = () => onPointer(0, 0);

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [sectionRef, onPointer, enabled]);
}
