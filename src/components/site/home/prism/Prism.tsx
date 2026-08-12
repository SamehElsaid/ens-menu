"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
/* Deep imports so the barrel — and the loaders it drags behind it — stay out of
   the chunk. See PrismEnvironment for the measurement that forced this. */
import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import { Color, FrontSide, MathUtils } from "three";
import type { BufferAttribute, Mesh } from "three";
import type { PrismSignals } from "./signals";
import type { TierConfig } from "./tiers";

/** Slim sheet — a thick edge is what reads as a hard black border. */
const SIZE: [number, number, number] = [0.78, 1.68, 0.045];

const WEDGE_DEGREES = 1.5;
/** Almost face-on so the side wall barely shows; that wall was the “explicit
 *  line” around the pane. */
const REST_YAW = 0.1;
const IDLE_PERIOD = 14;
const DAMP = 3.4;

const SCROLL_YAW_FULL = MathUtils.degToRad(32);
const SCROLL_YAW_MOBILE = MathUtils.degToRad(18);
const POINTER_YAW = MathUtils.degToRad(6);
const POINTER_PITCH = MathUtils.degToRad(4);
const IDLE_YAW = MathUtils.degToRad(1.2);

/**
 * One light pane of glass. Quiet on purpose.
 *
 * Earlier passes overlit it, over-thickened it, and pooled a purple blob under
 * it that read as a dirty shadow. This version is thinner, brighter, and lit
 * softly so the object feels like light, not like a card with a stain.
 */
export function Prism({
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
  const meshRef = useRef<Mesh>(null);
  const restYaw = mirrored ? -REST_YAW : REST_YAW;
  const direction = mirrored ? -1 : 1;

  const corner = config.composition === "corner";
  const basePosition = useMemo<[number, number, number]>(
    () =>
      corner
        ? [direction * 1.1, 1.0, 0]
        : [direction * 0.82, 0.08, -0.2],
    [corner, direction],
  );

  /* Flat page tone only. A textured wash inside the FBO was reading as muddy
     purple shadows inside the glass. */
  const transmissionBg = useMemo(
    () => new Color(dark ? "#1c1528" : "#faf9fc"),
    [dark],
  );

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
  }, [config.smoothness]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { pointer, progress, entrance } = signals.current;

    const scrollYaw =
      progress *
      (config.scrollTracks === "yaw" ? SCROLL_YAW_MOBILE : SCROLL_YAW_FULL);
    const scrollRise = config.scrollTracks === "full" ? progress * 0.35 : 0;

    const pointerYaw = config.pointer ? pointer.x * POINTER_YAW : 0;
    const pointerPitch = config.pointer ? -pointer.y * POINTER_PITCH : 0;

    const clock = state.clock.elapsedTime;
    const idleYaw = config.idle
      ? Math.sin((clock / IDLE_PERIOD) * Math.PI * 2) * IDLE_YAW
      : 0;
    const idleRise = config.idle
      ? Math.sin((clock / IDLE_PERIOD) * Math.PI * 1.8) * 0.015
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
      radius={0.07}
      smoothness={config.smoothness}
      position={basePosition}
      rotation={[0, restYaw, 0]}
      scale={corner ? 0.7 : 1}
    >
      {config.transmission ? (
        <MeshTransmissionMaterial
          color="#ffffff"
          background={transmissionBg}
          transmission={1}
          /* Thin + soft: thick glass draws a dark bevel that looks like a
             stroked border once it hits a transparent canvas. */
          thickness={0.14}
          ior={1.28}
          chromaticAberration={0.06}
          anisotropicBlur={0.35}
          roughness={0.22}
          metalness={0}
          distortion={0}
          distortionScale={0}
          temporalDistortion={0}
          samples={config.transmissionSamples}
          resolution={config.transmissionResolution}
          backside={false}
          clearcoat={0.35}
          clearcoatRoughness={0.35}
          attenuationColor="#ffffff"
          attenuationDistance={4}
          envMapIntensity={config.envMapIntensity}
          toneMapped={false}
        />
      ) : (
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.22}
          metalness={0}
          envMapIntensity={config.envMapIntensity}
          iridescence={0.35}
          iridescenceIOR={1.2}
          iridescenceThicknessRange={[220, 360]}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          transparent
          opacity={config.paneOpacity}
          depthWrite={false}
          side={FrontSide}
          toneMapped={false}
        />
      )}
    </RoundedBox>
  );
}
