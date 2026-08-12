"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  IoArrowDown,
  IoArrowUp,
  IoLayersOutline,
  IoOptionsOutline,
  IoSwapVertical,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Menu, MenuItemToggle } from "./Menu";
import { Skeleton } from "./Skeleton";
import { SelectionBar } from "./Toolbar";
import { focusRingInset } from "./styles";

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
        "w-full overflow-x-auto rounded-xl border border-line bg-surface shadow-xs",
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
  density,
  className,
}: {
  children: ReactNode;
  /** Describes the table for screen readers. Visually hidden. */
  caption?: string;
  /**
   * Row height. Set as an attribute rather than threaded down as a prop so
   * `Td` and `Th` stay usable in hand-built tables without a context.
   */
  density?: "comfortable" | "compact";
  className?: string;
}) {
  return (
    <table
      data-density={density}
      className={cn("w-full border-collapse text-sm", className)}
    >
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      {children}
    </table>
  );
}

export function Th({
  children,
  align = "start",
  numeric,
  padded = true,
  className,
  ...props
}: Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: "start" | "center" | "end";
  numeric?: boolean;
  /** Set false when the cell's own child supplies the padding, so a control
      inside the header can fill the whole cell as a hit target. */
  padded?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn(
        // Sans and sentence case. The header separates from the data by weight
        // and by the sunken fill behind it, not by being a different typeface —
        // which is what made the previous tables read as printed receipts.
        "ui-label whitespace-nowrap border-b border-line bg-surface-2 font-semibold text-fg-muted",
        padded && "px-3.5 py-2.5",
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
        "border-b border-line px-3.5 py-2.5 text-[13px] text-fg",
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
  justChanged,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  interactive?: boolean;
  /**
   * A mutation just landed on this row: it holds a brand tint for 1.2s and
   * decays back. The only motion an admin grid is allowed, and it answers the
   * only question an operator asks after saving — which row did I change?
   */
  justChanged?: boolean;
}) {
  return (
    <tr
      className={cn(
        "last:[&>td]:border-b-0",
        interactive && "row-settle cursor-pointer hover:bg-surface-2",
        justChanged && "ui-flash-row",
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

export type SortableValue = string | number | boolean | Date | null | undefined;

export type SortDirection = "asc" | "desc";

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
  /**
   * Plain-text name for the column-visibility menu. Needed when `header` is
   * markup, since a checkbox list cannot render a node meaningfully.
   */
  label?: string;
  /** Never offered for hiding — the column that identifies the row. */
  essential?: boolean;
  /** Hidden until the operator turns it on. For the tail of a wide table. */
  defaultHidden?: boolean;
  /**
   * Supplying this makes the column sortable. `cell` returns markup, which
   * cannot be ordered, so a sortable column has to name the value behind it.
   *
   * Only use this where the table holds the whole collection. On a
   * server-paginated table it would sort the page rather than the data and
   * quietly misreport the order.
   */
  sortValue?: (row: T) => SortableValue;
  headerClassName?: string;
  cellClassName?: string;
};

export type TableDensity = "comfortable" | "compact";

export type DataTableLabels = {
  columns: string;
  density: string;
  comfortable: string;
  compact: string;
  selectAll: string;
  selectRow: string;
  clearSelection: string;
  selectedCount: (n: number) => string;
};

const DEFAULT_LABELS: DataTableLabels = {
  columns: "Columns",
  density: "Density",
  comfortable: "Comfortable",
  compact: "Compact",
  selectAll: "Select all rows",
  selectRow: "Select row",
  clearSelection: "Clear",
  selectedCount: (n) => `${n} selected`,
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
  /**
   * Row keys a mutation just landed on. Those rows hold a brand tint for 1.2s
   * and decay back — see `Tr`'s `justChanged`. Pair it with `useRowFlash`.
   */
  changedRowKeys?: ReadonlySet<string>;
  /** Column id to order by on first render. Must name a sortable column. */
  defaultSortColumnId?: string;
  defaultSortDirection?: SortDirection;
  /** Collation locale for text columns, so Arabic sorts as Arabic. */
  sortLocale?: string;
  /**
   * Enables per-table persistence of hidden columns and density. Without it the
   * controls still work but reset on navigation, which makes them not worth
   * using on a table someone returns to daily.
   */
  tableId?: string;
  /**
   * Header stays put while the body scrolls. Opt-in, because it requires the
   * table to fit its container: a horizontally scrolling wrapper becomes its own
   * scrollport and the header would stick to that instead of the page. Pair it
   * with `columnControl` on wide tables so the operator can make it fit.
   */
  stickyHeader?: boolean;
  /** Row checkboxes plus a selection bar. Needs `bulkActions` to be useful. */
  selectable?: boolean;
  /** Actions offered for the current selection. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  /** Show/hide columns menu. */
  columnControl?: boolean;
  /** Comfortable/compact row height toggle. */
  densityControl?: boolean;
  defaultDensity?: TableDensity;
  /** Extra controls in the table's own view bar, beside columns and density. */
  viewActions?: ReactNode;
  labels?: Partial<DataTableLabels>;
  className?: string;
};

function storageKey(tableId: string, part: string) {
  return `ens.console.table.${tableId}.${part}`;
}

function readStored(tableId: string | undefined, part: string): string | null {
  if (!tableId) return null;
  try {
    return window.localStorage.getItem(storageKey(tableId, part));
  } catch {
    return null;
  }
}

function writeStored(
  tableId: string | undefined,
  part: string,
  value: string,
): void {
  if (!tableId) return;
  try {
    window.localStorage.setItem(storageKey(tableId, part), value);
  } catch {
    /* A lost view preference is not worth failing an interaction over. */
  }
}

function compareSortable(
  a: SortableValue,
  b: SortableValue,
  locale?: string,
): number {
  // Blanks sort last in both directions: an empty cell is missing data rather
  // than a value that belongs at one end of the range.
  const aBlank = a === null || a === undefined || a === "";
  const bBlank = b === null || b === undefined || b === "";
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1;
  if (bBlank) return -1;

  if (a instanceof Date || b instanceof Date) {
    // An unparseable date yields NaN, which would make the comparator
    // inconsistent and scramble the rest of the column, so it sorts as blank.
    const at = new Date(a as Date | string | number).getTime();
    const bt = new Date(b as Date | string | number).getTime();
    if (Number.isNaN(at) && Number.isNaN(bt)) return 0;
    if (Number.isNaN(at)) return 1;
    if (Number.isNaN(bt)) return -1;
    return at - bt;
  }
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), locale, {
    numeric: true,
    sensitivity: "base",
  });
}

function SortGlyph({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    // Visible at rest, not only on hover: a sortable column has to advertise
    // itself, and a pointer-only cue never reaches touch or keyboard.
    return (
      <IoSwapVertical
        className="size-3 shrink-0 text-fg-subtle opacity-40 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    );
  }
  const Glyph = direction === "asc" ? IoArrowUp : IoArrowDown;
  return <Glyph className="size-3 shrink-0 text-brand" aria-hidden />;
}

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
  changedRowKeys,
  defaultSortColumnId,
  defaultSortDirection = "asc",
  sortLocale,
  tableId,
  stickyHeader = false,
  selectable = false,
  bulkActions,
  columnControl = false,
  densityControl = false,
  defaultDensity = "comfortable",
  viewActions,
  labels,
  className,
}: DataTableProps<T>) {
  const l = { ...DEFAULT_LABELS, ...labels };

  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* Preferences are read after mount, not during render: reading storage while
     rendering makes the server and client disagree and fails hydration. */
  useEffect(() => {
    const storedHidden = readStored(tableId, "hidden");
    if (storedHidden !== null) {
      setHidden(new Set(storedHidden.split(",").filter(Boolean)));
    }
    const storedDensity = readStored(tableId, "density");
    if (storedDensity === "compact" || storedDensity === "comfortable") {
      setDensity(storedDensity);
    }
  }, [tableId]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.essential || !hidden.has(c.id)),
    [columns, hidden],
  );

  const primaryColumn =
    visibleColumns.find((c) => c.primary) ??
    columns.find((c) => c.primary) ??
    visibleColumns[0] ??
    columns[0];

  const cardColumns = visibleColumns.filter(
    (c) => c !== primaryColumn && !c.hideOnMobile,
  );

  const [sort, setSort] = useState<{
    id: string;
    direction: SortDirection;
  } | null>(
    defaultSortColumnId
      ? { id: defaultSortColumnId, direction: defaultSortDirection }
      : null,
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return rows;
    const read = column.sortValue;
    const factor = sort.direction === "asc" ? 1 : -1;
    // Copy first: sorting `rows` in place would mutate the caller's array.
    return [...rows].sort(
      (a, b) => compareSortable(read(a), read(b), sortLocale) * factor,
    );
  }, [rows, columns, sort, sortLocale]);

  const toggleSort = (id: string) =>
    setSort((current) =>
      current?.id === id
        ? { id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { id, direction: "asc" },
    );

  function toggleColumn(id: string) {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStored(tableId, "hidden", Array.from(next).join(","));
      return next;
    });
  }

  function changeDensity(next: TableDensity) {
    setDensity(next);
    writeStored(tableId, "density", next);
  }

  const rowKeys = useMemo(
    () => sortedRows.map((row, index) => getRowKey(row, index)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedRows],
  );

  /* A selection that outlives the rows it referred to would let a bulk action
     hit a record the operator can no longer see. */
  useEffect(() => {
    setSelected((current) => {
      if (current.size === 0) return current;
      const live = new Set(rowKeys);
      const next = new Set(Array.from(current).filter((key) => live.has(key)));
      return next.size === current.size ? current : next;
    });
  }, [rowKeys]);

  const selectedRows = sortedRows.filter((row, index) =>
    selected.has(getRowKey(row, index)),
  );
  const allSelected = rowKeys.length > 0 && selected.size === rowKeys.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleRow(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) =>
      current.size === rowKeys.length ? new Set() : new Set(rowKeys),
    );
  }

  const clearSelection = () => setSelected(new Set());

  const hideableColumns = columns.filter((c) => !c.essential);
  const showViewBar =
    Boolean(viewActions) ||
    (columnControl && hideableColumns.length > 0) ||
    densityControl;

  const viewBar = showViewBar ? (
    <div className="hidden items-center justify-end gap-1.5 md:flex">
      {viewActions}
      {densityControl ? (
        <Menu
          label={l.density}
          trigger={(props) => (
            <Button {...props} variant="ghost" size="sm">
              <IoOptionsOutline className="size-3.5" aria-hidden />
              {l.density}
            </Button>
          )}
        >
          {(["comfortable", "compact"] as TableDensity[]).map((option) => (
            <MenuItemToggle
              key={option}
              multiple={false}
              checked={density === option}
              onToggle={() => changeDensity(option)}
            >
              {option === "comfortable" ? l.comfortable : l.compact}
            </MenuItemToggle>
          ))}
        </Menu>
      ) : null}
      {columnControl && hideableColumns.length > 0 ? (
        <Menu
          label={l.columns}
          trigger={(props) => (
            <Button {...props} variant="ghost" size="sm">
              <IoLayersOutline className="size-3.5" aria-hidden />
              {l.columns}
            </Button>
          )}
        >
          {hideableColumns.map((column) => (
            <MenuItemToggle
              key={column.id}
              checked={!hidden.has(column.id)}
              onToggle={() => toggleColumn(column.id)}
            >
              {column.label ??
                (typeof column.header === "string" ? column.header : column.id)}
            </MenuItemToggle>
          ))}
        </Menu>
      ) : null}
    </div>
  ) : null;

  if (loading) {
    return (
      <div
        className={cn("w-full", className)}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">{caption}</span>
        <div className="hidden overflow-hidden rounded-xl border border-line bg-surface shadow-xs md:block">
          <div className="flex gap-3 border-b border-line bg-surface-2 px-3.5 py-3">
            {columns.map((c) => (
              <Skeleton key={c.id} className="h-2.5 flex-1" />
            ))}
          </div>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 border-b border-line px-3.5 py-3 last:border-b-0"
            >
              {columns.map((c) => (
                <Skeleton key={c.id} className="h-3 flex-1" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-xs md:hidden">
          {Array.from({ length: Math.min(skeletonRows, 3) }).map((_, i) => (
            <div key={i} className="p-3">
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
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      {/* One strip, two jobs: view controls at rest, and the selection bar in
          their place once rows are picked. Stacking both would leave a column
          menu sitting above a bar about the eleven rows you just chose. */}
      {selected.size > 0 && selectable ? (
        <SelectionBar
          count={selected.size}
          countLabel={l.selectedCount}
          onClear={clearSelection}
          clearLabel={l.clearSelection}
        >
          {bulkActions?.(selectedRows, clearSelection)}
        </SelectionBar>
      ) : (
        viewBar
      )}

      {/* Desktop: real table semantics. */}
      <TableShell
        className={cn(
          "hidden md:block",
          /* A sticky header cannot live inside a horizontal scrollport: the
             wrapper becomes the scroll container and the header sticks to it
             rather than to the page. */
          stickyHeader && "overflow-x-visible",
        )}
      >
        <Table caption={caption} density={density}>
          <thead className={stickyHeader ? "console-table-sticky-head" : undefined}>
            <tr>
              {selectable ? (
                <Th padded={false} className="w-px ps-3.5 pe-1">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label={l.selectAll}
                  />
                </Th>
              ) : null}
              {visibleColumns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sort?.id === column.id;
                const direction = active ? sort.direction : "asc";
                return (
                  <Th
                    key={column.id}
                    align={column.align}
                    numeric={column.numeric}
                    padded={!sortable}
                    className={column.headerClassName}
                    aria-sort={
                      !sortable
                        ? undefined
                        : active
                          ? direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className={cn(
                          "group row-settle flex w-full items-center gap-1.5 px-3 py-2 hover:text-fg",
                          focusRingInset,
                          column.align === "end" && "justify-end",
                          column.align === "center" && "justify-center",
                          active && "text-fg",
                        )}
                      >
                        <span>{column.header}</span>
                        <SortGlyph active={active} direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </Th>
                );
              })}
              {rowActions ? (
                <Th align="end" className="w-px">
                  <span className="sr-only">{caption}</span>
                </Th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => {
              const key = getRowKey(row, index);
              const isSelected = selected.has(key);
              return (
                <Tr
                  key={key}
                  interactive={Boolean(onRowClick)}
                  justChanged={changedRowKeys?.has(key) ?? false}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={isSelected ? "bg-brand-soft/40" : undefined}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable ? (
                    /* The checkbox stops its own click: on a table whose rows
                       navigate, picking a row would otherwise leave the page. */
                    <Td
                      className="w-px ps-3.5 pe-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        aria-label={l.selectRow}
                      />
                    </Td>
                  ) : null}
                  {visibleColumns.map((column) => (
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
              );
            })}
          </tbody>
        </Table>
      </TableShell>

      {/* Mobile: one ruled card per row, every field labelled. The cards share
          edges rather than floating apart, so the collection still reads as one
          list — a stack of separated panels loses the sense of a table. */}
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-xs md:hidden">
        {sortedRows.map((row, index) => {
          const key = getRowKey(row, index);
          const isSelected = selected.has(key);
          return (
          <li
            key={key}
            className={cn(
              "p-3",
              isSelected && "bg-brand-soft/40",
              changedRowKeys?.has(key) && "ui-flash-row",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {selectable ? (
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleRow(key)}
                  aria-label={l.selectRow}
                  className="mt-0.5 shrink-0"
                />
              ) : null}
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="min-w-0 flex-1 rounded-md text-start text-sm font-semibold text-fg"
                >
                  {primaryColumn.cell(row)}
                </button>
              ) : (
                <div className="min-w-0 flex-1 text-sm font-semibold text-fg">
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
                    <dt className="ui-label pt-0.5">{column.header}</dt>
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
          );
        })}
      </ul>
    </div>
  );
}
