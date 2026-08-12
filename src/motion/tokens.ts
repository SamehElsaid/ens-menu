/**
 * Spring table for any JS motion that needs one.
 *
 * Durations and easings live in CSS (`--dur-*`, `--ease-*`). Springs only exist
 * here because CSS cannot express them. Inline spring literals fail review —
 * import from this table.
 *
 * Values are critically damped or slightly under. No overshoot above ~2 %.
 */

export const spring = {
  /** Digit rolls, badge settles — snappy, no bounce. */
  snappy: { type: "spring" as const, stiffness: 480, damping: 36, mass: 0.8 },
  /** Shared indicators / tab pills. */
  indicator: { type: "spring" as const, stiffness: 380, damping: 30, mass: 0.9 },
  /** Pointer-follow (Magnetic, M8 parallax). Soft so it never fights the cursor. */
  pointer: { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.7 },
  /** Overlay pop / badge scale. */
  badge: { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.7 },
} as const;

export type SpringName = keyof typeof spring;
