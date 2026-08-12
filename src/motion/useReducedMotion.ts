"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * The single source of truth for the motion preference in JavaScript.
 *
 * The CSS layer already handles its own reduced-motion case, so this is only
 * for the animations CSS cannot express — a GSAP timeline, a spring, an R3F
 * frame loop. Those must check it before they start, not fade themselves out
 * afterwards.
 *
 * Re-renders when the OS setting changes, so a visitor who turns the preference
 * on does not have to reload to be believed.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
