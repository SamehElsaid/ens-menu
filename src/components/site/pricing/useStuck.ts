"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports whether a sticky element has detached from its resting position.
 *
 * A forty-row comparison table scrolls the plan names out of the viewport long
 * before the reader is finished with it, so the header row is sticky — and a
 * sticky header that looks identical stuck and unstuck reads as part of the row
 * you happen to be on. An elevation step is what separates "this is a heading
 * floating over the table" from "this is the next row".
 *
 * There is no CSS selector for "currently stuck". The exact technique is a
 * sentinel immediately above the sticky element: once the sentinel has passed
 * under the fixed header, the sticky element must be pinned. One observer, one
 * element, no work between intersections and nothing at all per frame — the
 * cheapest correct answer available, and cheaper than the scroll listener the
 * naive version of this uses.
 */
/**
 * `rootMargin` accepts pixels and percentages only, so a CSS length — which is
 * where the header's height is defined, and where it should stay defined — has to
 * be resolved through the layout engine rather than parsed.
 */
function resolveToPx(length: string): number {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;height:${length}`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

export function useStuck(offset: string) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${resolveToPx(offset)}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [offset]);

  return { sentinelRef, stuck };
}
