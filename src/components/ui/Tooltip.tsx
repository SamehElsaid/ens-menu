"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TooltipSide = "top" | "bottom" | "start" | "end";

/** `start`/`end` are logical, so a collapsed rail hints outward in both scripts. */
const placement: Record<TooltipSide, string> = {
  top: "bottom-[calc(100%+6px)] start-1/2 -translate-x-1/2 rtl:translate-x-1/2",
  bottom: "top-[calc(100%+6px)] start-1/2 -translate-x-1/2 rtl:translate-x-1/2",
  start: "end-[calc(100%+8px)] top-1/2 -translate-y-1/2",
  end: "start-[calc(100%+8px)] top-1/2 -translate-y-1/2",
};

/**
 * Text hint attached to a control.
 *
 * Opens on hover and on focus, so keyboard users get the same information.
 * A tooltip must never carry the only copy of something essential — label the
 * control itself for that. The collapsed rail obeys this: every row keeps its
 * `aria-label`, and the tooltip only restores the *visible* label.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  disabled = false,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  /** Lets a caller keep one call site for both rail states. */
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const visible = open && !disabled;

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={visible ? id : undefined} className="inline-flex">
        {children}
      </span>
      {visible ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-56 rounded-lg bg-fg px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-surface shadow-xl",
            "motion-safe:animate-[ui-pop-in_var(--dur-fast)_var(--ease-settle)]",
            placement[side],
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
