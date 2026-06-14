"use client";

import { useEffect, useRef, useState } from "react";
import { FiClock, FiHeart, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { cn } from "@/lib/cn";

export type TransformStat = {
  label: string;
  value: string;
  icon: "sales" | "errors" | "time" | "satisfaction" | "setup";
};

export type TransformFeaturedStat = {
  headlineBefore: string;
  headlineAfter: string;
  value: string;
  badge: string;
};

const ICONS = {
  sales: FiTrendingUp,
  errors: FiTarget,
  time: FiClock,
  satisfaction: FiHeart,
  setup: FiZap,
} as const;

const COMPACT_ORDER: TransformStat["icon"][] = [
  "satisfaction",
  "sales",
  "errors",
  "time",
];

type ParsedStat = {
  prefix: string;
  numeric: number;
  suffix: string;
  decimals: number;
};

function parseStatValue(raw: string): ParsedStat | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([+\-<≥]*)\s*(\d+(?:\.\d+)?)\s*(.*)$/u);
  if (!match) return null;

  const [, prefix = "", num = "0", rest = ""] = match;
  const numeric = Number(num);
  if (Number.isNaN(numeric)) return null;

  return {
    prefix,
    numeric,
    suffix: rest.trim(),
    decimals: num.includes(".") ? (num.split(".")[1]?.length ?? 0) : 0,
  };
}

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useAnimatedCounter(
  target: number,
  active: boolean,
  decimals = 0,
  duration = 1400,
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = target * eased;
      setValue(
        decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next),
      );

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, decimals, duration]);

  return value;
}

function AnimatedValue({
  raw,
  active,
  className,
  duration = 1200,
}: {
  raw: string;
  active: boolean;
  className?: string;
  duration?: number;
}) {
  const parsed = parseStatValue(raw);
  const count = useAnimatedCounter(
    parsed?.numeric ?? 0,
    active && parsed !== null,
    parsed?.decimals ?? 0,
    duration,
  );

  if (!parsed) {
    return (
      <span className={cn("font-black tabular-nums tracking-tight", className)}>
        {raw}
      </span>
    );
  }

  const display =
    parsed.decimals > 0 ? count.toFixed(parsed.decimals) : String(count);

  return (
    <span className={cn("font-black tabular-nums tracking-tight", className)}>
      {parsed.prefix}
      {display}
      {parsed.suffix ? (
        <span className="ms-0.5 text-[0.55em] font-bold">{parsed.suffix}</span>
      ) : null}
    </span>
  );
}

type TransformStatsProps = {
  stats: TransformStat[];
  featured: TransformFeaturedStat;
};

export default function TransformStats({ stats, featured }: TransformStatsProps) {
  const { ref, visible } = useReveal();
  const statMap = Object.fromEntries(stats.map((s) => [s.icon, s])) as Record<
    TransformStat["icon"],
    TransformStat
  >;
  const featuredCount = useAnimatedCounter(
    Number(featured.value) || 10,
    visible,
    0,
    1500,
  );

  return (
    <div
      ref={ref}
      className={cn(
        "transform-stats-metrics flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-12 lg:gap-3",
        visible && "transform-stats-metrics--visible",
      )}
    >
      {/* Featured — compact horizontal banner, CTA energy */}
      <article
        className={cn(
          "transform-stat-card transform-stat-featured group relative overflow-hidden rounded-xl border border-violet-200/50 p-3.5 sm:p-4 lg:col-span-5 lg:self-center",
          "bg-white/55 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_32px_-16px_rgba(124,58,237,0.25)] backdrop-blur-md",
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/60 hover:shadow-[0_12px_40px_-14px_rgba(124,58,237,0.35)]",
          "dark:border-violet-500/20 dark:bg-slate-900/45 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-16px_rgba(124,58,237,0.2)]",
        )}
        style={{ transitionDelay: "0ms" }}
      >
        <div
          className="transform-stat-featured-gradient pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
        />
        <div
          className="transform-stat-featured-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />

        <div className="relative flex items-center gap-3 sm:gap-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/90 text-white shadow-sm shadow-violet-600/25 transition-transform duration-500 group-hover:scale-105 dark:bg-violet-500/80">
            <FiZap size={16} strokeWidth={2.25} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <span className="mb-1 inline-flex items-center rounded-full border border-violet-200/60 bg-violet-50/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-violet-700 uppercase dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">
              {featured.badge}
            </span>

            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[15px] font-bold leading-tight text-slate-800 sm:text-base dark:text-slate-100">
              <span>{featured.headlineBefore}</span>
              <span className="transform-stat-featured-number text-[1.65rem] font-black tabular-nums tracking-tight sm:text-[1.85rem]">
                {featuredCount}
              </span>
              <span>{featured.headlineAfter}</span>
            </p>
          </div>

          <span
            className="hidden shrink-0 text-violet-400 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 sm:inline dark:text-violet-500"
            aria-hidden
          >
            →
          </span>
        </div>
      </article>

      {/* Compact metrics — 2×2 glass tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-7 lg:grid-cols-2 lg:gap-3">
        {COMPACT_ORDER.map((icon, index) => {
          const stat = statMap[icon];
          if (!stat) return null;

          const Icon = ICONS[icon];
          const isHighlight = icon === "satisfaction";

          return (
            <article
              key={icon}
              className={cn(
                "transform-stat-card group relative overflow-hidden rounded-xl border p-3 sm:p-3.5",
                "bg-white/50 backdrop-blur-md transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_rgba(124,58,237,0.22)]",
                isHighlight
                  ? "border-purple-200/55 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] hover:border-purple-300/60 dark:border-purple-500/25 dark:bg-purple-950/20"
                  : "border-slate-200/50 shadow-sm hover:border-slate-300/60 dark:border-slate-700/50 dark:bg-slate-900/40",
              )}
              style={{ transitionDelay: `${(index + 1) * 60}ms` }}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  isHighlight
                    ? "bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_70%)]"
                    : "bg-[radial-gradient(ellipse_at_top,rgba(100,116,139,0.08),transparent_70%)]",
                )}
                aria-hidden
              />

              <div className="relative flex items-start gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-transform duration-500 group-hover:scale-105",
                    isHighlight
                      ? "bg-purple-100/80 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
                      : "bg-slate-100/70 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400",
                  )}
                >
                  <Icon size={13} strokeWidth={2} aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <AnimatedValue
                    raw={stat.value}
                    active={visible}
                    duration={1100 + index * 80}
                    className={cn(
                      "block text-[1.65rem] leading-none sm:text-[1.85rem] lg:text-[2rem]",
                      isHighlight
                        ? "text-purple-600 dark:text-purple-300"
                        : "text-slate-800 dark:text-slate-100",
                    )}
                  />
                  <p className="mt-1 text-[11px] font-medium leading-snug text-slate-500 sm:text-xs dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
