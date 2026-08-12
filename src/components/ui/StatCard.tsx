import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";
import { focusRing, text } from "./styles";

export type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  /** Period-over-period movement. Direction is stated in text and an icon,
   *  never in colour alone. */
  delta?: { value: string; direction: "up" | "down"; isGood?: boolean };
  hint?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  /** Marks this metric as the one being watched. */
  active?: boolean;
  className?: string;
};

/**
 * One number.
 *
 * The figure is the content, so it gets the display treatment: tabular and
 * roughly three times the size of its own label. The label is quiet sans above
 * it, which is the change from the previous direction — a row of four uppercase
 * mono captions competed with the four numbers they were captioning.
 *
 * The icon sits in a brand-tinted medallion. That is the whole purple budget
 * for a stat card: the figure itself stays `--fg`, because a wall of purple
 * numbers is exactly the "purple everywhere" failure the direction refuses.
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
  active = false,
  className,
}: StatCardProps) {
  const interactive = Boolean(href || onClick);
  const deltaIsGood = delta ? (delta.isGood ?? delta.direction === "up") : false;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={text.label}>{label}</p>
        {icon ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm text-brand-soft-fg"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p className="ui-figure mt-2 text-[28px] leading-none text-fg">
          {value}
        </p>
      )}

      {delta || hint ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                deltaIsGood
                  ? "bg-success-soft text-success-fg"
                  : "bg-danger-soft text-danger-fg",
              )}
            >
              {delta.direction === "up" ? (
                <FiArrowUpRight
                  className="size-3.5 rtl:-scale-x-100"
                  aria-hidden
                />
              ) : (
                <FiArrowDownRight
                  className="size-3.5 rtl:-scale-x-100"
                  aria-hidden
                />
              )}
              {delta.value}
            </span>
          ) : null}
          {hint ? (
            <span className="text-[11px] text-fg-subtle">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const classes = cn(
    "relative block rounded-xl border border-line bg-surface p-4 text-start shadow-xs",
    active && "border-brand-line bg-brand-soft/40",
    active &&
      "before:absolute before:inset-y-3 before:start-0 before:w-[3px] before:rounded-e-full before:bg-brand before:content-['']",
    interactive &&
      cn(
        "transition-[border-color,background-color,box-shadow] duration-(--dur-settle) ease-(--ease-settle) hover:border-line-strong hover:shadow-md",
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

/**
 * A row of metrics.
 *
 * `ruled` collapses the gaps and lets the cards share edges, so four metrics
 * read as one instrument panel rather than four separate objects. It is the
 * right form at the top of a work surface; the gapped form is for metrics
 * scattered through a longer page.
 */
export function StatGrid({
  children,
  className,
  columns = 4,
  ruled = false,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
  ruled?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid",
        ruled
          ? cn(
              // Negative margins on the children would fight the container, so
              // the shared edge is made with a gap the ground shows through:
              // a 1px gap over the line colour reads as a single hairline
              // between two panels, and reflows without leaving a double rule.
              "gap-px bg-line",
              "[&>*]:rounded-none [&>*]:border-0",
            )
          : "gap-2 sm:gap-3",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
        ruled && "overflow-hidden rounded-xl border border-line shadow-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}
