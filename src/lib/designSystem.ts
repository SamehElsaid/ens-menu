/**
 * ENSmenu public-site design system.
 *
 * Rules:
 * - Layout: `.container`, compact vertical rhythm, balanced whitespace
 * - Typography: display → section → body → caption hierarchy
 * - Visual: minimal SaaS, soft purple accents, subtle glow only
 * - Components: use `ds.*` tokens or `marketing/*` primitives — do not one-off styles
 * - AI branding: subtle badges/hints, smart-menu focus — not buzzword-heavy
 * - Mobile-first: center on small screens, `flow-*` / `text-start` on large
 * - RTL/LTR: logical properties (`start`/`end`, `text-start`) — never hardcode left/right per locale
 * - Sections: one idea per section, avoid card overload
 */

export const ds = {
  /** Section shells — pick one variant per section */
  section: {
    base: "relative overflow-visible",
    hero: "hero-section isolate bg-white pt-24 pb-10 sm:pt-28 sm:pb-12 dark:bg-[#0d1117] lg:pt-32 lg:pb-28",
    default: "bg-white py-8 sm:py-10 dark:bg-[#0d1117] lg:py-16",
    muted: "bg-slate-50/60 py-8 sm:py-10 dark:bg-slate-900/20 lg:py-16",
    footer:
      "site-footer relative border-t border-slate-200/40 bg-slate-50/50 text-slate-500 dark:border-slate-800/50 dark:bg-[#0a0a0c]/90 dark:text-slate-500",
  },

  /** Two-column section layout (copy + visual) */
  split: {
    row: "flex flex-col items-center gap-10 sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-16",
    content: "flow-stack w-full flex-1",
    visual: "flex w-full shrink-0 items-center justify-center self-center overflow-visible lg:w-auto",
  },

  /** Typography scale */
  type: {
    display:
      "font-bold leading-[1.12] tracking-tight text-slate-900 text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] dark:text-white",
    sectionTitle:
      "font-bold leading-tight tracking-tight text-slate-900 text-2xl sm:text-[1.75rem] lg:text-[2rem] dark:text-white",
    subtitle:
      "max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400",
    body: "text-[13px] leading-relaxed text-slate-500 dark:text-slate-400",
    caption: "text-xs font-medium text-slate-400 dark:text-slate-500",
    label:
      "text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500",
    accent:
      "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent rtl:bg-gradient-to-l dark:from-purple-400 dark:to-indigo-400",
  },

  /** Badges & pills */
  badge:
    "inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/80 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300",
  badgeDot: "h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500",
  pill: "rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400",
  pillRow: "flex flex-wrap justify-center gap-2 lg:justify-start",

  /** Buttons */
  btn: {
    base: "inline-flex items-center justify-center gap-2 transition-colors",
    primary:
      "rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-600/15 transition-all hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20 dark:bg-purple-500 dark:shadow-purple-500/10 dark:hover:bg-purple-600",
    secondary:
      "rounded-full border border-slate-200/90 bg-white/80 px-6 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-purple-200/80 hover:bg-purple-50/30 hover:text-purple-700 dark:border-slate-700/80 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:border-purple-500/30 dark:hover:text-purple-300",
    compact:
      "rounded-full bg-purple-600 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
    ghost:
      "rounded-full px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300",
    row: "flex flex-wrap items-center justify-center gap-3 lg:justify-start",
  },

  /** Cards & surfaces */
  card: {
    base: "rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950",
    shadow: "shadow-sm shadow-slate-200/40 dark:shadow-black/20",
    elevated:
      "shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:shadow-black/30",
    padding: "p-5 sm:p-6 lg:p-6",
    paddingMobile: "p-4 sm:p-5 md:p-6",
  },

  /** Links */
  link: {
    footer:
      "text-[13px] leading-snug text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300",
    nav: "text-[13px] font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300",
  },

  /** Subtle decorative glow (use sparingly — one per section max) */
  glow: "pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2.5rem] bg-purple-400/10 blur-3xl dark:bg-purple-600/15",

  /** Prose width caps */
  prose: {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  },

  /** Footer-specific compact spacing */
  footer: {
    inner: "container py-6 opacity-90 lg:py-7",
    grid: "grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.55fr_0.7fr] lg:items-start lg:gap-8",
    desc: "mt-3 max-w-[16rem] text-[13px] leading-relaxed text-slate-500 dark:text-slate-400",
    bar: "mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 text-start text-[12px] text-slate-400 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80 dark:text-slate-500",
  },
} as const;

export type DesignSystem = typeof ds;
