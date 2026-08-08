"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { useDialogBehavior } from "./useDialog";

export type SheetSide = "start" | "end" | "bottom";

const sizeBySide: Record<SheetSide, Record<"sm" | "md" | "lg", string>> = {
  start: { sm: "w-72", md: "w-[min(22rem,88vw)]", lg: "w-[min(30rem,92vw)]" },
  end: { sm: "w-72", md: "w-[min(22rem,88vw)]", lg: "w-[min(30rem,92vw)]" },
  bottom: { sm: "max-h-[45dvh]", md: "max-h-[70dvh]", lg: "max-h-[90dvh]" },
};

/**
 * Slide-over panel.
 *
 * `side` is logical: `start`/`end` follow the document direction, so the panel
 * enters from the correct edge in Arabic without a locale check.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  side = "start",
  size = "md",
  children,
  footer,
  closeLabel = "Close",
  className,
  bare = false,
  showClose = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: SheetSide;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  className?: string;
  bare?: boolean;
  showClose?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => setMounted(true), []);
  useDialogBehavior({ open, onClose, panelRef });

  if (!mounted || !open) return null;

  const isBottom = side === "bottom";

  return createPortal(
    <div className="fixed inset-0 z-[1000]" role="presentation">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-[2px] motion-safe:animate-[ui-fade-in_180ms_ease-out]"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-sheet-side={side}
        className={cn(
          "absolute flex flex-col overflow-hidden bg-raised shadow-2xl outline-none",
          isBottom
            ? "inset-x-0 bottom-0 rounded-t-2xl motion-safe:animate-[ui-sheet-in_280ms_cubic-bezier(0.16,1,0.3,1)]"
            : "inset-y-0 h-dvh motion-safe:animate-[ui-slide-in-inline_280ms_cubic-bezier(0.16,1,0.3,1)]",
          side === "start" && "start-0 border-e border-line",
          side === "end" && "end-0 border-s border-line",
          sizeBySide[side][size],
          className,
        )}
      >
        {isBottom ? (
          <div
            className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-strong"
            aria-hidden
          />
        ) : null}

        {title ? (
          <header className="flex shrink-0 items-start gap-3 border-b border-line px-4 py-4">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                className="text-base font-semibold tracking-[-0.011em] text-fg"
              >
                {title}
              </h2>
              {description ? (
                <p
                  id={descriptionId}
                  className="mt-1 text-[13px] leading-relaxed text-fg-muted"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {showClose ? (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={onClose}
                aria-label={closeLabel}
                className="-me-1 -mt-1"
              >
                <FiX className="size-4.5" />
              </Button>
            ) : null}
          </header>
        ) : showClose ? (
          // Panels that bring their own header still need an explicit dismiss;
          // the backdrop alone is not a discoverable control.
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute end-3 top-3 z-10 shadow-sm"
          >
            <FiX className="size-4" />
          </Button>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            !bare && "p-4",
          )}
        >
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-line bg-surface-2/60 p-4">
            {footer}
          </footer>
        ) : null}

        <div
          className="h-[env(safe-area-inset-bottom)] shrink-0"
          aria-hidden
        />
      </div>
    </div>,
    document.body,
  );
}
