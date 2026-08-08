import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";
import { focusRing } from "./styles";

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  /** Period-over-period movement. Direction is stated in text, not colour alone. */
  delta?: { value: string; direction: "up" | "down"; isGood?: boolean };
  hint?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * Single metric.
 *
 * Kept deliberately quiet: the number is the content, so it carries the
 * weight while the label and trend stay secondary.
 */
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  loading = false,
  href,
  onClick,
  className,
}: StatCardProps) {
  const interactive = Boolean(href || onClick);

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-fg-muted">{label}</p>
        {icon ? (
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[13px] text-fg-subtle"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="mt-2 h-6 w-20" />
      ) : (
        <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.025em] text-fg">
          {value}
        </p>
      )}

      {delta || hint ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
                (delta.isGood ?? delta.direction === "up")
                  ? "text-success"
                  : "text-danger",
              )}
            >
              {delta.direction === "up" ? (
                <FiArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
              ) : (
                <FiArrowDownRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
              )}
              {delta.value}
            </span>
          ) : null}
          {hint ? <span className="text-xs text-fg-subtle">{hint}</span> : null}
        </div>
      ) : null}
    </>
  );

  const classes = cn(
    "block rounded-xl border border-line bg-surface p-3 text-start",
    interactive &&
      cn(
        "transition-[border-color,background-color] duration-[120ms] ease-out hover:border-line-strong hover:bg-surface-2/50",
        focusRing,
      ),
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, "w-full")}>
        {body}
      </button>
    );
  }

  return <div className={classes}>{body}</div>;
}

/** Even grid for a row of metrics. */
export function StatGrid({
  children,
  className,
  columns = 4,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
