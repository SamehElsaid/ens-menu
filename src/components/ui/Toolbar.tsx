"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Input } from "./Input";

/**
 * Search box with a clear affordance.
 *
 * Debounces so a list does not refetch on every keystroke, while the field
 * itself stays fully controlled and responsive.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  clearLabel = "Clear search",
  debounceMs = 300,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accessible name; the placeholder alone is not a label. */
  label: string;
  clearLabel?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), debounceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs]);

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoFocus={autoFocus}
        startIcon={<FiSearch className="size-3.5" />}
        className={draft ? "pe-8" : undefined}
      />
      {draft ? (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          aria-label={clearLabel}
          className="absolute end-0.5 flex size-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <FiX className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Filter and action bar above a collection.
 *
 * Search takes the available width, filters wrap beneath it on narrow screens,
 * and actions stay pinned to the trailing edge.
 */
export function Toolbar({
  search,
  filters,
  actions,
  className,
}: {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {search ? <div className="w-full sm:max-w-64">{search}</div> : null}
        {filters ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {filters}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  );
}

/**
 * Bar that appears when rows are selected, replacing per-row action clutter
 * with one place to act on the selection.
 */
export function SelectionBar({
  count,
  countLabel,
  onClear,
  clearLabel,
  children,
  className,
}: {
  count: number;
  countLabel: (n: number) => string;
  onClear: () => void;
  clearLabel: string;
  children?: ReactNode;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-line bg-brand-soft px-2.5 py-1.5",
        "motion-safe:animate-[ui-pop-in_140ms_ease-out]",
        className,
      )}
    >
      <p className="text-[13px] font-medium text-brand-soft-fg">
        {countLabel(count)}
      </p>
      <div className="flex items-center gap-1.5">
        {children}
        <Button variant="ghost" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
