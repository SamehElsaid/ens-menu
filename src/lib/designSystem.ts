/**
 * ENSmenu public-site design system.
 *
 * These recipes now compose from the same semantic tokens as the in-product
 * primitives in `src/components/ui` (`surface`, `fg`, `line`, `brand`, …), so
 * the marketing site and the app resolve to one palette, one radius scale and
 * one focus treatment. Dark mode is inherited from the token layer rather than
 * re-declared per class.
 *
 * Rules:
 * - Layout: `.container`, compact vertical rhythm, balanced whitespace
 * - Typography: display → section → body → caption hierarchy
 * - Components: use `ds.*` tokens or `marketing/*` primitives — no one-off styles
 * - Mobile-first: center on small screens, `text-start` on large
 * - RTL/LTR: logical properties (`start`/`end`, `text-start`) — never hardcode
 *   left/right per locale
 * - Sections: one idea per section, avoid card overload
 */

/** Keyboard-only ring, identical to the one the product primitives use. */
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export const ds = {
  /** Section shells — pick one variant per section */
  section: {
    base: "relative overflow-visible",
    hero: "hero-section isolate bg-surface pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-28",
    default: "bg-surface py-8 sm:py-10 lg:py-16",
    muted: "bg-surface-2 py-8 sm:py-10 lg:py-16",
    footer: "site-footer relative border-t border-line bg-surface-2 text-fg-muted",
  },

  /** Two-column section layout (copy + visual) */
  split: {
    row: "flex flex-col items-center gap-10 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-16",
    content: "flow-stack w-full flex-1",
    visual:
      "flex w-full shrink-0 items-center justify-center self-center overflow-visible lg:w-auto",
  },

  /** Typography scale. Tracking tightens as size grows, the way real type does. */
  type: {
    display:
      "text-[2rem] font-bold leading-[1.12] tracking-[-0.024em] text-fg sm:text-[2.5rem] lg:text-[2.75rem]",
    sectionTitle:
      "text-2xl font-bold leading-tight tracking-[-0.02em] text-fg sm:text-[1.75rem] lg:text-[2rem]",
    subtitle: "max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg",
    body: "text-[13px] leading-relaxed text-fg-muted",
    caption: "text-xs font-medium text-fg-subtle",
    label: "text-[11px] font-semibold uppercase tracking-wide text-fg-subtle",
    /** Headline highlight. Solid brand reads sharper than a gradient and keeps
     *  contrast predictable in both themes. */
    accent: "text-brand",
  },

  /** Badges & pills */
  badge:
    "inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3.5 py-1 text-[11px] font-semibold tracking-wide text-brand-soft-fg",
  badgeDot: "size-1.5 shrink-0 rounded-full bg-brand",
  pill: "rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-fg-muted",
  pillRow: "flex flex-wrap justify-center gap-2 lg:justify-start",

  /** Buttons. Same geometry and states as the in-product `Button` primitive so
   *  the landing CTA and the first in-app action feel like one control. */
  btn: {
    base: `inline-flex items-center justify-center gap-2 transition-colors ${focus}`,
    primary: `h-11 rounded-lg bg-brand px-6 text-sm font-semibold text-on-brand shadow-xs transition-colors hover:bg-brand-hover active:bg-brand-active ${focus}`,
    secondary: `h-11 rounded-lg border border-line bg-surface px-6 text-sm font-medium text-fg transition-colors hover:bg-surface-2 ${focus}`,
    compact: `h-8 rounded-md bg-brand px-4 text-[12px] font-medium text-on-brand transition-colors hover:bg-brand-hover ${focus}`,
    ghost: `h-8 rounded-md px-3 text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg ${focus}`,
    row: "flex flex-wrap items-center justify-center gap-3 lg:justify-start",
  },

  /** Cards & surfaces. A card gets a hairline or a shadow — not a heavy pair. */
  card: {
    base: "rounded-2xl border border-line bg-surface",
    shadow: "shadow-sm",
    elevated: "shadow-lg",
    padding: "p-5 sm:p-6 lg:p-6",
    paddingMobile: "p-4 sm:p-5 md:p-6",
  },

  /** Links */
  link: {
    footer: `rounded-sm text-[13px] leading-snug text-fg-muted transition-colors hover:text-brand ${focus}`,
    nav: `rounded-sm text-[13px] font-medium text-fg-muted transition-colors hover:text-brand ${focus}`,
  },

  /** Subtle decorative glow (use sparingly — one per section max) */
  glow: "pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2.5rem] bg-brand-soft blur-3xl",

  /** Prose width caps */
  prose: {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  },

  /** Footer-specific compact spacing */
  footer: {
    inner: "container py-6 lg:py-7",
    grid: "grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.55fr_0.7fr] lg:items-start lg:gap-8",
    desc: "mt-3 max-w-64 text-[13px] leading-relaxed text-fg-muted",
    bar: "mt-6 flex flex-col gap-2 border-t border-line pt-5 text-start text-[12px] text-fg-subtle sm:flex-row sm:items-center sm:justify-between",
  },
} as const;

export type DesignSystem = typeof ds;
