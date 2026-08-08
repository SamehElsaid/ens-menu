import type { ReactNode } from "react";
import { FiAlertTriangle, FiSearch } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export type EmptyStateProps = {
  /** Names what is missing, in the product's own words. */
  title: ReactNode;
  /** Says what to do next. */
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  /** `sm` suits a panel; `md` suits a full page region. */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Shown when a collection has no rows. The dashed border marks the region as
 * a placeholder rather than a real surface.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-2/40 text-center",
        size === "sm" ? "gap-1.5 px-4 py-6" : "gap-2 px-5 py-10",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-surface-3 text-fg-subtle",
            size === "sm" ? "size-8 text-base" : "size-10 text-lg",
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <div className="max-w-sm">
        <p
          className={cn(
            "font-semibold tracking-[-0.011em] text-fg",
            size === "sm" ? "text-[13px]" : "text-sm",
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

/** Empty state for a search or filter that matched nothing. */
export function NoResultsState({
  title,
  description,
  onClear,
  clearLabel,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<FiSearch />}
      title={title}
      description={description}
      size="sm"
      className={className}
      action={
        onClear && clearLabel ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        ) : undefined
      }
    />
  );
}

/**
 * Failure state. Names the problem and offers the recovery, rather than
 * leaving a blank region behind a toast that has already disappeared.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-danger-line bg-danger-soft px-5 py-8 text-center",
        className,
      )}
    >
      <span
        className="flex size-9 items-center justify-center rounded-full bg-danger/10 text-lg text-danger"
        aria-hidden
      >
        <FiAlertTriangle />
      </span>
      <div className="max-w-sm">
        <p className="text-[13px] font-semibold text-danger-fg">{title}</p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-danger-fg/85">
            {description}
          </p>
        ) : null}
      </div>
      {onRetry && retryLabel ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
