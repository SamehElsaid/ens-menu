"use client";

import type { ReactNode } from "react";
import { IoCheckmarkCircleOutline, IoChevronForward } from "react-icons/io5";
import LinkTo from "../Global/LinkTo";
import { cn } from "@/lib/cn";
import { Card, CardHeader, Skeleton, focusRing } from "@/components/ui";

export type AttentionTone = "danger" | "warning" | "info";

export type AttentionItem = {
  id: string;
  label: string;
  /** Rendered as-is, so a count and a currency total can share the component. */
  value: number;
  href: string;
  tone: AttentionTone;
  hint?: string;
  icon?: ReactNode;
};

const toneRing: Record<AttentionTone, string> = {
  danger: "bg-danger-soft text-danger-fg",
  warning: "bg-warning-soft text-warning-fg",
  info: "bg-info-soft text-info-fg",
};

const severity: Record<AttentionTone, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

/**
 * The queue of things needing a person — CONSOLE-REDESIGN.md §7.
 *
 * Both dashboard roots were walls of metrics: true statements that answered no
 * question. An operator opens a dashboard to find out what they have to deal
 * with today, and that is a list, not a grid of totals.
 *
 * Rows with a count of zero are dropped rather than shown as "0", because a
 * queue of nothing to do should be short. When everything is clear the card says
 * so outright — an empty list would read as a component that failed to load.
 */
export function AttentionQueue({
  title,
  description,
  items,
  loading = false,
  allClearTitle,
  allClearHint,
  className,
}: {
  title: string;
  description?: string;
  items: AttentionItem[];
  loading?: boolean;
  allClearTitle: string;
  allClearHint?: string;
  className?: string;
}) {
  const live = items
    .filter((item) => item.value > 0)
    .sort((a, b) => severity[a.tone] - severity[b.tone] || b.value - a.value);

  return (
    <Card padded="none" className={cn("overflow-hidden", className)}>
      <div className="px-3.5 pt-3.5 sm:px-4 sm:pt-4">
        <CardHeader title={title} description={description} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 p-3.5 sm:p-4">
          <Skeleton className="h-11" rounded="lg" />
          <Skeleton className="h-11" rounded="lg" />
          <Skeleton className="h-11" rounded="lg" />
        </div>
      ) : live.length === 0 ? (
        <div className="flex items-start gap-3 p-3.5 sm:p-4">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success-fg"
          >
            <IoCheckmarkCircleOutline className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">
              {allClearTitle}
            </p>
            {allClearHint ? (
              <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
                {allClearHint}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col border-t border-line">
          {live.map((item) => (
            <li key={item.id} className="border-b border-line last:border-b-0">
              <LinkTo
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 row-settle hover:bg-surface-2 sm:px-4",
                  focusRing,
                )}
              >
                {/* The count leads. It is the reason the row exists, and putting
                    it first means the column of figures can be scanned without
                    reading any of the labels. */}
                <span
                  className={cn(
                    "flex h-7 min-w-8 shrink-0 items-center justify-center rounded-lg px-1.5 font-mono text-[13px] font-semibold tabular-nums",
                    toneRing[item.tone],
                  )}
                >
                  {item.value > 999 ? "999+" : item.value}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-fg">
                    {item.label}
                  </span>
                  {item.hint ? (
                    <span className="block truncate text-xs text-fg-subtle">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
                <IoChevronForward
                  className="size-3.5 shrink-0 text-fg-subtle rtl:rotate-180"
                  aria-hidden
                />
              </LinkTo>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default AttentionQueue;
