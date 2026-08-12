"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { focusRing } from "./styles";

/** Windowed page list with ellipses, so long ranges stay one row. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "gap", total];
  if (current >= total - 3)
    return [1, "gap", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "gap", current - 1, current, current + 1, "gap", total];
}

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: {
    /** Names the paginated collection, e.g. "Orders pagination". */
    region: string;
    previous: string;
    next: string;
    page: (n: number) => string;
  };
  /** Optional "Showing 1–20 of 240" summary. */
  summary?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Page navigation.
 *
 * Chevrons use logical icons flipped by direction, so "next" always points
 * forward in reading order.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  labels,
  summary,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label={labels.region}
      className={cn(
        "flex flex-col-reverse items-center justify-between gap-3 sm:flex-row",
        className,
      )}
    >
      {summary ? (
        <p className="text-xs text-fg-muted" aria-live="polite">
          {summary}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={labels.previous}
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FiChevronLeft className="size-4 rtl:rotate-180" />
        </Button>

        {pages.map((entry, index) =>
          entry === "gap" ? (
            <span
              key={`gap-${index}`}
              className="px-1 text-sm text-fg-subtle"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(entry)}
              aria-label={labels.page(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[13px] font-medium tabular-nums row-settle sm:h-8 sm:min-w-8",
                focusRing,
                entry === page
                  ? "bg-brand font-semibold text-on-brand shadow-brand"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              {entry}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={labels.next}
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <FiChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  );
}
