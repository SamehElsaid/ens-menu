"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { detectTier, markPrismDeclined, type Tier } from "./prism/tiers";

/**
 * The gate in front of the Prism.
 *
 * The rule this file exists to enforce: **the home page is complete, painted and
 * interactive before a single byte of Three.js is requested.** Stage one — the
 * server-rendered hero with its static wash — is a finished hero, not a
 * placeholder, so every stage after it is optional and any of them can be the
 * last one without the page looking unfinished.
 *
 * Nothing here imports `./prism/PrismStage` at module scope, and nothing here
 * imports `three` at all. A device that fails the capability gate, or a visitor
 * who has asked for reduced motion, pays zero kilobytes to find out. `tiers.ts`
 * is safe to import statically because it is plain feature detection.
 */

/** After this long, stop waiting. Someone on a connection slow enough to need
 *  four seconds for this chunk is better served without it. */
const IMPORT_TIMEOUT_MS = 4_000;

/** `requestIdleCallback` is unavailable on Safari. */
const IDLE_FALLBACK_MS = 300;

type StageProps = {
  tier: Exclude<Tier, "D">;
  /** True under `dir="rtl"`, which mirrors the composition and the light. */
  mirrored: boolean;
  dark: boolean;
  onTierDown: () => void;
  onFallback: () => void;
};

/**
 * Swallows any error inside the scene straight to the static path.
 *
 * Silent on purpose. A decorative light effect failing is not something to tell
 * a restaurant owner about, there is nothing they could do about it, and the
 * hero without it is the hero as designed.
 */
class PrismBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function PrismSlot({ locale }: { locale: string }) {
  const [Stage, setStage] = useState<ComponentType<StageProps> | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const dark = useDarkMode();

  /* Mirrors `tier` so the decline handler can branch on the current value
     without reading state inside an updater — an updater that also called
     `markPrismDeclined()` would fire that side effect twice under StrictMode. */
  const tierRef = useRef<Tier | null>(null);

  const applyTier = useCallback((next: Tier) => {
    tierRef.current = next;
    setTier(next);
    if (next === "D") setStage(null);
  }, []);

  const handleFallback = useCallback(() => applyTier("D"), [applyTier]);

  /**
   * Tier down once, never back up.
   *
   * A → B steps the environment and the light motes down rather than degrading
   * the pane itself. Anything below that goes to the static path and
   * records the decision for the session, so a device that has already proved
   * itself slow is not asked to prove it again on the next pageview.
   */
  const handleTierDown = useCallback(() => {
    if (tierRef.current === "A") {
      applyTier("B");
      return;
    }
    markPrismDeclined();
    applyTier("D");
  }, [applyTier]);

  useEffect(() => {
    let cancelled = false;
    let abandoned = false;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;
    let importTimeout: number | undefined;
    let observer: IntersectionObserver | undefined;

    const request = () => {
      const detected = detectTier();
      if (cancelled) return;

      if (detected === "D") {
        applyTier("D");
        return;
      }

      importTimeout = window.setTimeout(() => {
        abandoned = true;
        applyTier("D");
      }, IMPORT_TIMEOUT_MS);

      void import("./prism/PrismStage")
        .then((module) => {
          window.clearTimeout(importTimeout);
          if (cancelled || abandoned) return;

          /* Turbopack / ESM interop sometimes nests the default export. */
          const resolved =
            (module as { default?: unknown }).default ?? module;
          const Comp =
            typeof resolved === "function"
              ? resolved
              : typeof (resolved as { default?: unknown })?.default ===
                  "function"
                ? (resolved as { default: ComponentType<StageProps> }).default
                : null;

          if (!Comp) {
            applyTier("D");
            return;
          }

          applyTier(detected);
          /* Functional form is mandatory. `setStage(Comp)` would treat the
             component itself as a state updater and call `Comp(null)` — which
             is the "Cannot destructure property 'tier' of null" crash. */
          setStage(() => Comp as ComponentType<StageProps>);
        })
        .catch(() => {
          window.clearTimeout(importTimeout);
          if (cancelled) return;
          applyTier("D");
        });
    };

    /* Three conditions, in this order: the browser is idle, the hero is actually
       in view, and the device has demonstrated it can afford a canvas. */
    const waitForView = () => {
      const section = document.getElementById("hero");
      if (!section) {
        request();
        return;
      }

      observer = new IntersectionObserver((entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer?.disconnect();
        request();
      });
      observer.observe(section);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(waitForView, { timeout: 1_200 });
    } else {
      timerHandle = window.setTimeout(waitForView, IDLE_FALLBACK_MS);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(importTimeout);
      window.clearTimeout(timerHandle);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
    };
  }, [applyTier]);

  if (!Stage || typeof Stage !== "function" || tier === null || tier === "D") {
    return null;
  }

  return (
    <PrismBoundary onError={handleFallback}>
      <Stage
        tier={tier}
        mirrored={locale === "ar"}
        dark={dark}
        onTierDown={handleTierDown}
        onFallback={handleFallback}
      />
    </PrismBoundary>
  );
}

export default PrismSlot;
