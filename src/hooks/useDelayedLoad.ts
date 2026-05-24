"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 3500;

export function useDelayedLoad(delayMs = DEFAULT_DELAY_MS) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    const load = () => setReady(true);
    const events = ["scroll", "click", "touchstart", "keydown"] as const;

    events.forEach((event) =>
      window.addEventListener(event, load, { once: true, passive: true })
    );

    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(load, { timeout: delayMs });
    } else {
      idleId = window.setTimeout(load, delayMs) as unknown as number;
    }

    return () => {
      events.forEach((event) => window.removeEventListener(event, load));
      if (typeof window.cancelIdleCallback === "function" && idleId) {
        window.cancelIdleCallback(idleId);
      } else if (idleId) {
        window.clearTimeout(idleId);
      }
    };
  }, [delayMs, ready]);

  return ready;
}
