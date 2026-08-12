import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Page kinds — CONSOLE-REDESIGN.md §4, §5.
 *
 * Measure is a property of what is on the page, not one value for the whole
 * console. A ten-column ledger and a six-field form were both being given
 * 1400px, which is why the ledger felt cramped and the form read as a wall.
 */
export type PageKind = "table" | "wide" | "detail" | "form";

const measure: Record<PageKind, string> = {
  table: "max-w-none",
  wide: "max-w-[100rem]",
  detail: "max-w-[75rem]",
  form: "max-w-[55rem]",
};

export type PageShellProps = {
  kind?: PageKind;
  /** `PageHeader` — title, description, breadcrumbs, primary actions. */
  header?: ReactNode;
  /**
   * Search, filters and view controls. Sticks under the app header on scroll so
   * a filter is still reachable 200 rows into a table.
   */
  toolbar?: ReactNode;
  /** Pagination or a form's action row. */
  footer?: ReactNode;
  /**
   * Pins the footer to the bottom of the viewport. For long forms, where the
   * save button was previously only reachable by scrolling past every field.
   */
  footerSticky?: boolean;
  /** Supporting content below the main region — related records, help, audit. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * The page layout contract.
 *
 * Every console page used to re-assemble header → stats → toolbar → table →
 * pagination by hand, which is why `/admin/broadcast` looked like a different
 * product from `/admin/payments` and why two pages had no breadcrumbs at all.
 *
 * `kind` is what keeps this from becoming a template that flattens everything:
 * a form page and a ledger page are deliberately different shapes, and the
 * component knows which differences are intentional.
 */
export function PageShell({
  kind = "wide",
  header,
  toolbar,
  footer,
  footerSticky = false,
  aside,
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-4",
        measure[kind],
        className,
      )}
    >
      {header}

      {toolbar ? (
        /* Negative inline margins let the sticky bar's background reach the
           gutters, so rows do not appear to slide out from under a floating
           island as they scroll past it. */
        <div className="console-toolbar-sticky -mx-4 border-b border-line bg-app/95 px-4 py-2 backdrop-blur-[2px] sm:-mx-6 sm:px-6">
          {toolbar}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4">{children}</div>

      {aside ? <div className="flex min-w-0 flex-col gap-4">{aside}</div> : null}

      {footer ? (
        <div
          className={
            footerSticky
              ? /* Same gutter-reaching trick as the toolbar, so the bar reads as
                   the floor of the page rather than a card hovering over it. */
                "sticky bottom-0 z-20 -mx-4 border-t border-line bg-app/95 px-4 py-3 backdrop-blur-[2px] sm:-mx-6 sm:px-6"
              : "pt-1"
          }
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Two-column working area for detail pages.
 *
 * The main column takes the record; the side column takes its metadata and
 * actions. Below `lg` it stacks with the side column *after* the main one, so a
 * phone reads the record before its administrivia.
 */
export function PageColumns({
  children,
  side,
  className,
}: {
  children: ReactNode;
  side: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[calc(var(--console-header-h)+1rem)]">
        {side}
      </div>
    </div>
  );
}
