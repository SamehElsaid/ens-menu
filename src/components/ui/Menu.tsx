"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";
import { getFocusable } from "./useDialog";

export type MenuAlign = "start" | "end";

/**
 * Dropdown menu.
 *
 * Opens on click rather than hover — hover menus are unreachable by keyboard
 * and unusable on touch. Arrow keys move through items, Escape closes and
 * returns focus to the trigger.
 */
export function Menu({
  trigger,
  children,
  align = "end",
  label,
  className,
  panelClassName,
  open: controlledOpen,
  onOpenChange,
}: {
  /** Receives the props that make an element a valid menu trigger. */
  trigger: (props: {
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
    id: string;
    ref: React.Ref<HTMLButtonElement>;
  }) => ReactNode;
  children: ReactNode;
  align?: MenuAlign;
  label: string;
  className?: string;
  panelClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      event.preventDefault();
      const items = getFocusable(panel);
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        currentIndex === -1
          ? event.key === "ArrowDown"
            ? 0
            : items.length - 1
          : (currentIndex + delta + items.length) % items.length;
      items[nextIndex]?.focus();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger({
        onClick: () => setOpen(!open),
        "aria-expanded": open,
        "aria-haspopup": "menu",
        id: triggerId,
        ref: triggerRef,
      })}

      {open ? (
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          aria-labelledby={triggerId}
          className={cn(
            "absolute top-[calc(100%+4px)] z-50 min-w-48 overflow-hidden rounded-lg border border-line bg-raised p-1 shadow-lg",
            "motion-safe:animate-[ui-pop-in_140ms_cubic-bezier(0.16,1,0.3,1)]",
            align === "start" ? "start-0 origin-top-left" : "end-0 origin-top-right",
            panelClassName,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

const itemBase = cn(
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[13px] font-medium row-settle",
  focusRing,
);

export function MenuItem({
  children,
  icon,
  onClick,
  href,
  tone = "default",
  disabled,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    itemBase,
    tone === "danger"
      ? "text-danger hover:bg-danger-soft"
      : "text-fg hover:bg-surface-2",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  const content = (
    <>
      {icon ? (
        <span className="shrink-0 text-[15px] text-current opacity-65" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}

export function MenuSeparator() {
  return <hr className="my-1 border-line" aria-hidden />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
      {children}
    </p>
  );
}
