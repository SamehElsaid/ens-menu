/**
 * Shared class recipes for the UI primitives.
 *
 * Every primitive composes from here so a change to focus, elevation or control
 * geometry lands everywhere at once. Components should import these rather than
 * re-typing surface/border/text strings.
 *
 * The vocabulary follows DESIGN.md: one light source spent on actions and
 * state, soft layered elevation carrying the grouping, and sans labels that
 * introduce data instead of competing with it.
 */

/** Keyboard-only ring, brand. Pointer clicks stay clean. */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Ring drawn inside the element — for controls flush against a container edge. */
export const focusRingInset =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

/**
 * The field focus treatment — DESIGN.md §10.
 *
 * A brand border plus a soft brand halo, applied on real `:focus` rather than
 * `:focus-visible`, because a text control that gives no signal when clicked
 * into feels broken. Icon buttons and links use `focusRing` instead.
 */
export const focusField =
  "focus:border-brand focus:shadow-[0_0_0_3px_var(--ring-soft)] focus:outline-none";

/**
 * Surfaces.
 *
 * Elevation is a real ladder again and it is what communicates grouping: a
 * resting card sits on `shadow-xs`, a menu on `shadow-lg`, a modal on
 * `shadow-2xl`. The rule is still there, but as an edge rather than as the
 * whole structure.
 */
export const surface = "bg-surface border border-line shadow-xs";
export const surfaceFlat = "bg-surface border border-line";
export const surfaceRaised = "bg-raised border border-line shadow-lg";
export const surfaceSunken = "bg-surface-2";

/** A divider. Logical, so it flips with direction. */
export const rule = "border-line";
export const ruleY = "border-y border-line";
export const ruleTop = "border-t border-line";
export const ruleBottom = "border-b border-line";

/**
 * A row that responds to the pointer without moving.
 *
 * Dense collections use this rather than the lift: rows that travel under the
 * cursor make a list of forty feel unstable and are harder to click.
 */
export const interactive = "hover:bg-surface-2 active:bg-surface-3";

/**
 * A tile that lifts. Entity cards and anything the pointer is meant to treat
 * as a single object. Falls back to elevation alone under reduced motion,
 * which `surface-lift` handles in `globals.css`.
 */
export const liftable = "surface-lift hover:border-line-strong";

/**
 * Control heights. Shared by buttons, inputs, selects and triggers so a row of
 * mixed controls always lines up.
 *
 * Every size steps down at `sm`: the compact desktop geometry would put a 32px
 * tap target under a thumb on a phone, which is below the 44px guidance, so
 * the large end of the range is the mobile size and the compact one is applied
 * from the first breakpoint up.
 */
export const controlHeight = {
  xs: "h-8 sm:h-7",
  sm: "h-9 sm:h-8",
  md: "h-10 sm:h-9",
  lg: "h-11 sm:h-10",
} as const;

/** Matching min-widths for icon-only controls, so they stay square. */
export const controlSquare = {
  xs: "w-8 sm:w-7",
  sm: "w-9 sm:w-8",
  md: "w-10 sm:w-9",
  lg: "w-11 sm:w-10",
} as const;

/** Inline padding that keeps optical spacing even as the height steps down. */
export const controlPadding = {
  xs: "px-2",
  sm: "px-2.5",
  md: "px-3.5",
  lg: "px-4",
} as const;

export const controlText = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
} as const;

/** Soft, not square and not a pillow. */
export const controlRadius = {
  xs: "rounded-md",
  sm: "rounded-lg",
  md: "rounded-lg",
  lg: "rounded-lg",
} as const;

export type ControlSize = keyof typeof controlHeight;

/**
 * Text roles.
 *
 * `label` is sans and sentence case — under the previous direction it was
 * uppercase tracked monospace, which is what made every screen read as a ticket
 * rail. `figure` is the only surviving use of the mono face, and it exists so
 * digits in a column do not jitter. Both stay classes rather than utility
 * strings so the Arabic exception lives in one place in `globals.css`.
 */
export const text = {
  heading: "text-fg font-semibold tracking-[-0.02em]",
  body: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
  /** Section labels, table headers, stat captions. */
  label: "ui-label",
  /** A label that carries the brand. One per section. */
  eyebrow: "ui-eyebrow",
  /** A number that is the point of its own row. */
  figure: "ui-figure text-fg",
} as const;

/**
 * One transition for the whole product. 150ms: fast enough not to read as lag
 * on a screen someone uses all day, slow enough to be seen.
 */
export const settle =
  "transition-[color,background-color,border-color,box-shadow,opacity] duration-(--dur-settle) ease-(--ease-settle)";

/**
 * Status → token map, reused by Badge, Alert, Toast and status pills.
 *
 * `brand` and `accent` are the same hue at two intensities: the action and the
 * highlight read as one light source rather than as two ideas. `info` is the
 * closest family to the brand at 49° of hue separation, which is why every
 * consumer of this map also renders a dot or an icon — status is never
 * signalled by hue alone.
 */
export const statusTone = {
  neutral: {
    solid: "bg-surface-3 text-fg",
    soft: "bg-surface-2 text-fg-muted border-line",
    fg: "text-fg-muted",
    dot: "bg-fg-subtle",
  },
  /** The action: a primary button, a selected option, a count badge. */
  brand: {
    solid: "bg-brand text-on-brand",
    soft: "bg-brand-soft text-brand-soft-fg border-brand-line",
    fg: "text-brand",
    dot: "bg-brand",
  },
  /** The highlight: live, selected, publishing, featured. */
  accent: {
    solid: "bg-accent text-on-accent",
    soft: "bg-accent-soft text-brand-soft-fg border-accent-line",
    fg: "text-accent",
    dot: "bg-accent",
  },
  /* `text-on-status` rather than `text-white`: the status fills are dark in the
     light theme and light in the dark theme, so a fixed white label is only
     readable in one of them. */
  success: {
    solid: "bg-success text-on-status",
    soft: "bg-success-soft text-success-fg border-success-line",
    fg: "text-success",
    dot: "bg-success",
  },
  warning: {
    solid: "bg-warning text-on-status",
    soft: "bg-warning-soft text-warning-fg border-warning-line",
    fg: "text-warning",
    dot: "bg-warning",
  },
  danger: {
    solid: "bg-danger text-on-status",
    soft: "bg-danger-soft text-danger-fg border-danger-line",
    fg: "text-danger",
    dot: "bg-danger",
  },
  info: {
    solid: "bg-info text-on-status",
    soft: "bg-info-soft text-info-fg border-info-line",
    fg: "text-info",
    dot: "bg-info",
  },
} as const;

export type StatusTone = keyof typeof statusTone;
