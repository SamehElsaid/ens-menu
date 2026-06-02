"use client";

import CardDashBoard from "@/components/Card/CardDashBoard";
import { formatChartDate } from "@/lib/fetchAdminAnalytics";

export type MetricItem = {
  id: string;
  label: string;
  value: string | number;
  tone?: "amber" | "emerald" | "primary" | "sky" | "slate" | "orange" | "purple";
};

const toneClasses: Record<NonNullable<MetricItem["tone"]>, string> = {
  amber:
    "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20",
  emerald:
    "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20",
  primary:
    "bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20",
  sky: "bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/10 dark:border-sky-500/20",
  slate:
    "bg-slate-500/5 dark:bg-slate-500/10 border-slate-200 dark:border-slate-600",
  orange:
    "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/10 dark:border-orange-500/20",
  purple:
    "bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/10 dark:border-purple-500/20",
};

export function DemoDataBanner({
  message,
  dir = "ltr",
}: {
  message: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div
      dir={dir}
      className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
      role="status"
    >
      {message}
    </div>
  );
}

export function AdminMetricsGrid({
  items,
  columns = 3,
  dir = "ltr",
}: {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
  dir?: "rtl" | "ltr";
}) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={`grid gap-3 ${colClass}`} dir={dir}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-xl border p-4 ${toneClasses[item.tone ?? "slate"]}`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {item.label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminRankedList({
  items,
  dir = "ltr",
  emptyMessage,
}: {
  items: { id: string | number; label: string; count: number }[];
  dir?: "rtl" | "ltr";
  emptyMessage?: string;
}) {
  const isRTL = dir === "rtl";
  const max = items.length > 0 ? items[0].count : 1;

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
        {emptyMessage ?? "—"}
      </p>
    );
  }

  return (
    <ul className="space-y-3" dir={dir}>
      {items.map((item, index) => (
        <li key={item.id}>
          <div
            className={`flex items-center justify-between gap-3 mb-1.5 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center gap-2 min-w-0 flex-1 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-bold text-primary tabular-nums shrink-0">
              {item.count.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.max(8, (item.count / max) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminBarChart({
  points,
  locale,
  dir = "ltr",
  emptyMessage,
}: {
  points: { date: string; count: number }[];
  locale: string;
  dir?: "rtl" | "ltr";
  emptyMessage?: string;
}) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">
        {emptyMessage ?? "—"}
      </p>
    );
  }

  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="flex items-end gap-2 h-40 pt-2" dir={dir}>
      {points.map((point) => (
        <div
          key={point.date}
          className="flex flex-1 flex-col items-center gap-2 min-w-0"
        >
          <span className="text-[10px] font-semibold text-primary tabular-nums">
            {point.count}
          </span>
          <div className="w-full flex items-end justify-center h-24">
            <div
              className="w-full max-w-[2.5rem] rounded-t-lg bg-primary/80 dark:bg-primary transition-all duration-500"
              style={{
                height: `${Math.max(8, (point.count / max) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight truncate w-full">
            {formatChartDate(point.date, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AdminMonthGrid({
  points,
  dir = "ltr",
}: {
  points: { month: string; count: number }[];
  dir?: "rtl" | "ltr";
}) {
  if (points.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3`} dir={dir}>
      {points.map((item, index) => (
        <div
          key={`${item.month}-${index}`}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {item.month}
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {item.count.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminSectionCard({
  title,
  subtitle,
  icon,
  children,
  dir = "ltr",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  dir?: "rtl" | "ltr";
  action?: React.ReactNode;
}) {
  return (
    <CardDashBoard className="p-6">
      <div
        className={`flex items-start justify-between gap-4 mb-4 ${dir === "rtl" ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-2 ${dir === "rtl" ? "flex-row-reverse" : ""}`}
        >
          {icon}
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </CardDashBoard>
  );
}
