"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
} from "three";
import type { Points } from "three";
import type { PrismSignals } from "./signals";

/**
 * Sparse light motes drifting through the prism field.
 * Points + additive blending — Tier A only, capped count.
 */

const COUNT = 28;

export function LightMotes({
  signals,
  mirrored,
  dark,
}: {
  signals: React.RefObject<PrismSignals>;
  mirrored: boolean;
  dark: boolean;
}) {
  const pointsRef = useRef<Points>(null);
  const direction = mirrored ? -1 : 1;

  const { geometry, phases } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const ph = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      const a = (i / COUNT) * Math.PI * 2;
      const r = 0.35 + (i % 5) * 0.18;
      pos[i * 3] = Math.cos(a) * r * direction * 0.9;
      pos[i * 3 + 1] = ((i % 7) / 7 - 0.5) * 1.8;
      pos[i * 3 + 2] = -0.4 - (i % 4) * 0.22;
      ph[i] = i * 0.37;
    }
    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(pos, 3));
    return { geometry: geom, phases: ph };
  }, [direction]);

  const color = useMemo(
    () => new Color(dark ? "#c084fc" : "#e9d5ff"),
    [dark],
  );

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const { progress, entrance, pointer } = signals.current;
    const t = state.clock.elapsedTime;
    const attr = points.geometry.attributes.position;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < COUNT; i += 1) {
      const baseY = ((i % 7) / 7 - 0.5) * 1.8;
      arr[i * 3 + 1] =
        baseY + Math.sin(t * 0.45 + phases[i]) * 0.08 + progress * 0.2;
      arr[i * 3] +=
        Math.sin(t * 0.2 + phases[i]) * 0.0008 * direction +
        pointer.x * 0.0003;
    }
    attr.needsUpdate = true;

    const mat = points.material as { opacity: number };
    const target = entrance.intensity * MathUtils.lerp(0.55, 0.12, progress);
    mat.opacity = MathUtils.damp(mat.opacity, target, 4, delta);

    points.rotation.y = MathUtils.damp(
      points.rotation.y,
      pointer.x * 0.08,
      2.5,
      delta,
    );
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}
