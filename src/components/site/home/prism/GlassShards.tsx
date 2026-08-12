"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import type { Group, Mesh } from "three";
import type { PrismSignals } from "./signals";
import type { TierConfig } from "./tiers";

/**
 * Secondary glass fragments — depth around the main pane without a second
 * transmission pass. Iridescent physical materials only; Tier A / B.
 */

type ShardSpec = {
  position: [number, number, number];
  scale: [number, number, number];
  restRot: [number, number, number];
  phase: number;
  speed: number;
};

const SHARDS_A: ShardSpec[] = [
  {
    position: [-0.55, 0.72, -0.55],
    scale: [0.22, 0.38, 0.04],
    restRot: [0.35, -0.4, 0.2],
    phase: 0.2,
    speed: 0.55,
  },
  {
    position: [0.7, -0.55, -0.75],
    scale: [0.28, 0.18, 0.035],
    restRot: [-0.25, 0.55, -0.15],
    phase: 1.1,
    speed: 0.4,
  },
  {
    position: [0.15, 0.95, -1.1],
    scale: [0.14, 0.26, 0.03],
    restRot: [0.5, 0.2, -0.35],
    phase: 2.4,
    speed: 0.7,
  },
];

const SHARDS_B: ShardSpec[] = SHARDS_A.slice(0, 2);

export function GlassShards({
  signals,
  config,
  mirrored,
}: {
  signals: React.RefObject<PrismSignals>;
  config: TierConfig;
  mirrored: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const meshRefs = useRef<(Mesh | null)[]>([]);
  const direction = mirrored ? -1 : 1;
  const specs = config.shards === "full" ? SHARDS_A : SHARDS_B;

  const positions = useMemo(
    () =>
      specs.map((s) => {
        const [x, y, z] = s.position;
        return [x * direction, y, z] as [number, number, number];
      }),
    [specs, direction],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { pointer, progress, entrance } = signals.current;
    const t = state.clock.elapsedTime;

    /* Whole field drifts with pointer — subtle parallax, not orbit. */
    const px = config.pointer ? pointer.x * 0.08 : 0;
    const py = config.pointer ? -pointer.y * 0.05 : 0;
    group.position.x = MathUtils.damp(group.position.x, px, 3, delta);
    group.position.y = MathUtils.damp(group.position.y, py, 3, delta);
    group.position.z = MathUtils.lerp(0, 0.35, progress);

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const spec = specs[i];
      if (!spec) return;

      const idle = config.idle
        ? Math.sin(t * spec.speed + spec.phase) * 0.04
        : 0;
      const base = positions[i];
      mesh.position.y = base[1] + idle + entrance.z * 0.15;
      mesh.rotation.x = spec.restRot[0] + idle * 0.6;
      mesh.rotation.y =
        spec.restRot[1] * direction + progress * 0.35 * direction;
      mesh.rotation.z = spec.restRot[2];
      const enterScale = MathUtils.lerp(0.55, 1, entrance.intensity);
      mesh.scale.set(
        spec.scale[0] * enterScale,
        spec.scale[1] * enterScale,
        spec.scale[2] * enterScale,
      );
    });
  });

  return (
    <group ref={groupRef}>
      {specs.map((spec, i) => (
        <mesh
          key={i}
          ref={(node) => {
            meshRefs.current[i] = node;
          }}
          position={positions[i]}
          rotation={[
            spec.restRot[0],
            spec.restRot[1] * direction,
            spec.restRot[2],
          ]}
          scale={spec.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            roughness={0.06}
            metalness={0}
            envMapIntensity={1.2}
            iridescence={1}
            iridescenceIOR={1.25}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={0.78}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
