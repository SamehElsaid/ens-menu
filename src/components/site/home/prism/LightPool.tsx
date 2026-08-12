"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, MathUtils } from "three";
import type { ShaderMaterial } from "three";
import type { PrismSignals } from "./signals";
import type { TierConfig } from "./tiers";

/**
 * Where the dispersed light lands.
 *
 * This is the sentence the whole scene exists to say: light passes through the
 * glass and falls on the menu. It sits low and toward the inline end, under the
 * proof column, and it dies before it reaches the headline's bounding box —
 * which is a hard contrast constraint, not a composition preference.
 *
 * One plane, two triangles, and a fragment shader of about thirty instructions:
 * a radial falloff, a two-stop hue mix along a rotated axis, and one intensity
 * uniform. No texture fetch, no noise, no loop, no branch. It is deliberately
 * cheaper than the bloom pass it replaces — `EffectComposer` is banned from this
 * scene precisely because this gets the same read for a fraction of the cost.
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Two brand hues with a violet falloff, never a spectrum.
 *
 * A seven-colour prism is a physics diagram and reads as a gaming brand. The
 * dispersion here is tuned to `--s-grad-vivid`, so the light landing on the page
 * is the same light the headline's one gradient word is made of.
 */
const FRAGMENT = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  void main() {
    vec2 offset = vUv - 0.5;

    // Elliptical rather than round: light landing on a surface at an angle
    // pools wide and shallow, never as a circle.
    float distance = length(vec2(offset.x * 0.78, offset.y * 1.55));
    float falloff = smoothstep(0.5, 0.0, distance);
    falloff *= falloff;

    // Hue separates along the diagonal the light arrived on.
    float axis = clamp(offset.x * 0.7071 + offset.y * 0.7071 + 0.5, 0.0, 1.0);
    vec3 tint = mix(uColorA, uColorB, axis);

    float level = falloff * uIntensity;
    gl_FragColor = vec4(tint * level, level);
  }
`;

export function LightPool({
  signals,
  config,
  mirrored,
  dark,
}: {
  signals: React.RefObject<PrismSignals>;
  config: TierConfig;
  mirrored: boolean;
  dark: boolean;
}) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uIntensity: { value: 0 },
      /* The dark ramp from `globals.css`, so the pool is a lit surface in a dark
         room rather than a bright shape pasted onto one. */
      uColorA: { value: new Color(dark ? "#7f22d2" : "#9035e8") },
      uColorB: { value: new Color(dark ? "#8f0a8b" : "#bb0bb5") },
    }),
    [dark],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const { progress, entrance } = signals.current;

    /* Two multiplied factors, one uniform write. The entrance blooms it in; the
       scroll dims it as the light angle degrades. */
    const scrollFade = MathUtils.lerp(1, 0.12, progress);
    const target = entrance.intensity * scrollFade * config.poolIntensity;

    material.uniforms.uIntensity.value = MathUtils.damp(
      material.uniforms.uIntensity.value,
      target,
      6,
      delta,
    );
  });

  return (
    /* Lower inline-end quadrant — under the proof column, spreading inward and
       dying well short of the headline. */
    <mesh
      position={[mirrored ? -1.1 : 1.1, -1.15, -1.4]}
      rotation={[-0.35, 0, mirrored ? -0.22 : 0.22]}
    >
      <planeGeometry args={[4, 2.4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
