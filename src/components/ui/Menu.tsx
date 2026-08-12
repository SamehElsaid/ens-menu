"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
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
            "absolute top-[calc(100%+6px)] z-50 min-w-48 overflow-hidden rounded-xl border border-line bg-raised p-1.5 shadow-lg",
            "motion-safe:animate-[ui-pop-in_var(--dur-pop)_var(--ease-enter)]",
            align === "start"
              ? "start-0 origin-top-left"
              : "end-0 origin-top-right",
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
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] font-medium row-settle",
  focusRing,
);

/**
 * The row recipe on its own.
 *
 * `MenuItem` covers a button and an internal link. Some rows cannot be either:
 * an entry that opens in a new tab needs `target`/`rel`, and an entry that has
 * to go through the app's locale-aware link wrapper needs that component. Those
 * render their own element and take the recipe from here, so a menu stays one
 * consistent set of rows instead of two that drift.
 */
export function menuItemClasses({
  tone = "default",
  disabled = false,
  className,
}: {
  tone?: "default" | "danger";
  disabled?: boolean;
  className?: string;
} = {}) {
  return cn(
    itemBase,
    tone === "danger"
      ? "text-danger hover:bg-danger-soft"
      : "text-fg hover:bg-surface-2",
    disabled && "pointer-events-none opacity-50",
    className,
  );
}

/** The inner layout of a row: dimmed leading glyph, then a truncating label. */
export function MenuItemBody({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {icon ? (
        <span
          className="shrink-0 text-[15px] text-current opacity-65"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );
}

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
  const classes = menuItemClasses({ tone, disabled, className });
  const content = <MenuItemBody icon={icon}>{children}</MenuItemBody>;

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

/**
 * A row that reports state rather than performing navigation.
 *
 * `menuitemcheckbox` rows deliberately keep the panel open: a column-visibility
 * list is used a few columns at a time, and closing after each toggle turns one
 * decision into four round trips. `menuitemradio` rows close, because choosing
 * one of a set is a single decision.
 */
export function MenuItemToggle({
  children,
  checked,
  onToggle,
  multiple = true,
}: {
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
  /** `false` renders a radio row, which closes the menu when chosen. */
  multiple?: boolean;
}) {
  return (
    <button
      type="button"
      role={multiple ? "menuitemcheckbox" : "menuitemradio"}
      aria-checked={checked}
      onClick={(event) => {
        if (multiple) event.stopPropagation();
        onToggle();
      }}
      className={menuItemClasses()}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border",
          multiple ? "rounded-[4px]" : "rounded-full",
          checked ? "border-brand bg-brand text-on-brand" : "border-line-control",
        )}
      >
        {checked ? <FiCheck className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  return <hr className="my-1 border-line" aria-hidden />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold text-fg-subtle">
      {children}
    </p>
  );
}
