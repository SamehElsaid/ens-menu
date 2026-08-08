import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { statusTone, type StatusTone } from "./styles";

export type BadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  /** Leading status dot — use for live states, not decoration. */
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
};

/** Compact status label. Pills are reserved for small controls like this. */
export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "sm",
  dot = false,
  icon,
  className,
}: BadgeProps) {
  const t = statusTone[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
        size === "sm" ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-xs",
        variant === "soft" && cn("border", t.soft),
        variant === "solid" && t.solid,
        variant === "outline" &&
          cn("border bg-transparent", t.soft.replace(/bg-\S+/, ""), t.fg),
        className,
      )}
    >
      {dot ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} aria-hidden />
      ) : null}
      {icon ? (
        <span className="shrink-0" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** Numeric counter for nav items and tabs. */
export function CountBadge({
  count,
  max = 99,
  tone = "brand",
  className,
}: {
  count: number;
  max?: number;
  tone?: StatusTone;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold tabular-nums",
        statusTone[tone].solid,
        className,
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
