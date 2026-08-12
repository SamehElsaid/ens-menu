"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { PrismCanvas } from "./PrismCanvas";
import { createSignals } from "./signals";
import { usePointerTarget } from "./usePointerTarget";
import { useScrollProgress } from "./useScrollProgress";
import { TIER_CONFIG, type Tier } from "./tiers";

/**
 * Orchestrates the scene without ever being part of it.
 *
 * This component owns the four things the canvas itself must not: when to
 * render, the entrance choreography, the handoff from the CSS wash, and the
 * inputs. The `<Canvas>` below it only draws.
 *
 * It is the `next/dynamic` target, so importing this file is what pulls Three.js
 * into the page. Nothing outside `prism/` imports it directly.
 */

/** Scroll progress at which the canvas has fully faded out and there is no
 *  longer any reason to render a frame. */
const RENDER_CUTOFF = 0.9;

/** The window over which the canvas fades as the hero leaves. */
const FADE_START = 0.55;
const FADE_END = 0.85;

type PrismStageProps = {
  tier: Exclude<Tier, "D">;
  /** True under `dir="rtl"`, which mirrors the composition and the light. */
  mirrored: boolean;
  dark: boolean;
  onTierDown: () => void;
  onFallback: () => void;
};

const NOOP = () => {};

export default function PrismStage(props: PrismStageProps | null = null) {
  /* Under Turbopack HMR / certain dynamic-import remounts this module has been
     invoked with `null` props for one frame. Default the whole argument so
     destructuring never throws; skip the canvas below when props are unusable.
     Hooks still run unconditionally (Rules of Hooks). */
  const tier = props?.tier ?? null;
  const mirrored = props?.mirrored ?? false;
  const dark = props?.dark ?? false;
  const onTierDown = props?.onTierDown ?? NOOP;
  const onFallback = props?.onFallback ?? NOOP;
  const ready = tier != null;

  const config = TIER_CONFIG[tier ?? "B"];
  const usesTimeline = ready && config.gsapEntrance;

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const signalsRef = useRef(createSignals(!usesTimeline));

  /* Two independent reasons to stop rendering, tracked outside state so the
     scroll handler can read them without a render. */
  const onScreenRef = useRef(true);
  const visibleRef = useRef(true);
  const [active, setActive] = useState(true);

  /* A callback ref rather than an effect: refs are attached during commit, so
     the section is resolved before any effect below needs it. */
  const attachContainer = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    sectionRef.current = node?.closest("section") ?? null;
  }, []);

  const syncActive = useCallback(() => {
    const next = onScreenRef.current && visibleRef.current;
    setActive((previous) => (previous === next ? previous : next));
  }, []);

  /* Every write to the signal object happens here, in the component that owns
     it. The input hooks only report. */
  const handleProgress = useCallback(
    (progress: number) => {
      signalsRef.current.progress = progress;

      const container = containerRef.current;
      if (container) {
        const fade =
          1 -
          Math.min(
            Math.max((progress - FADE_START) / (FADE_END - FADE_START), 0),
            1,
          );
        container.style.setProperty("--s-prism-scroll", String(fade));
      }

      onScreenRef.current = progress < RENDER_CUTOFF;
      syncActive();
    },
    [syncActive],
  );

  const handlePointer = useCallback((x: number, y: number) => {
    signalsRef.current.pointer.x = x;
    signalsRef.current.pointer.y = y;
  }, []);

  useScrollProgress({ sectionRef, onProgress: handleProgress });

  usePointerTarget({
    sectionRef,
    onPointer: handlePointer,
    enabled: ready && config.pointer,
  });

  /* Nothing renders on a background tab. */
  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      syncActive();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [syncActive]);

  /* Toggling the OS preference while the page is open tears the scene down
     immediately, through the same disposal path as leaving the route. */
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) onFallback();
  }, [ready, reducedMotion, onFallback]);

  /**
   * The entrance.
   *
   * The one place GSAP earns its keep on this page: four unrelated properties,
   * on three different owners, on one clock — the container's opacity, a CSS
   * variable on a sibling element, three rotation/position values on a plain
   * object, and a shader uniform's target, each with its own start time and
   * duration. Hand-rolling that is how you end up with four rAF loops.
   *
   * The causality is the point of the ordering: the glass arrives first, and the
   * light through it blooms 250ms later. Reversed, it reads as a glow that
   * happens to have an object in it.
   *
   * GSAP is imported here rather than at module scope so the tiers that do not
   * choreograph an entrance never download it.
   */
  useEffect(() => {
    if (!ready) return;

    const container = containerRef.current;
    const aurora =
      sectionRef.current?.querySelector<HTMLElement>(".s-aurora") ?? null;

    if (!container) return;

    if (!usesTimeline) {
      container.style.setProperty("--s-prism-enter", "1");
      if (aurora) aurora.style.setProperty("--s-aurora-opacity", "0.35");
      return;
    }

    let cancelled = false;
    let kill: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;

      const entrance = signalsRef.current.entrance;
      const timeline = gsap.timeline();

      /* Glass arrives first; light blooms through it; wash settles under the
         computed pool. Typography (HomeMotion) is delayed to sit behind this. */
      timeline
        .to(
          container,
          { "--s-prism-enter": 1, duration: 0.85, ease: "power2.out" },
          0,
        )
        .to(
          aurora,
          { "--s-aurora-opacity": 0.55, duration: 0.9, ease: "power2.out" },
          0,
        )
        .to(
          entrance,
          {
            yaw: 0,
            pitch: 0,
            z: 0,
            duration: 1.25,
            ease: "power3.out",
          },
          0,
        )
        /* Light through glass does not fade up linearly, it catches: the pool
           overshoots by 14% as the pane swings toward the beam, then settles as
           the pane does. Two tweens on one uniform target, so the frame loop
           still damps toward a single number. */
        .to(
          entrance,
          { intensity: 1.14, duration: 0.95, ease: "power2.out" },
          0.22,
        )
        .to(
          entrance,
          { intensity: 1, duration: 0.95, ease: "power1.inOut" },
          1.05,
        )
        .to(
          aurora,
          { "--s-aurora-opacity": 0.4, duration: 0.7, ease: "power1.out" },
          0.55,
        );

      kill = () => {
        timeline.kill();
        gsap.killTweensOf([container, entrance]);
        if (aurora) gsap.killTweensOf(aurora);
      };
    });

    return () => {
      cancelled = true;
      kill?.();
      /* Hand the wash back to the stylesheet rather than leaving it pinned at
         the dimmed value the scene needed. */
      aurora?.style.removeProperty("--s-aurora-opacity");
    };
  }, [ready, usesTimeline]);

  const handleContextLost = useCallback(() => {
    onFallback();
  }, [onFallback]);

  if (!ready) return null;

  return (
    <div
      ref={attachContainer}
      aria-hidden
      /* Not focusable, not announced, and carrying no information: everything
         the hero says, it says in DOM. Removing this element removes light, not
         meaning. */
      className={[
        "s-prism-stage",
        config.composition === "corner" ? "s-prism-stage--corner" : "",
        usesTimeline ? "" : "s-prism-stage--css-enter",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PrismCanvas
        signals={signalsRef}
        config={config}
        mirrored={mirrored}
        dark={dark}
        active={active}
        onDecline={onTierDown}
        onContextLost={handleContextLost}
      />
    </div>
  );
}
