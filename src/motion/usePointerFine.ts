"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Gates every pointer-driven effect in the system.
 *
 * A hover or pointer-following animation on a touch device is worse than no
 * animation: it fires on tap and leaves the element stuck in its hover state,
 * and a magnetic button under a thumb is work nobody can see.
 *
 * Treat `false` as "do not mount the effect at all" rather than "mount it and
 * no-op inside it" — the point is to avoid the listener, not to guard it.
 */
export function usePointerFine(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
