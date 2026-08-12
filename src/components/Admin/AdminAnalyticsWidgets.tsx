"use client";

import {
  Alert,
  Card,
  EmptyState,
  SectionHeader,
  StatCard,
  StatGrid,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatChartDate } from "@/lib/fetchAdminAnalytics";

export type MetricItem = {
  id: string;
  label: string;
  value: string | number;
  /** Retained for call-site compatibility; metrics no longer carry a tint. */
  tone?:
    "amber" | "emerald" | "primary" | "sky" | "slate" | "orange" | "purple";
};

export function DemoDataBanner({
  message,
  dir = "ltr",
}: {
  message: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div dir={dir}>
      <Alert tone="warning">{message}</Alert>
    </div>
  );
}

export function AdminMetricsGrid({
  items,
  columns = 3,
  dir = "ltr",
  ruled = false,
}: {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
  dir?: "rtl" | "ltr";
  /** Collapses the gaps so the row reads as one instrument panel. */
  ruled?: boolean;
}) {
  return (
    <div dir={dir}>
      <StatGrid columns={columns} ruled={ruled}>
        {items.map((item) => (
          <StatCard
            key={item.id}
            label={item.label}
            value={<span lang="en">{item.value}</span>}
          />
        ))}
      </StatGrid>
    </div>
  );
}

export type AdminRankedListItem = {
  id: string | number;
  label: string;
  count: number;
  href?: string;
};

/**
 * A ranked ledger.
 *
 * Rank is a monospaced ticket number rather than a filled circle, and the rows
 * share edges instead of floating on gaps, so ten entries read as one printed
 * list. The bar is a hairline meter under the row — a secondary reading of the
 * same figure, not the row's main event; the number is.
 */
export function AdminRankedList({
  items,
  dir = "ltr",
  emptyMessage,
  onItemClick,
  formatCount,
}: {
  items: AdminRankedListItem[];
  dir?: "rtl" | "ltr";
  emptyMessage?: string;
  onItemClick?: (item: AdminRankedListItem) => void;
  formatCount?: (count: number) => string;
}) {
  const max = items.length > 0 ? Math.max(...items.map((i) => i.count), 1) : 1;

  if (items.length === 0) {
    return <EmptyState title={emptyMessage ?? "—"} size="sm" />;
  }

  return (
    <ul className="-mx-1" dir={dir}>
      {items.map((item, index) => {
        const label = item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-start text-sm text-brand hover:underline"
          >
            {item.label}
          </a>
        ) : onItemClick ? (
          <button
            type="button"
            onClick={() => onItemClick(item)}
            className="truncate text-start text-sm text-brand hover:underline"
          >
            {item.label}
          </button>
        ) : (
          <span className="truncate text-sm text-fg">{item.label}</span>
        );

        return (
          <li
            key={item.id}
            className="border-b border-line px-1 py-2 last:border-b-0"
          >
            <div className="flex items-baseline gap-2.5">
              <span
                lang="en"
                aria-hidden
                className="ui-label shrink-0 text-fg-subtle"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">{label}</span>
              <span
                lang="en"
                className="ui-figure shrink-0 text-[13px] text-fg"
              >
                {formatCount
                  ? formatCount(item.count)
                  : item.count.toLocaleString("en-US")}
              </span>
            </div>
            <div className="mt-1.5 h-px bg-line-strong/40" aria-hidden>
              <div
                className="h-px bg-brand"
                style={{ width: `${Math.max(2, (item.count / max) * 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const barTone = {
  brand: "bg-brand",
  accent: "bg-accent",
  success: "bg-success",
} as const;

/**
 * A column chart drawn on a baseline.
 *
 * The bars sit on a hairline rule with square tops, so the plot reads as a
 * measured chart rather than a row of lozenges, and the peak is called out in
 * the corner instead of forcing the reader to compare heights by eye. Only the
 * tallest column keeps its value label at rest — printing a number over every
 * column at 10px on a 90-day range is noise, so the rest surface on hover and
 * in the accessible table underneath.
 */
export function AdminBarChart({
  points,
  locale,
  dir = "ltr",
  emptyMessage,
  tone = "brand",
  formatValue,
  formatLabel,
  caption,
}: {
  points: { date: string; count: number }[];
  locale: string;
  dir?: "rtl" | "ltr";
  emptyMessage?: string;
  tone?: keyof typeof barTone;
  formatValue?: (value: number) => string;
  /** Overrides the default short-date x-axis label. */
  formatLabel?: (date: string) => string;
  caption?: string;
}) {
  if (points.length === 0) {
    return <EmptyState title={emptyMessage ?? "—"} size="sm" />;
  }

  const max = Math.max(...points.map((p) => p.count), 1);
  const fmt = (v: number) =>
    formatValue ? formatValue(v) : v.toLocaleString("en-US");
  const axis = (p: { date: string }) =>
    formatLabel ? formatLabel(p.date) : formatChartDate(p.date, locale);
  /* Past ~14 columns the axis labels collide, so they thin out to every other
     column and then every fourth. */
  const stride = points.length > 32 ? 4 : points.length > 14 ? 2 : 1;

  return (
    <figure className="m-0" dir={dir}>
      <div
        className="flex h-32 items-end gap-px border-b border-line-strong"
        role="presentation"
      >
        {points.map((point, i) => {
          const isPeak = point.count === max;
          return (
            <div
              key={point.date}
              className="group relative flex h-full min-w-0 flex-1 items-end justify-center"
              title={`${axis(point)} · ${fmt(point.count)}`}
            >
              <span
                className={cn(
                  "ui-figure absolute -top-0.5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-fg-muted",
                  isPeak
                    ? "opacity-100"
                    : "opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100",
                )}
                lang="en"
              >
                {fmt(point.count)}
              </span>
              <div
                className={cn(
                  "w-full max-w-8",
                  barTone[tone],
                  point.count === 0 && "bg-line-strong",
                )}
                style={{
                  height: `calc(${Math.max(1.5, (point.count / max) * 100)}% - 14px)`,
                }}
              />
              {i % stride === 0 ? (
                <span className="absolute -bottom-5 left-1/2 max-w-full -translate-x-1/2 truncate text-[10px] leading-tight text-fg-subtle">
                  {axis(point)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-6 flex items-baseline justify-between gap-3 text-[11px] text-fg-subtle">
        <span>{caption}</span>
        <span lang="en" className="ui-label">
          max {fmt(max)}
        </span>
      </figcaption>
    </figure>
  );
}

export function AdminMonthGrid({
  points,
  dir = "ltr",
  formatCount,
}: {
  points: { month: string; count: number }[];
  dir?: "rtl" | "ltr";
  formatCount?: (count: number) => string;
}) {
  if (points.length === 0) return null;

  return (
    <div dir={dir}>
      <StatGrid columns={3}>
        {points.map((item, index) => (
          <StatCard
            key={`${item.month}-${index}`}
            label={item.month}
            value={
              <span lang="en">
                {formatCount
                  ? formatCount(item.count)
                  : item.count.toLocaleString("en-US")}
              </span>
            }
          />
        ))}
      </StatGrid>
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
    <Card padded="lg" dir={dir}>
      <SectionHeader
        className="mb-4"
        title={
          icon ? (
            <span className="inline-flex items-center gap-2">
              <span className="shrink-0 text-fg-muted" aria-hidden>
                {icon}
              </span>
              {title}
            </span>
          ) : (
            title
          )
        }
        description={subtitle}
        actions={action}
      />
      {children}
    </Card>
  );
}
