"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

export type TabItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  /** Renders the tab as a link — for tabs that map to routes. */
  href?: string;
  disabled?: boolean;
};

/**
 * Underlined tab bar for switching between sibling views.
 *
 * Scrolls horizontally on narrow screens instead of wrapping, which keeps the
 * active tab's position stable as the set changes.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  label,
  className,
}: {
  items: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
  /** Names the tab set for screen readers. */
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={label}
        className="flex w-max min-w-full gap-1"
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const content = (
            <>
              {item.icon ? (
                <span className="shrink-0 text-base" aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              {item.label}
              {item.badge}
            </>
          );

          const classes = cn(
            "relative inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] font-medium row-settle",
            "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:transition-colors",
            focusRing,
            active
              ? "text-fg after:bg-brand"
              : "text-fg-muted after:bg-transparent hover:text-fg",
            item.disabled && "pointer-events-none opacity-50",
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                role="tab"
                aria-selected={active}
                aria-current={active ? "page" : undefined}
                className={classes}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange?.(item.id)}
              className={classes}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Enclosed control for mutually exclusive filters — the pattern the app
 * previously spelled out as ad-hoc "chips" on every list page.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-surface-2 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[4px] font-medium row-settle",
              size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-[13px]",
              focusRing,
              active
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "tabular-nums",
                  active ? "text-fg-muted" : "text-fg-subtle",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
