"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, MathUtils, Vector2 } from "three";
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
  /** Where the beam lands. Follows the pointer, because turning the glass
   *  moves the light — that is the whole point of the object. */
  uniform vec2 uOffset;
  /** 0 at rest, 1 as the hero leaves: the pane goes edge-on, so the pool
   *  narrows into a slit before it goes out. */
  uniform float uSqueeze;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  void main() {
    vec2 offset = vUv - 0.5 - uOffset;

    // Elliptical rather than round: light landing on a surface at an angle
    // pools wide and shallow, never as a circle.
    float distance = length(
      vec2(offset.x * (0.78 + uSqueeze * 1.1), offset.y * (1.55 + uSqueeze * 1.9))
    );
    float falloff = smoothstep(0.42, 0.0, distance);
    falloff *= falloff * falloff;

    // Hue separates along the diagonal the light arrived on.
    float axis = clamp(offset.x * 0.7071 + offset.y * 0.7071 + 0.5, 0.0, 1.0);
    vec3 tint = mix(uColorA, uColorB, axis);

    /* Soft light only — never a dark stain under the pane. */
    float level = falloff * uIntensity * 0.55;
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
      uOffset: { value: new Vector2(0, 0) },
      uSqueeze: { value: 0 },
      /* The dark ramp from `globals.css`, so the pool is a lit surface in a dark
         room rather than a bright shape pasted onto one. */
      uColorA: { value: new Color(dark ? "#a78bfa" : "#d8b4fe") },
      uColorB: { value: new Color(dark ? "#c084fc" : "#f0abfc") },
    }),
    [dark],
  );

  const clock = useRef(0);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const { pointer, progress, entrance } = signals.current;
    clock.current += delta;

    /* Factors multiply, one uniform write each. The entrance blooms it in; the
       scroll dims it as the light angle degrades; the breath keeps a settled
       hero from looking like a still frame — 4% over 7s, felt not seen. */
    const scrollFade = MathUtils.lerp(1, 0.12, progress);
    const breath = 1 + Math.sin(clock.current * 0.9) * 0.04;
    const target =
      entrance.intensity * scrollFade * breath * config.poolIntensity;

    material.uniforms.uIntensity.value = MathUtils.damp(
      material.uniforms.uIntensity.value,
      target,
      6,
      delta,
    );

    /* Turning the glass moves the light: the pointer slides the landing point
       by a few percent of the plane, against the pane's own yaw so the two read
       as one object. Damped slower than the pane, because a pool of light on a
       surface has more inertia than the surface.
       On top of that, leaving the hero pulls the pool up and inline-end —
       toward the phone that is about to carry the story — so the last thing the
       real light does is gather into the device. */
    const sign = mirrored ? -1 : 1;
    const pull = MathUtils.smoothstep(progress, 0.15, 1);
    const offset = material.uniforms.uOffset.value as Vector2;
    offset.x = MathUtils.damp(
      offset.x,
      pointer.x * -0.06 * sign + pull * 0.1 * sign,
      3,
      delta,
    );
    offset.y = MathUtils.damp(
      offset.y,
      pointer.y * 0.05 + pull * 0.13,
      3,
      delta,
    );

    /* Past halfway out of the hero the pane is nearly edge-on, so what is left
       of the pool closes to a slit as it goes. */
    material.uniforms.uSqueeze.value = MathUtils.damp(
      material.uniforms.uSqueeze.value,
      MathUtils.smoothstep(progress, 0.35, 1) * 0.9,
      4,
      delta,
    );
  });

  return (
    /* Lower inline-end quadrant — under the proof column, spreading inward and
       dying well short of the headline. */
    <mesh
      position={[mirrored ? -0.95 : 0.95, -1.2, -1.4]}
      rotation={[-0.5, 0, mirrored ? -0.22 : 0.22]}
    >
      <planeGeometry args={[3.6, 2.1]} />
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
