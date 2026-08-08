"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Text hint attached to a control.
 *
 * Opens on hover and on focus, so keyboard users get the same information.
 * A tooltip must never carry the only copy of something essential — label the
 * control itself for that.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute start-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg bg-fg px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-surface shadow-lg rtl:translate-x-1/2",
            "motion-safe:animate-[ui-pop-in_120ms_ease-out]",
            side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
