/**
 * The scene's mutable state, deliberately outside React.
 *
 * Pointer position, scroll progress and the entrance timeline all write here;
 * `useFrame` reads here and mutates `Object3D` properties directly. Nothing in
 * this file ever triggers a render, which is what makes the budget of *zero*
 * React renders per frame achievable rather than aspirational: a 60 Hz pointer
 * move through `setState` would be 60 reconciliations a second for an effect
 * that is not even in the DOM.
 *
 * The only `setState` in the whole feature is the tier, which changes at most
 * twice in a session.
 */

export type PrismSignals = {
  /** Pointer position within the hero, normalised to -1…1. Rests at 0,0. */
  pointer: { x: number; y: number };
  /** 0 at the hero's resting position, 1 when its bottom edge reaches the top
   *  of the viewport. Written at most once per frame. */
  progress: number;
  /**
   * Owned exclusively by the entrance timeline.
   *
   * Kept separate from the scroll and pointer contributions rather than folded
   * into one target, because the frame loop adds all three: if GSAP wrote to the
   * same value the pointer damps toward, the two would fight for the first
   * second of the page's life.
   */
  entrance: {
    /** Extra yaw, in radians, decaying to 0 as the pane settles. */
    yaw: number;
    /** Extra pitch, in radians, decaying to 0. */
    pitch: number;
    /** Z offset, travelling from behind the frame to 0. */
    z: number;
    /** The light pool's master level, 0 → 1. */
    intensity: number;
  };
};

export function createSignals(settled: boolean): PrismSignals {
  return {
    pointer: { x: 0, y: 0 },
    progress: 0,
    /* A tier with no entrance timeline starts already settled, so the scene is
       correct on its first frame instead of waiting for a tween that will never
       run to put it there. */
    entrance: settled
      ? { yaw: 0, pitch: 0, z: 0, intensity: 1 }
      : { yaw: 0.52, pitch: 0.22, z: -1.85, intensity: 0 },
  };
}
