"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
/* Deep import, not the barrel. drei's index pulls in every component it ships,
   and the tree-shaken result still carried loaders this scene has no use for. */
import { Lightformer } from "@react-three/drei/core/Lightformer";
import {
  CubeCamera,
  HalfFloatType,
  Scene,
  WebGLCubeRenderTarget,
} from "three";
import type { TierConfig } from "./tiers";

/**
 * The light, baked once, from geometry rather than from a file.
 *
 * There is no `.hdr` and no `.exr` here, which is the load-bearing decision: the
 * lighting is four emissive rectangles rendered into a small cube target exactly
 * once, so the scene ships **zero** environment assets and makes zero requests.
 * After that first frame the whole lighting rig costs nothing per frame for the
 * rest of the scene's life.
 *
 * This is deliberately a hand-rolled version of what drei's `<Environment>` does
 * internally, and for one measured reason: `<Environment>` imports
 * `useEnvironment`, which statically imports `RGBELoader`, `EXRLoader` and
 * `@monogrid/gainmap-js`. None of those can ever execute in this scene — we pass
 * no `files` — but they were 44 KB gzipped of the 3D chunk, which put it over
 * budget on its own. The technique below is the same portal-and-cube-camera
 * approach, without the loaders.
 *
 * Shadow maps are the classic budget killer in a hero scene, and glass does not
 * need them: a transmissive object's read comes almost entirely from what it
 * reflects and refracts. So there are none, at any tier.
 */

/** Renders its children into an off-screen scene and hands the result to the
 *  real scene as `environment`. One frame of work, then static. */
function EnvironmentBake({
  resolution,
  children,
}: {
  resolution: number;
  children: React.ReactNode;
}) {
  const [virtualScene] = useState(() => new Scene());
  const baked = useRef(false);

  const target = useMemo(() => {
    const next = new WebGLCubeRenderTarget(resolution);
    /* Half float so intensities above 1 survive the bake. Clamped to 8-bit, the
       key light would flatten into white and the pane would lose its highlight
       rolloff entirely. */
    next.texture.type = HalfFloatType;
    return next;
  }, [resolution]);

  const camera = useMemo(() => new CubeCamera(0.1, 100, target), [target]);

  useFrame((state) => {
    if (baked.current) return;
    baked.current = true;
    camera.update(state.gl, virtualScene);
  });

  useEffect(() => {
    return () => {
      /* The cube target is the single largest allocation in this component and is
         not reachable by walking the real scene graph, so it is disposed here
         explicitly rather than left to the canvas teardown. */
      target.dispose();
    };
  }, [target]);

  return (
    <>
      {/* `attach` writes `scene.environment` and restores it on unmount, so the
          binding is declarative and cannot leak. */}
      <primitive object={target.texture} attach="environment" />
      {createPortal(children, virtualScene)}
    </>
  );
}

export function PrismEnvironment({
  config,
  mirrored,
  dark,
}: {
  config: TierConfig;
  mirrored: boolean;
  dark: boolean;
}) {
  /* Mirrored under RTL so the light keeps arriving from the same side as the
     layout's proof column rather than from the side the copy is on. */
  const direction = mirrored ? -1 : 1;

  return (
    <EnvironmentBake resolution={config.envResolution}>
      {/* The key. Gives the pane its clean top edge and the long specular streak
          that is most of its sense of material. Dimmed in dark mode, so the
          pane is a lit object in a dark room rather than a bright object pasted
          onto one. */}
      <Lightformer
        form="rect"
        intensity={dark ? 1.4 : 2.0}
        color="#ffffff"
        position={[0, 3.2, 1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[6, 2.2, 1]}
      />

      {/* Soft brand fill — kept gentle so the pane never picks up a dark purple
          face that reads as a shadow. */}
      <Lightformer
        form="rect"
        intensity={0.9}
        color={dark ? "#c4b5fd" : "#e9d5ff"}
        position={[direction * -3.2, 1.7, 1.4]}
        rotation={[0, direction * (Math.PI / 2.6), 0]}
        scale={[2.6, 4, 1]}
      />

      {config.fullEnvironment ? (
        <>
          <Lightformer
            form="rect"
            intensity={0.55}
            color={dark ? "#e9d5ff" : "#fce7f3"}
            position={[direction * 3.4, 2.2, 1]}
            rotation={[0, direction * (-Math.PI / 2.6), 0]}
            scale={[2, 3, 1]}
          />

          <Lightformer
            form="rect"
            intensity={0.55}
            color="#ffffff"
            position={[0, -2.6, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[5, 2, 1]}
          />
        </>
      ) : null}
    </EnvironmentBake>
  );
}
