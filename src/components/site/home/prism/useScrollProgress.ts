"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Reads how far the hero has scrolled. It does not drive the scroll.
 *
 * There is no pin and no scroll-jacking anywhere in this feature: the hero
 * scrolls exactly as it would without the canvas, and the scene simply observes
 * how far it has gone. That is the single biggest reason this hero carries no
 * layout-shift or reflow risk.
 *
 * Two guards keep the cost near zero. An `IntersectionObserver` decides whether
 * to read at all, so nothing is measured once the hero is behind you; and reads
 * are rAF-coalesced, so `getBoundingClientRect` is called at most once per frame
 * however many scroll events the browser delivers.
 */
export function useScrollProgress({
  sectionRef,
  onProgress,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /**
   * Called at most once per frame with the new progress.
   *
   * The hook reports rather than writes: every mutation of the scene's signal
   * object happens in the one component that owns it, which keeps the data flow
   * one-directional and means this hook has no knowledge of the scene at all.
   */
  onProgress: (progress: number) => void;
}) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let intersecting = true;

    const read = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = rect.height || 1;
      /* 1 when the section's bottom edge has reached the top of the viewport,
         which is the moment the hero is entirely behind the fold. */
      onProgress(Math.min(Math.max(-rect.top / span, 0), 1));
    };

    const schedule = () => {
      if (frame || !intersecting) return;
      frame = requestAnimationFrame(read);
    };

    const observer = new IntersectionObserver((entries) => {
      intersecting = entries[0]?.isIntersecting ?? false;
      /* One read on the way out too, so progress lands on a final value rather
         than freezing wherever the last frame happened to catch it. */
      if (!intersecting) {
        read();
        return;
      }
      schedule();
    });

    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    read();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionRef, onProgress]);
}
