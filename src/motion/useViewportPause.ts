"use client";

import { useEffect, useRef } from "react";

/**
 * Stops a continuous animation when nobody can see it.
 *
 * The site has exactly one permanent animation (the trusted-by marquee), which
 * makes it the one most worth pausing: an infinite `translateX` is a permanent
 * composited layer and a permanent battery draw, and on a phone that cost is
 * paid whether or not the strip is on screen.
 *
 * Writes `data-paused` straight to the DOM rather than going through state.
 * There is no reason for a scroll position to re-render a React subtree, and
 * the CSS already knows what to do with the attribute.
 *
 * `rootMargin` keeps the animation running slightly outside the viewport so the
 * strip is already moving by the time it scrolls into view, rather than
 * visibly starting from a standstill.
 */
export function useViewportPause<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = false;

    const apply = () => {
      const hidden = document.visibilityState === "hidden";
      el.dataset.paused = String(!onScreen || hidden);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false;
        apply();
      },
      { rootMargin: "15% 0px" },
    );

    observer.observe(el);
    document.addEventListener("visibilitychange", apply);
    apply();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);

  return ref;
}
