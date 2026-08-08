/**
 * Shared class recipes for the UI primitives.
 *
 * Every primitive composes from here so a change to focus, elevation or
 * control geometry lands everywhere at once. Components should import these
 * rather than re-typing surface/border/text strings.
 */

/** Keyboard-only ring. Pointer clicks stay clean. */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Ring drawn inside the element — for controls flush against a container edge. */
export const focusRingInset =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

/** Elevation is declared once: a hairline OR a shadow, never a heavy pair. */
export const surface = "bg-surface border border-line";
export const surfaceRaised = "bg-raised border border-line shadow-lg";
export const surfaceSunken = "bg-surface-2";

/**
 * Control heights. Shared by buttons, inputs, selects and triggers so a row of
 * mixed controls always lines up.
 *
 * Every size steps down at `sm`: the compact desktop geometry would put a 32px
 * tap target under a thumb on a phone, which is below the 44px guidance, so
 * the small end of the range is the mobile size and the compact one is applied
 * from the first breakpoint up.
 */
export const controlHeight = {
  xs: "h-7 sm:h-6",
  sm: "h-8 sm:h-7",
  md: "h-9 sm:h-8",
  lg: "h-11 sm:h-9",
} as const;

/** Matching min-widths for icon-only controls, so they stay square. */
export const controlSquare = {
  xs: "w-7 sm:w-6",
  sm: "w-8 sm:w-7",
  md: "w-9 sm:w-8",
  lg: "w-11 sm:w-9",
} as const;

/** Inline padding that keeps optical spacing even as the height steps down. */
export const controlPadding = {
  xs: "px-1.5",
  sm: "px-2",
  md: "px-2.5",
  lg: "px-3",
} as const;

export const controlText = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
} as const;

export const controlRadius = {
  xs: "rounded-md",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-lg",
} as const;

export type ControlSize = keyof typeof controlHeight;

/** Text roles. Secondary text is tinted from the foreground hue, never flat grey. */
export const text = {
  heading: "text-fg font-semibold tracking-[-0.012em]",
  body: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
  /** Section eyebrows and table headers. */
  label:
    "text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle",
} as const;

/**
 * One transition for the whole product. Colour and border settle in 120ms;
 * anything slower reads as lag on a screen someone uses all day.
 */
export const settle =
  "transition-[color,background-color,border-color,box-shadow,opacity] duration-[120ms] ease-out";

/** Status → token map, reused by Badge, Alert, Toast and status pills. */
export const statusTone = {
  neutral: {
    solid: "bg-surface-3 text-fg",
    soft: "bg-surface-2 text-fg-muted border-line",
    fg: "text-fg-muted",
    dot: "bg-fg-subtle",
  },
  brand: {
    solid: "bg-brand text-on-brand",
    soft: "bg-brand-soft text-brand-soft-fg border-brand-line",
    fg: "text-brand",
    dot: "bg-brand",
  },
  success: {
    solid: "bg-success text-white",
    soft: "bg-success-soft text-success-fg border-success-line",
    fg: "text-success",
    dot: "bg-success",
  },
  warning: {
    solid: "bg-warning text-white",
    soft: "bg-warning-soft text-warning-fg border-warning-line",
    fg: "text-warning",
    dot: "bg-warning",
  },
  danger: {
    solid: "bg-danger text-white",
    soft: "bg-danger-soft text-danger-fg border-danger-line",
    fg: "text-danger",
    dot: "bg-danger",
  },
  info: {
    solid: "bg-info text-white",
    soft: "bg-info-soft text-info-fg border-info-line",
    fg: "text-info",
    dot: "bg-info",
  },
} as const;

export type StatusTone = keyof typeof statusTone;
