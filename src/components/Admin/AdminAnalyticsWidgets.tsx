"use client";

import {
  Alert,
  Card,
  EmptyState,
  SectionHeader,
  StatCard,
  StatGrid,
} from "@/components/ui";
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
}: {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div dir={dir}>
      <StatGrid columns={columns}>
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

export function AdminRankedList({
  items,
  dir = "ltr",
  emptyMessage,
  onItemClick,
}: {
  items: AdminRankedListItem[];
  dir?: "rtl" | "ltr";
  emptyMessage?: string;
  onItemClick?: (item: AdminRankedListItem) => void;
}) {
  const max = items.length > 0 ? items[0].count : 1;

  if (items.length === 0) {
    return <EmptyState title={emptyMessage ?? "—"} size="sm" />;
  }

  return (
    <ul className="flex flex-col gap-3" dir={dir}>
      {items.map((item, index) => (
        <li key={item.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                lang="en"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-soft-fg"
              >
                {index + 1}
              </span>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-start text-sm font-medium text-brand hover:underline"
                >
                  {item.label}
                </a>
              ) : onItemClick ? (
                <button
                  type="button"
                  onClick={() => onItemClick(item)}
                  className="truncate text-start text-sm font-medium text-brand hover:underline"
                >
                  {item.label}
                </button>
              ) : (
                <span className="truncate text-sm font-medium text-fg">
                  {item.label}
                </span>
              )}
            </div>
            <span
              lang="en"
              className="shrink-0 text-sm font-semibold tabular-nums text-fg"
            >
              {item.count.toLocaleString("en-US")}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
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
    return <EmptyState title={emptyMessage ?? "—"} size="sm" />;
  }

  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="flex h-40 items-end gap-2 pt-2" dir={dir}>
      {points.map((point) => (
        <div
          key={point.date}
          className="flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <span
            lang="en"
            className="text-[10px] font-semibold tabular-nums text-fg-muted"
          >
            {point.count}
          </span>
          <div className="flex h-24 w-full items-end justify-center">
            <div
              className="w-full max-w-10 rounded-t-lg bg-brand transition-all duration-500"
              style={{
                height: `${Math.max(8, (point.count / max) * 100)}%`,
              }}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] leading-tight text-fg-subtle">
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
