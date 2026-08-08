"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";

/* --------------------------------------------------------------------------
   Composable table parts — for tables that need bespoke markup but should
   still match the product's chrome.
   -------------------------------------------------------------------------- */

export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-line bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Table({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  /** Describes the table for screen readers. Visually hidden. */
  caption?: string;
  className?: string;
}) {
  return (
    <table className={cn("w-full border-collapse text-sm", className)}>
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      {children}
    </table>
  );
}

export function Th({
  children,
  align = "start",
  numeric,
  className,
  ...props
}: Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: "start" | "center" | "end";
  numeric?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-line bg-surface-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-fg-subtle",
        align === "start" && "text-start",
        align === "center" && "text-center",
        align === "end" && "text-end",
        numeric && "tabular-nums",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "start",
  numeric,
  className,
  ...props
}: Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: "start" | "center" | "end";
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-line px-3 py-1.5 text-[13px] text-fg",
        align === "start" && "text-start",
        align === "center" && "text-center",
        align === "end" && "text-end",
        numeric && "tabular-nums",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  interactive,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        "last:[&>td]:border-b-0",
        interactive && "row-settle cursor-pointer hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/* --------------------------------------------------------------------------
   Responsive data table
   -------------------------------------------------------------------------- */

export type DataColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "start" | "center" | "end";
  numeric?: boolean;
  /** Becomes the card heading in the stacked mobile layout. */
  primary?: boolean;
  /** Omitted from the stacked mobile layout — for low-value columns. */
  hideOnMobile?: boolean;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableProps<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  /** Screen-reader description of the table's contents. */
  caption: string;
  loading?: boolean;
  skeletonRows?: number;
  /** Rendered in place of the table when there are no rows. */
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Trailing actions column, pinned to the row's end. */
  rowActions?: (row: T) => ReactNode;
  className?: string;
};

/**
 * Table that becomes a stack of cards below `md`.
 *
 * Horizontal scrolling is the usual fallback for narrow screens, but it hides
 * columns behind a gesture people rarely discover. Stacking keeps every field
 * visible and labelled.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  loading = false,
  skeletonRows = 5,
  empty,
  onRowClick,
  rowActions,
  className,
}: DataTableProps<T>) {
  const primaryColumn = columns.find((c) => c.primary) ?? columns[0];
  const cardColumns = columns.filter(
    (c) => c !== primaryColumn && !c.hideOnMobile,
  );

  if (loading) {
    return (
      <div
        className={cn("w-full", className)}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">{caption}</span>
        <div className="hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
          <div className="flex gap-3 border-b border-line bg-surface-2 px-3 py-2">
            {columns.map((c) => (
              <Skeleton key={c.id} className="h-2.5 flex-1" />
            ))}
          </div>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
            >
              {columns.map((c) => (
                <Skeleton key={c.id} className="h-3 flex-1" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 md:hidden">
          {Array.from({ length: Math.min(skeletonRows, 3) }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <Skeleton className="h-3.5 w-1/2" />
              <div className="mt-2.5 flex flex-col gap-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: real table semantics. */}
      <TableShell className="hidden md:block">
        <Table caption={caption}>
          <thead>
            <tr>
              {columns.map((column) => (
                <Th
                  key={column.id}
                  align={column.align}
                  numeric={column.numeric}
                  className={column.headerClassName}
                >
                  {column.header}
                </Th>
              ))}
              {rowActions ? (
                <Th align="end" className="w-px">
                  <span className="sr-only">{caption}</span>
                </Th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Tr
                key={getRowKey(row, index)}
                interactive={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <Td
                    key={column.id}
                    align={column.align}
                    numeric={column.numeric}
                    className={column.cellClassName}
                  >
                    {column.cell(row)}
                  </Td>
                ))}
                {rowActions ? (
                  <Td align="end" className="whitespace-nowrap">
                    {rowActions(row)}
                  </Td>
                ) : null}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableShell>

      {/* Mobile: one card per row, every field labelled. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((row, index) => (
          <li
            key={getRowKey(row, index)}
            className="rounded-xl border border-line bg-surface p-3"
          >
            <div className="flex items-start justify-between gap-3">
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="min-w-0 rounded-md text-start text-sm font-semibold text-fg"
                >
                  {primaryColumn.cell(row)}
                </button>
              ) : (
                <div className="min-w-0 text-sm font-semibold text-fg">
                  {primaryColumn.cell(row)}
                </div>
              )}
              {rowActions ? (
                <div className="shrink-0">{rowActions(row)}</div>
              ) : null}
            </div>
            {cardColumns.length > 0 ? (
              <dl className="mt-2.5 flex flex-col gap-1.5 border-t border-line pt-2.5">
                {cardColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-xs font-medium text-fg-muted">
                      {column.header}
                    </dt>
                    <dd
                      className={cn(
                        "min-w-0 text-end text-[13px] text-fg",
                        column.numeric && "tabular-nums",
                      )}
                    >
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
