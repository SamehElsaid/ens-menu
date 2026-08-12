"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
/* Deep imports so the barrel — and the loaders it drags behind it — stay out of
   the chunk. See PrismEnvironment for the measurement that forced this. */
import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import { MathUtils } from "three";
import type { BufferAttribute, Mesh } from "three";
import type { PrismSignals } from "./signals";
import type { TierConfig } from "./tiers";

/** The pane, in world units. Roughly a phone screen's proportion: it has to read
 *  as a pane of glass and as a screen before anything is on it. */
const SIZE: [number, number, number] = [0.9, 1.95, 0.14];

/** The wedge. Optically it is why a prism disperses at all; art-directionally it
 *  is why the refracted light separates into hue instead of staying white. */
const WEDGE_DEGREES = 3;

/** Radians of yaw the pane is turned off-axis at rest, so it is seen at a
 *  three-quarter angle rather than face-on. Mirrored under RTL. */
const REST_YAW = 0.28;

const IDLE_PERIOD = 11;

/** Damping rate. Low enough that the pane always feels like it has mass, high
 *  enough that it never feels like it is lagging the pointer. */
const DAMP = 3.4;

const SCROLL_YAW_FULL = MathUtils.degToRad(48);
const SCROLL_YAW_MOBILE = MathUtils.degToRad(24);
const POINTER_YAW = MathUtils.degToRad(10);
const POINTER_PITCH = MathUtils.degToRad(7);
const IDLE_YAW = MathUtils.degToRad(2.2);

/**
 * The subject: one wedge of glass, lit by one source.
 *
 * Not a phone, not a logo, not a device mock. A render of a phone would be less
 * honest than `PhoneMenu.tsx`, which shows the real interface; this is the
 * design language itself — light entering glass and dispersing — made physical.
 */
export function Prism({
  signals,
  config,
  mirrored,
}: {
  signals: React.RefObject<PrismSignals>;
  config: TierConfig;
  mirrored: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const restYaw = mirrored ? -REST_YAW : REST_YAW;
  const direction = mirrored ? -1 : 1;

  const corner = config.composition === "corner";
  const basePosition = useMemo<[number, number, number]>(
    /* Mobile is a different composition, not a smaller one: at 390px the hero is
       a single column, so the pane moves out of the text entirely and becomes an
       edge-lit sliver in the upper corner. */
    () =>
      corner
        ? [direction * 1.15, 1.05, 0]
        : [direction * 0.95, 0, 0],
    [corner, direction],
  );

  /**
   * Displace the box into a wedge, once, on mount.
   *
   * `z` is scaled by a function of `y`, so the faces are no longer parallel.
   * That cannot be expressed as a matrix — a shear would tilt both faces
   * equally and keep the thickness constant — so it is a one-pass attribute
   * write instead.
   *
   * Normals are deliberately *not* recomputed. drei creases them for the bevel,
   * and `computeVertexNormals` would smooth that away, turning a pane with crisp
   * edges into a pillow. Leaving them is a ≤3° error on a transmissive object,
   * which is invisible; losing the crease is not.
   */
  useLayoutEffect(() => {
    const geometry = meshRef.current?.geometry;
    if (!geometry) return;

    const position = geometry.attributes.position as BufferAttribute;
    const halfHeight = SIZE[1] / 2;
    const taper = Math.tan(MathUtils.degToRad(WEDGE_DEGREES)) * halfHeight * 3.6;

    for (let i = 0; i < position.count; i += 1) {
      const y = position.getY(i);
      const z = position.getZ(i);
      position.setZ(i, z * (1 + (y / halfHeight) * taper));
    }

    position.needsUpdate = true;
    geometry.computeBoundingSphere();

    if (process.env.NODE_ENV !== "production") {
      const triangles = geometry.index
        ? geometry.index.count / 3
        : position.count / 3;
      const budget = config.smoothness >= 4 ? 2400 : 600;
      if (triangles > budget) {
        console.warn(
          `[prism] pane is ${triangles} triangles, budget is ${budget}. ` +
            `Lower \`smoothness\` rather than raising the budget.`,
        );
      }
    }
  }, [config.smoothness]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { pointer, progress, entrance } = signals.current;

    /* Scroll turns the pane toward edge-on, so the glass thins and the refracted
       light narrows as you leave. */
    const scrollYaw =
      progress *
      (config.scrollTracks === "yaw" ? SCROLL_YAW_MOBILE : SCROLL_YAW_FULL);

    /* Drifting up slightly faster than the section scrolls reads as depth. */
    const scrollRise = config.scrollTracks === "full" ? progress * 0.45 : 0;

    const pointerYaw = config.pointer ? pointer.x * POINTER_YAW : 0;
    const pointerPitch = config.pointer ? -pointer.y * POINTER_PITCH : 0;

    /* Below the threshold at which anyone would call it movement, but above
       stillness — enough that the specular streak is always slowly travelling,
       which is the difference between glass and a picture of glass. */
    const clock = state.clock.elapsedTime;
    const idleYaw = config.idle
      ? Math.sin((clock / IDLE_PERIOD) * Math.PI * 2) * IDLE_YAW
      : 0;
    const idleRise = config.idle
      ? Math.sin((clock / IDLE_PERIOD) * Math.PI * 1.8) * 0.02
      : 0;

    const targetYaw =
      restYaw + entrance.yaw * direction + scrollYaw * direction + pointerYaw + idleYaw;
    const targetPitch = entrance.pitch + pointerPitch;

    mesh.rotation.y = MathUtils.damp(mesh.rotation.y, targetYaw, DAMP, delta);
    mesh.rotation.x = MathUtils.damp(mesh.rotation.x, targetPitch, DAMP, delta);
    mesh.position.y = basePosition[1] + scrollRise + idleRise;
    mesh.position.z = basePosition[2] + entrance.z;
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={SIZE}
      radius={0.045}
      smoothness={config.smoothness}
      position={basePosition}
      rotation={[0, restYaw, 0]}
      scale={corner ? 0.72 : 1}
    >
      {config.transmission ? (
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.72}
          ior={1.52}
          /* This is the dispersion. It splits the refracted light into hue at
             the material level, which is the entire prism read for a fraction of
             what spectral rendering would cost. */
          chromaticAberration={0.48}
          roughness={0.035}
          distortion={0.14}
          distortionScale={0.32}
          anisotropicBlur={0.14}
          /* The cost dial. 6 is where the refraction stops looking banded; past
             10 buys nothing visible at this object size. */
          samples={config.transmissionSamples}
          resolution={config.transmissionResolution}
          /* Backside would add a second full transmission pass. Not affordable,
             and on a pane this thin, not missed. */
          backside={false}
          toneMapped={false}
        />
      ) : (
        /* A different material, not a degraded one. Iridescence against the
           purple/magenta environment gives the hue separation without
           transmission's per-frame re-render of the scene. */
        <meshPhysicalMaterial
          roughness={0.05}
          metalness={0.05}
          envMapIntensity={1.65}
          iridescence={1}
          iridescenceIOR={1.28}
          clearcoat={1}
          clearcoatRoughness={0.06}
          transparent
          opacity={0.94}
          toneMapped={false}
        />
      )}
    </RoundedBox>
  );
}
