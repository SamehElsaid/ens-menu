"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei/core/PerformanceMonitor";
import { MathUtils } from "three";
import type { Mesh } from "three";
import { Prism } from "./Prism";
import { LightPool } from "./LightPool";
import { GlassShards } from "./GlassShards";
import { LightMotes } from "./LightMotes";
import { PrismEnvironment } from "./PrismEnvironment";
import type { PrismSignals } from "./signals";
import type { TierConfig } from "./tiers";

/**
 * The only file that mounts a `<Canvas>`.
 *
 * Everything expensive about a hero canvas is a decision made here: no shadows,
 * no post-processing, no antialiasing, a capped DPR, and a frame loop that stops
 * dead the moment nobody is looking at it.
 */

const CAMERA_Z_REST = 5.35;
const CAMERA_Z_EXIT = 6.35;
const CAMERA_Y_REST = 0.05;
const CAMERA_Y_EXIT = 0.22;

/**
 * Scroll dolly + lift only. Pointer never moves the camera — that swims the
 * WebGL frame against the DOM and reads as nausea. Objects track the pointer;
 * the frame stays photographed.
 */
function CameraRig({ signals }: { signals: React.RefObject<PrismSignals> }) {
  useFrame((state) => {
    const p = signals.current.progress;
    const entrance = signals.current.entrance.intensity;
    /* Soft push-in as the glass arrives, then a slow pull-back on scroll. */
    const enterZ = MathUtils.lerp(5.85, CAMERA_Z_REST, entrance);
    state.camera.position.z = MathUtils.lerp(enterZ, CAMERA_Z_EXIT, p);
    state.camera.position.y = MathUtils.lerp(CAMERA_Y_REST, CAMERA_Y_EXIT, p);
  });

  return null;
}

/**
 * Explicit teardown.
 *
 * `<Canvas>`'s own unmount handling is not sufficient here: the transmission
 * material keeps an internal framebuffer, and the environment keeps a cube
 * target, neither of which is reached by walking the scene graph. Forcing
 * context loss is the only thing that reliably hands *all* of it back — a
 * disposed renderer whose context is merely parked still holds GPU memory, and
 * on a route the user visits repeatedly that accumulates.
 *
 * Context loss is never restored. A device that just lost a context is a device
 * about to lose another one, so the correct response is to leave for good.
 */
function SceneTeardown({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const canvas = gl.domElement;

    /* Deliberately no `preventDefault()`: that is what asks the browser for a
       restore, and a restore is exactly what must not happen. */
    const handleContextLost = () => onContextLost();
    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);

      scene.traverse((object) => {
        const mesh = object as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else {
          material?.dispose();
        }
      });
      scene.clear();

      try {
        gl.dispose();
        gl.forceContextLoss();
      } catch {
        /* A context that has already gone is the outcome we wanted anyway. */
      }
    };
  }, [gl, scene, onContextLost]);

  return null;
}

export function PrismCanvas({
  signals,
  config,
  mirrored,
  dark,
  active,
  onDecline,
  onContextLost,
}: {
  signals: React.RefObject<PrismSignals>;
  config: TierConfig;
  mirrored: boolean;
  dark: boolean;
  /** False while the hero is off-screen or the tab is hidden. */
  active: boolean;
  onDecline: () => void;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      /* Not a prop change per frame: this flips only when the hero crosses out
         of view or the tab is backgrounded, so it costs a handful of renders per
         session and buys every frame that would otherwise be wasted. */
      frameloop={active ? "always" : "never"}
      dpr={config.dpr}
      shadows={false}
      /* No tone mapping. The dispersion is tuned to the brand's own ramp, and
         ACES would quietly shift those two hues toward something else. */
      flat
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
      }}
      camera={{
        /* A long lens. Wide-angle distortion on a glass pane dramatises the
           object and reads cheap; 32° reads photographed, and keeps the pane's
           edges near-parallel so it stays legible as glass. */
        fov: 32,
        position: [mirrored ? -0.55 : 0.55, 0.05, CAMERA_Z_REST],
      }}
      /* The scene has no click target, no drag, no orbit and nothing focusable.
         Nothing in it carries an `onPointer*` handler, and the container above
         it is `pointer-events: none`, so no event ever reaches it to raycast. */
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        {/* Keyed on the theme: the environment is baked exactly once, so a theme
            change has to rebuild it rather than wait for a re-bake that
            `frames={1}` will never schedule. */}
        <PrismEnvironment
          key={dark ? "dark" : "light"}
          config={config}
          mirrored={mirrored}
          dark={dark}
        />
        <ambientLight intensity={dark ? 0.18 : 0.28} />
        <directionalLight
          position={[mirrored ? 3 : -3, 4, 3]}
          intensity={0.55}
          castShadow={false}
          color="#f5e9ff"
        />
        <directionalLight
          position={[mirrored ? -2.2 : 2.2, 1.2, 2]}
          intensity={0.28}
          castShadow={false}
          color="#ffd6f5"
        />
        <pointLight
          position={[mirrored ? -0.4 : 0.4, 0.6, 1.4]}
          intensity={0.45}
          distance={4}
          decay={2}
          color="#d8b4fe"
        />
        <Prism signals={signals} config={config} mirrored={mirrored} />
        {config.shards !== "none" ? (
          <GlassShards
            signals={signals}
            config={config}
            mirrored={mirrored}
          />
        ) : null}
        {config.motes ? (
          <LightMotes signals={signals} mirrored={mirrored} dark={dark} />
        ) : null}
        {config.pool ? (
          <LightPool
            signals={signals}
            config={config}
            mirrored={mirrored}
            dark={dark}
          />
        ) : null}
      </Suspense>

      <CameraRig signals={signals} />
      <SceneTeardown onContextLost={onContextLost} />
      <PerformanceMonitor onDecline={onDecline} />
    </Canvas>
  );
}

export default PrismCanvas;
