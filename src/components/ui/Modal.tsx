"use client";

import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { useDialogBehavior, useIsClient } from "./useDialog";

const sizes = {
  xs: "sm:max-w-sm",
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[min(72rem,calc(100vw-3rem))]",
} as const;

export type ModalSize = keyof typeof sizes;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Short line under the title. Wired to `aria-describedby`. */
  description?: ReactNode;
  /** Icon shown beside the title, e.g. a destructive warning glyph. */
  icon?: ReactNode;
  iconTone?: "brand" | "danger" | "warning" | "success";
  size?: ModalSize;
  children: ReactNode;
  /** Pinned action row. Stacks full-width on mobile. */
  footer?: ReactNode;
  /** Blocks backdrop click and Escape — use only while work is in flight. */
  dismissible?: boolean;
  showClose?: boolean;
  closeLabel?: string;
  className?: string;
  /** Removes body padding for edge-to-edge content such as tables or media. */
  bare?: boolean;
};

/**
 * The product's only dialog.
 *
 * Behaviour lives in `useDialogBehavior`: focus trap, scroll lock, Escape and
 * focus restoration. On small screens it becomes a bottom sheet, which keeps
 * actions inside thumb reach instead of centring a tall card off-screen.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  iconTone = "brand",
  size = "md",
  children,
  footer,
  dismissible = true,
  showClose = true,
  closeLabel = "Close",
  className,
  bare = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const titleId = useId();
  const descriptionId = useId();

  useDialogBehavior({ open, onClose, panelRef, dismissible });

  if (!isClient || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-[2px] motion-safe:animate-[ui-fade-in_var(--dur-settle)_var(--ease-settle)]"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-raised shadow-2xl outline-none",
          "rounded-t-2xl sm:rounded-2xl",
          "motion-safe:animate-[ui-sheet-in_var(--dur-sheet)_var(--ease-enter)]",
          "sm:motion-safe:animate-[ui-dialog-in_var(--dur-overlay)_var(--ease-enter)]",
          sizes[size],
          className,
        )}
      >
        {/* Grab affordance for the mobile sheet form. */}
        <div
          className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
          aria-hidden
        />

        {title || showClose ? (
          <header
            className={cn(
              "flex shrink-0 items-start gap-2.5 px-4 pb-3 pt-3.5 sm:px-5 sm:pt-4",
              Boolean(title || description) && "border-b border-line",
            )}
          >
            {icon ? (
              <span
                className={cn(
                  "mt-px flex size-7 shrink-0 items-center justify-center rounded-md",
                  iconTone === "danger" && "bg-danger-soft text-danger-fg",
                  iconTone === "warning" && "bg-warning-soft text-warning-fg",
                  iconTone === "success" && "bg-success-soft text-success-fg",
                  iconTone === "brand" && "bg-brand-soft text-brand-soft-fg",
                )}
              >
                {icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              {title ? (
                <h2
                  id={titleId}
                  className="text-sm font-semibold tracking-[-0.011em] text-fg"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p
                  id={descriptionId}
                  className="mt-0.5 text-xs leading-relaxed text-fg-muted"
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
                className="-me-1.5 -mt-1"
              >
                <FiX className="size-4.5" />
              </Button>
            ) : null}
          </header>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            !bare && "px-4 py-4 sm:px-5",
          )}
        >
          {children}
        </div>

        {footer ? (
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-surface-2/60 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </footer>
        ) : null}

        {/* Keeps the sheet's action row clear of the home indicator. */}
        <div
          className="h-[env(safe-area-inset-bottom)] shrink-0 sm:hidden"
          aria-hidden
        />
      </div>
    </div>,
    document.body,
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  /** Extra context or a typed-confirmation field. */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  /** Destructive actions get the danger button and a red icon well. */
  tone?: "danger" | "brand";
  icon?: ReactNode;
  confirmDisabled?: boolean;
  size?: ModalSize;
};

/** Confirmation flow built on Modal so every yes/no prompt behaves identically. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  loading = false,
  tone = "danger",
  icon,
  confirmDisabled = false,
  size = "sm",
}: ConfirmDialogProps) {
  // Without extra content the description carries the message, so it belongs
  // in the body rather than as a cramped subtitle.
  const descriptionInHeader = children ? description : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={descriptionInHeader}
      size={size}
      dismissible={!loading}
      icon={icon}
      iconTone={tone}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => void onConfirm()}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ?? (
        <p className="text-sm leading-relaxed text-fg-muted">{description}</p>
      )}
    </Modal>
  );
}
