"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react";

const noopSubscribe = () => () => {};

/**
 * `false` while server-rendering and on the hydration pass, `true` afterwards.
 * Overlays portal into `document.body`, so they must not render until the
 * client has taken over.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

/**
 * Nested overlays share one lock, so closing an inner dialog cannot restore
 * page scrolling while an outer one is still open.
 */
let lockCount = 0;
let previousOverflow = "";
let previousPaddingEnd = "";

function lockScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    previousOverflow = body.style.overflow;
    previousPaddingEnd = body.style.paddingInlineEnd;
    body.style.overflow = "hidden";
    // Compensating for the scrollbar keeps fixed headers from jumping.
    if (scrollbar > 0) body.style.paddingInlineEnd = `${scrollbar}px`;
  }
  lockCount += 1;
}

function unlockScroll() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingInlineEnd = previousPaddingEnd;
  }
}

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Modal behaviour shared by Modal and Sheet: scroll lock, focus trap,
 * Escape-to-dismiss, and returning focus to whatever opened the overlay.
 */
export function useDialogBehavior({
  open,
  onClose,
  panelRef,
  dismissible = true,
  autoFocus = true,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement | null>;
  dismissible?: boolean;
  autoFocus?: boolean;
}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;

    // Wait a frame so the panel is mounted and measurable before focusing.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || !autoFocus) return;
      const target =
        panel.querySelector<HTMLElement>("[data-autofocus]") ??
        getFocusable(panel)[0] ??
        panel;
      target.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = getFocusable(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown, true);
      // Only restore focus if it is still inside the closing overlay.
      if (opener && document.body.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open, dismissible, autoFocus, panelRef]);
}
