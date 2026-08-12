"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/cn";
import { usePointerFine } from "./usePointerFine";
import { useReducedMotion } from "./useReducedMotion";

/**
 * ≤ 4 px pointer attraction. Call sites: home hero primary CTA, home closing
 * CTA band, pricing Pro CTA, mobile-app Google Play.
 *
 * Implemented with refs + rAF, not Motion: pricing already proved a 28 KB
 * library floor is the wrong trade for a 4 px damp, and this must stay off
 * the `/pricing` and `/mobile-app` route budgets.
 *
 * Auto-disabled on touch and under `prefers-reduced-motion` — the wrapper
 * collapses to a plain inline-flex so layout is identical either way.
 */

const STRENGTH = 4;
const DAMP = 0.22;

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Cap in CSS pixels. Blueprint default is 4. */
  strength?: number;
};

export function Magnetic({
  children,
  className,
  strength = STRENGTH,
}: MagneticProps) {
  const fine = usePointerFine();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const ref = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const stop = () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      }
    };

    const tick = () => {
      const cx = current.current.x;
      const cy = current.current.y;
      const tx = target.current.x;
      const ty = target.current.y;
      const nx = cx + (tx - cx) * DAMP;
      const ny = cy + (ty - cy) * DAMP;
      current.current.x = nx;
      current.current.y = ny;
      el.style.transform = `translate3d(${nx.toFixed(2)}px, ${ny.toFixed(2)}px, 0)`;

      if (Math.abs(tx - nx) > 0.05 || Math.abs(ty - ny) > 0.05) {
        raf.current = requestAnimationFrame(tick);
      } else {
        current.current.x = tx;
        current.current.y = ty;
        el.style.transform =
          tx === 0 && ty === 0
            ? ""
            : `translate3d(${tx}px, ${ty}px, 0)`;
        raf.current = 0;
      }
    };

    const kick = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      target.current.x = Math.max(-strength, Math.min(strength, dx * 0.18));
      target.current.y = Math.max(-strength, Math.min(strength, dy * 0.18));
      kick();
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      kick();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      stop();
      el.style.transform = "";
    };
  }, [enabled, strength]);

  if (!enabled) {
    return (
      <span className={cn("inline-flex", className)}>{children}</span>
    );
  }

  const style = {
    willChange: "transform",
  } satisfies CSSProperties;

  return (
    <span
      ref={ref}
      className={cn("inline-flex", className)}
      style={style}
    >
      {children}
    </span>
  );
}

export default Magnetic;
