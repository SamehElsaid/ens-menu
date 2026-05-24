"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 3500;

export function useDelayedLoad(delayMs = DEFAULT_DELAY_MS) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: delayMs });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(load, delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return ready;
}
