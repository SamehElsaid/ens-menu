/**
 * Capability tiering for the Prism — MOTION-BLUEPRINT.md §5.2.13, §5.2.14.
 *
 * The governing decision: WebGL is opt-in by demonstrated capability, never
 * opt-out by detected failure. Every unknown resolves downward. The buyers here
 * are venue owners on mid-tier Android over Egyptian mobile data, so a phone
 * that has not proved it can afford a canvas does not get one, and nothing is
 * lost when it doesn't — Tier D is the hero exactly as it ships without 3D.
 *
 * This module imports nothing. It is deliberately outside the `three` graph so
 * that a device which fails the gate pays zero kilobytes to find out.
 */

export type Tier = "A" | "B" | "C" | "D";

/** Set for the session once a device has proved itself slow, so it is not asked
 *  to prove it again on the next pageview. */
const DECLINED_KEY = "ens.prism.declined";

export type TierConfig = {
  /** Never uncapped `devicePixelRatio`: on a 3× phone that is 9× the pixels. */
  dpr: [number, number];
  /** drei `RoundedBox` smoothness. 4 → ~2,400 tris, 2 → ~600. */
  smoothness: number;
  /** `MeshTransmissionMaterial` costs a second render pass. Tier A only. */
  transmission: boolean;
  transmissionSamples: number;
  transmissionResolution: number;
  /** The additive shader plane where the dispersed light lands. */
  pool: boolean;
  poolIntensity: number;
  pointer: boolean;
  idle: boolean;
  /** GSAP is only loaded for the tiers that choreograph an entrance. */
  gsapEntrance: boolean;
  envResolution: number;
  /** 4 lightformers on desktop; the two that matter on mobile. */
  fullEnvironment: boolean;
  /** How much of the scroll map is wired up. */
  scrollTracks: "full" | "reduced" | "yaw";
  /** Mobile moves the pane out of the text column entirely. */
  composition: "centre" | "corner";
  /** Secondary glass fragments for layered depth. */
  shards: "full" | "reduced" | "none";
  /** Sparse additive light motes. Tier A only. */
  motes: boolean;
};

export const TIER_CONFIG: Record<Exclude<Tier, "D">, TierConfig> = {
  A: {
    dpr: [1, 1.5],
    smoothness: 4,
    transmission: true,
    transmissionSamples: 6,
    transmissionResolution: 256,
    pool: true,
    poolIntensity: 1,
    pointer: true,
    idle: true,
    gsapEntrance: true,
    envResolution: 128,
    fullEnvironment: true,
    scrollTracks: "full",
    composition: "centre",
    shards: "full",
    motes: true,
  },
  /* Not a smaller A: the material changes rather than its quality dropping, so
     the object still looks deliberate instead of looking like A having a bad
     time. No transmission means no second render pass at all. */
  B: {
    dpr: [1, 1],
    smoothness: 3,
    transmission: false,
    transmissionSamples: 0,
    transmissionResolution: 0,
    pool: true,
    poolIntensity: 0.6,
    pointer: false,
    idle: true,
    gsapEntrance: true,
    envResolution: 128,
    fullEnvironment: true,
    scrollTracks: "reduced",
    composition: "centre",
    shards: "reduced",
    motes: false,
  },
  /* Mobile is a different composition, not a smaller one. At 390px the hero is
     a single column, so a centred pane would sit behind body copy; this one is
     an edge-lit sliver in the upper corner, clear of the text. The light pool is
     dropped entirely — `.s-aurora` already does that job for free. */
  C: {
    dpr: [1, 1.25],
    smoothness: 2,
    transmission: false,
    transmissionSamples: 0,
    transmissionResolution: 0,
    pool: false,
    poolIntensity: 0,
    pointer: false,
    idle: false,
    gsapEntrance: false,
    envResolution: 64,
    fullEnvironment: false,
    scrollTracks: "yaw",
    composition: "corner",
    shards: "none",
    motes: false,
  },
};

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type CapableNavigator = Navigator & {
  deviceMemory?: number;
  connection?: NetworkInformation;
};

/**
 * Probe for WebGL2 with a throwaway context, then hand it straight back.
 *
 * Done before the chunk is requested, so a device without WebGL2 discovers that
 * at the cost of one canvas element rather than 200 KB of library. The context
 * is explicitly lost afterwards: leaving a live context parked on a detached
 * canvas is how a page ends up holding two of them.
 */
function hasWebgl2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function prismDeclined(): boolean {
  try {
    return window.sessionStorage.getItem(DECLINED_KEY) === "1";
  } catch {
    /* Private mode, or storage disabled. Not a reason to refuse the scene. */
    return false;
  }
}

export function markPrismDeclined(): void {
  try {
    window.sessionStorage.setItem(DECLINED_KEY, "1");
  } catch {
    /* Nothing to do: the flag is an optimisation, not a correctness guarantee. */
  }
}

/**
 * Decide which tier this device gets, before any 3D code is requested.
 *
 * Reduced motion is treated as a capability gate rather than a runtime branch,
 * which is the whole point: a visitor who has asked for less motion should not
 * download an animation library in order to then not animate it.
 */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "D";

  if (prismDeclined()) return "D";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "D";

  const nav = navigator as CapableNavigator;
  const connection = nav.connection;

  if (connection?.saveData) return "D";

  /* Only refuse on a *known* slow connection. An absent Network Information API
     (Safari, Firefox) must not be read as "slow" — that would put every iPhone
     on the static path for a reason that has nothing to do with the device. */
  const effectiveType = connection?.effectiveType;
  if (effectiveType && effectiveType !== "4g") return "D";

  const cores = nav.hardwareConcurrency ?? 0;
  if (cores > 0 && cores <= 4) return "D";

  /* `deviceMemory` is Chromium-only and coarse (0.25–8, capped). Absent means
     unknown, which is not the same as low. */
  const memory = nav.deviceMemory ?? 0;
  if (memory > 0 && memory < 4) return "D";

  if (!hasWebgl2()) return "D";

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const width = window.innerWidth;

  if (fine && width >= 1024) {
    /* Comfortably capable, or merely capable. `deviceMemory` reports 4 on a lot
       of low-end laptops that will run the transmission pass but not enjoy it. */
    return memory > 0 && memory < 8 ? "B" : "A";
  }

  /* Tablet, or a desktop-sized window without a fine pointer. */
  if (width >= 768) return "B";

  /* A phone. It has already passed cores, memory, connection and WebGL2 above;
     the remaining requirement is that it reported those numbers at all, because
     a phone that reports nothing has not demonstrated anything. */
  if (cores >= 6 && memory >= 4) return "C";

  return "D";
}
