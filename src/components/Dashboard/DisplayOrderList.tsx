"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoGridOutline,
  IoImageOutline,
  IoMenuOutline,
  IoRestaurantOutline,
  IoStar,
} from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import { formatMenuPrice } from "@/lib/formatMenuPrice";

/** Virtual category id for “All products” (same as public catalog). */
export const DISPLAY_ORDER_ALL_CATEGORY_ID = 0;

const DRAG_THRESHOLD_PX = 6;

export type DisplayOrderRow = {
  id: number;
  label: string;
  imageUrl?: string;
  description?: string;
  price?: number;
  available?: boolean;
  categoryLabel?: string;
  /** Required for within-category reorder when showing “All”. */
  categoryId?: number;
};

/** Build reorder payload with sortOrder reset inside each category. */
export function toCategoryScopedPayload(
  rows: DisplayOrderRow[],
  categoryOrder: number[],
): { id: number; sortOrder: number }[] {
  const grouped = new Map<number, DisplayOrderRow[]>();
  for (const row of rows) {
    const key = row.categoryId ?? -1;
    const list = grouped.get(key);
    if (list) list.push(row);
    else grouped.set(key, [row]);
  }

  const payload: { id: number; sortOrder: number }[] = [];
  const seen = new Set<number>();

  for (const categoryId of categoryOrder) {
    const group = grouped.get(categoryId) ?? [];
    group.forEach((row, index) => {
      payload.push({ id: row.id, sortOrder: index });
    });
    seen.add(categoryId);
  }

  for (const [categoryId, group] of grouped) {
    if (seen.has(categoryId)) continue;
    group.forEach((row, index) => {
      payload.push({ id: row.id, sortOrder: index });
    });
  }

  return payload;
}

function rebuildRowsByCategoryOrder(
  rows: DisplayOrderRow[],
  categoryOrder: number[],
  categoryId: number,
  fromInGroup: number,
  toInGroup: number,
): DisplayOrderRow[] {
  const grouped = new Map<number, DisplayOrderRow[]>();
  for (const id of categoryOrder) grouped.set(id, []);

  for (const row of rows) {
    const key = row.categoryId ?? -1;
    const list = grouped.get(key);
    if (list) list.push(row);
    else grouped.set(key, [row]);
  }

  const group = grouped.get(categoryId) ?? [];
  grouped.set(categoryId, moveIndex(group, fromInGroup, toInGroup));

  const next: DisplayOrderRow[] = [];
  const emitted = new Set<number>();
  for (const id of categoryOrder) {
    next.push(...(grouped.get(id) ?? []));
    emitted.add(id);
  }
  for (const [id, items] of grouped) {
    if (!emitted.has(id)) next.push(...items);
  }
  return next;
}

export function moveIndex<T>(list: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type CategoryStripProps = {
  rows: DisplayOrderRow[];
  locale: string;
  selectedId: number | null;
  disabled?: boolean;
  onSelect: (id: number) => void;
  onReorder: (next: DisplayOrderRow[]) => void;
};

export function DisplayOrderCategoryStrip({
  rows,
  locale,
  selectedId,
  disabled = false,
  onSelect,
  onReorder,
}: CategoryStripProps) {
  const t = useTranslations("DisplayOrder");
  const isRTL = locale === "ar";
  const allActive = selectedId === DISPLAY_ORDER_ALL_CATEGORY_ID;
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [ghost, setGhost] = useState<{
    label: string;
    imageUrl?: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const dragIndexRef = useRef<number | null>(null);
  const draggingIdRef = useRef<number | null>(null);
  const rowsRef = useRef(rows);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });
  const pendingRef = useRef<{
    id: number;
    index: number;
    startX: number;
    startY: number;
    rect: DOMRect;
  } | null>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  rowsRef.current = rows;
  draggingIdRef.current = draggingId;

  const endDrag = useCallback(() => {
    pendingRef.current = null;
    dragIndexRef.current = null;
    draggingIdRef.current = null;
    setDraggingId(null);
    setGhost(null);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const pending = pendingRef.current;
      if (pending && draggingIdRef.current == null) {
        const dx = event.clientX - pending.startX;
        const dy = event.clientY - pending.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

        dragIndexRef.current = pending.index;
        draggingIdRef.current = pending.id;
        setDraggingId(pending.id);
        setGhost({
          label:
            rowsRef.current.find((row) => row.id === pending.id)?.label ?? "",
          imageUrl: rowsRef.current.find((row) => row.id === pending.id)
            ?.imageUrl,
          x: pending.rect.left,
          y: pending.rect.top,
          width: pending.rect.width,
          height: pending.rect.height,
        });
        pointerOffsetRef.current = {
          x: pending.startX - pending.rect.left,
          y: pending.startY - pending.rect.top,
        };
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
        pendingRef.current = null;
      }

      const from = dragIndexRef.current;
      const activeId = draggingIdRef.current;
      if (from == null || activeId == null) return;

      setGhost((current) =>
        current
          ? {
              ...current,
              x: event.clientX - pointerOffsetRef.current.x,
              y: event.clientY - pointerOffsetRef.current.y,
            }
          : current,
      );

      const host = document
        .elementsFromPoint(event.clientX, event.clientY)
        .map((el) =>
          el instanceof HTMLElement
            ? el.closest<HTMLElement>("[data-display-order-cat]")
            : null,
        )
        .find(
          (node) => node && node.dataset.displayOrderCat !== String(activeId),
        );

      if (!host) return;
      const overId = Number(host.dataset.displayOrderCat);
      if (Number.isNaN(overId)) return;
      const to = rowsRef.current.findIndex((row) => row.id === overId);
      if (to < 0 || to === from) return;
      dragIndexRef.current = to;
      onReorder(moveIndex(rowsRef.current, from, to));
    };

    const onUp = (event: PointerEvent) => {
      const pending = pendingRef.current;
      if (pending && draggingIdRef.current == null) {
        onSelect(pending.id);
        pendingRef.current = null;
        return;
      }
      if (draggingIdRef.current != null) {
        event.preventDefault();
      }
      endDrag();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endDrag, onReorder, onSelect]);

  const onPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    index: number,
    row: DisplayOrderRow,
  ) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    const node = itemRefs.current.get(row.id);
    if (!node) return;
    pendingRef.current = {
      id: row.id,
      index,
      startX: event.clientX,
      startY: event.clientY,
      rect: node.getBoundingClientRect(),
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {t("categoriesStripHint")}
      </p>
      <div
        className="flex flex-wrap gap-2.5 sm:gap-3"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <button
          type="button"
          onClick={() => onSelect(DISPLAY_ORDER_ALL_CATEGORY_ID)}
          className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border bg-white pe-4 ps-1.5 py-1.5 text-sm font-bold shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-slate-800 ${
            allActive
              ? "border-primary text-primary shadow-[0_2px_10px_rgba(124,58,237,0.18)]"
              : "border-slate-200/90 text-slate-800 hover:-translate-y-0.5 hover:border-primary/30 dark:border-slate-600 dark:text-slate-100"
          }`}
          aria-pressed={allActive}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              allActive
                ? "bg-brand text-on-brand"
                : "bg-primary/10 text-primary"
            }`}
          >
            <IoGridOutline className="text-lg" aria-hidden />
          </span>
          <span className="max-w-48 truncate tracking-wide">
            {t("allCategories")}
          </span>
        </button>

        {rows.map((row, index) => {
          const active = selectedId === row.id;
          const isDragging = draggingId === row.id;
          return (
            <button
              key={row.id}
              type="button"
              ref={(node) => {
                if (node) itemRefs.current.set(row.id, node);
                else itemRefs.current.delete(row.id);
              }}
              data-display-order-cat={row.id}
              onPointerDown={(e) => onPointerDown(e, index, row)}
              onDragStart={(e) => e.preventDefault()}
              className={`group relative inline-flex min-h-11 touch-none select-none items-center gap-2.5 rounded-full border pe-4 ps-1.5 py-1.5 text-sm font-bold shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                isDragging
                  ? "border-dashed border-primary/45 bg-primary/5 opacity-35 shadow-none"
                  : active
                    ? "border-primary bg-white text-primary shadow-[0_2px_10px_rgba(124,58,237,0.18)] dark:bg-slate-800"
                    : "border-slate-200/90 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-primary/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              } ${disabled ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
              aria-pressed={active}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-white dark:bg-slate-700 dark:ring-slate-800">
                {!isDragging && row.imageUrl ? (
                  <LoadImage
                    src={row.imageUrl}
                    alt={row.label}
                    width={36}
                    height={36}
                    cover
                    draggable={false}
                    className="pointer-events-none h-full w-full select-none object-cover [-webkit-user-drag:none]"
                    wrapperClassName="!block h-full w-full"
                  />
                ) : !isDragging ? (
                  <IoRestaurantOutline className="text-base text-primary" aria-hidden />
                ) : null}
                <span className="absolute -bottom-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                  {index + 1}
                </span>
              </span>
              <span className="max-w-48 truncate tracking-wide">
                {isDragging ? t("dropPlaceholder") : row.label}
              </span>
            </button>
          );
        })}
      </div>

      {ghost && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed z-200 inline-flex min-h-11 items-center gap-2.5 rounded-full border-2 border-primary bg-white pe-4 ps-1.5 py-1.5 text-sm font-bold text-primary shadow-[0_18px_40px_-12px_rgba(15,23,42,0.45)] ring-4 ring-primary/25 dark:bg-slate-800"
              style={{
                left: ghost.x,
                top: ghost.y,
                width: ghost.width,
                minWidth: ghost.width,
                transform: "rotate(-2deg) scale(1.05)",
              }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-primary/20 dark:bg-slate-700">
                {ghost.imageUrl ? (
                  <LoadImage
                    src={ghost.imageUrl}
                    alt={ghost.label}
                    width={36}
                    height={36}
                    cover
                    draggable={false}
                    className="pointer-events-none h-full w-full select-none object-cover [-webkit-user-drag:none]"
                    wrapperClassName="!block h-full w-full"
                  />
                ) : (
                  <IoRestaurantOutline className="text-base text-primary" />
                )}
              </span>
              <span className="max-w-48 truncate tracking-wide">
                {ghost.label}
              </span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type ProductCardFaceProps = {
  row: DisplayOrderRow;
  index: number;
  locale: string;
  currency: string;
  disabled?: boolean;
  hideChrome?: boolean;
  onMoveEarlier?: () => void;
  onMoveLater?: () => void;
  canMoveEarlier?: boolean;
  canMoveLater?: boolean;
};

function ProductCardFace({
  row,
  index,
  locale,
  currency,
  disabled = false,
  hideChrome = false,
  onMoveEarlier,
  onMoveLater,
  canMoveEarlier = false,
  canMoveLater = false,
}: ProductCardFaceProps) {
  const t = useTranslations("DisplayOrder");
  const isRTL = locale === "ar";
  const PrevIcon = isRTL ? IoChevronForwardOutline : IoChevronBackOutline;
  const NextIcon = isRTL ? IoChevronBackOutline : IoChevronForwardOutline;
  const available = row.available !== false;

  return (
    <>
      <div className="relative w-[42%] shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700">
        {row.imageUrl ? (
          <LoadImage
            src={row.imageUrl}
            alt={row.label}
            width={400}
            height={320}
            cover
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-cover [-webkit-user-drag:none]"
            wrapperClassName="!block h-full w-full pointer-events-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <IoImageOutline className="text-3xl" aria-hidden />
          </div>
        )}
        {available ? (
          <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
            <IoStar className="text-[10px]" aria-hidden />
            {t("availableNow")}
          </span>
        ) : null}
        <span className="absolute bottom-2 start-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
          #{index + 1}
        </span>
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col p-3 sm:p-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {!hideChrome ? (
          <div className="mb-1 flex items-center gap-1 text-slate-400">
            <IoMenuOutline className="text-lg" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {t("dragHandle")}
            </span>
          </div>
        ) : null}
        {row.categoryLabel ? (
          <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            <IoStar className="text-[10px]" aria-hidden />
            {row.categoryLabel}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-base font-black text-slate-900 dark:text-slate-50">
          {row.label}
        </h3>
        {row.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {row.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {typeof row.price === "number"
              ? formatMenuPrice(row.price, currency, locale)
              : "—"}
          </span>
          {!hideChrome ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={disabled || !canMoveEarlier}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onMoveEarlier}
                className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:opacity-30 dark:border-slate-600"
                aria-label={t("moveUp")}
              >
                <PrevIcon className="text-base" />
              </button>
              <button
                type="button"
                disabled={disabled || !canMoveLater}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onMoveLater}
                className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:opacity-30 dark:border-slate-600"
                aria-label={t("moveDown")}
              >
                <NextIcon className="text-base" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

type ProductGridProps = {
  rows: DisplayOrderRow[];
  locale: string;
  currency: string;
  disabled?: boolean;
  onReorder: (next: DisplayOrderRow[]) => void;
  /** When true, render category headers and constrain reorder within each category. */
  groupByCategory?: boolean;
  /** Category id order (from the strip) used for section order. */
  categoryOrder?: number[];
};

type ProductGhost = {
  row: DisplayOrderRow;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type CategoryGroup = {
  categoryId: number;
  label: string;
  items: DisplayOrderRow[];
};

export function DisplayOrderProductGrid({
  rows,
  locale,
  currency,
  disabled = false,
  onReorder,
  groupByCategory = false,
  categoryOrder = [],
}: ProductGridProps) {
  const t = useTranslations("DisplayOrder");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [ghost, setGhost] = useState<ProductGhost | null>(null);

  const dragIndexRef = useRef<number | null>(null);
  const draggingCategoryRef = useRef<number | null>(null);
  const draggingIdRef = useRef<number | null>(null);
  const rowsRef = useRef(rows);
  const categoryOrderRef = useRef(categoryOrder);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });
  const pendingRef = useRef<{
    id: number;
    indexInGroup: number;
    categoryId: number;
    startX: number;
    startY: number;
    rect: DOMRect;
  } | null>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  rowsRef.current = rows;
  categoryOrderRef.current = categoryOrder;
  draggingIdRef.current = draggingId;

  const groups = useMemo((): CategoryGroup[] => {
    if (!groupByCategory) {
      return [
        {
          categoryId: -1,
          label: "",
          items: rows,
        },
      ];
    }

    const byId = new Map<number, DisplayOrderRow[]>();
    for (const row of rows) {
      const key = row.categoryId ?? -1;
      const list = byId.get(key);
      if (list) list.push(row);
      else byId.set(key, [row]);
    }

    const result: CategoryGroup[] = [];
    const seen = new Set<number>();
    for (const categoryId of categoryOrder) {
      const items = byId.get(categoryId);
      if (!items?.length) continue;
      result.push({
        categoryId,
        label: items[0]?.categoryLabel || String(categoryId),
        items,
      });
      seen.add(categoryId);
    }
    for (const [categoryId, items] of byId) {
      if (seen.has(categoryId) || !items.length) continue;
      result.push({
        categoryId,
        label: items[0]?.categoryLabel || t("uncategorized"),
        items,
      });
    }
    return result;
  }, [rows, groupByCategory, categoryOrder, t]);

  const endDrag = useCallback(() => {
    pendingRef.current = null;
    dragIndexRef.current = null;
    draggingCategoryRef.current = null;
    draggingIdRef.current = null;
    setDraggingId(null);
    setGhost(null);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  const applyGroupReorder = useCallback(
    (categoryId: number, fromInGroup: number, toInGroup: number) => {
      if (fromInGroup === toInGroup) return;
      if (groupByCategory && categoryId >= 0) {
        onReorder(
          rebuildRowsByCategoryOrder(
            rowsRef.current,
            categoryOrderRef.current,
            categoryId,
            fromInGroup,
            toInGroup,
          ),
        );
        return;
      }
      onReorder(moveIndex(rowsRef.current, fromInGroup, toInGroup));
    },
    [groupByCategory, onReorder],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const pending = pendingRef.current;
      if (pending && draggingIdRef.current == null) {
        const dx = event.clientX - pending.startX;
        const dy = event.clientY - pending.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

        const row = rowsRef.current.find((item) => item.id === pending.id);
        if (!row) return;

        dragIndexRef.current = pending.indexInGroup;
        draggingCategoryRef.current = pending.categoryId;
        draggingIdRef.current = pending.id;
        setDraggingId(pending.id);
        setGhost({
          row,
          index: pending.indexInGroup,
          x: pending.rect.left,
          y: pending.rect.top,
          width: pending.rect.width,
          height: pending.rect.height,
        });
        pointerOffsetRef.current = {
          x: pending.startX - pending.rect.left,
          y: pending.startY - pending.rect.top,
        };
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
        pendingRef.current = null;
      }

      const from = dragIndexRef.current;
      const activeId = draggingIdRef.current;
      const activeCategoryId = draggingCategoryRef.current;
      if (from == null || activeId == null || activeCategoryId == null) return;

      const activeRow = rowsRef.current.find((row) => row.id === activeId);

      setGhost((current) =>
        current
          ? {
              ...current,
              row: activeRow ?? current.row,
              index: from,
              x: event.clientX - pointerOffsetRef.current.x,
              y: event.clientY - pointerOffsetRef.current.y,
            }
          : current,
      );

      const host = document
        .elementsFromPoint(event.clientX, event.clientY)
        .map((el) =>
          el instanceof HTMLElement
            ? el.closest<HTMLElement>("[data-display-order-item]")
            : null,
        )
        .find(
          (node) =>
            node && node.dataset.displayOrderItem !== String(activeId),
        );

      if (!host) return;
      const overId = Number(host.dataset.displayOrderItem);
      const overCategoryId = Number(host.dataset.displayOrderCategory);
      if (Number.isNaN(overId) || Number.isNaN(overCategoryId)) return;
      if (overCategoryId !== activeCategoryId) return;

      const to = Number(host.dataset.displayOrderIndex);
      if (Number.isNaN(to) || to === from) return;

      dragIndexRef.current = to;
      applyGroupReorder(activeCategoryId, from, to);
    };

    const onUp = () => {
      endDrag();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [applyGroupReorder, endDrag]);

  const onPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    indexInGroup: number,
    row: DisplayOrderRow,
    categoryId: number,
  ) => {
    if (disabled || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    event.preventDefault();

    const node = itemRefs.current.get(row.id);
    if (!node) return;

    pendingRef.current = {
      id: row.id,
      indexInGroup,
      categoryId,
      startX: event.clientX,
      startY: event.clientY,
      rect: node.getBoundingClientRect(),
    };
  };

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.categoryId} className="space-y-4">
            {groupByCategory && group.label ? (
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-primary sm:text-xl">
                  {group.label}
                </h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {t("categoryItemsCount", { count: group.items.length })}
                </span>
                <div className="h-px flex-1 bg-primary/15" />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {group.items.map((row, index) => {
                const isDragging = draggingId === row.id;
                const categoryId = row.categoryId ?? group.categoryId;
                return (
                  <article
                    key={row.id}
                    ref={(node) => {
                      if (node) itemRefs.current.set(row.id, node);
                      else itemRefs.current.delete(row.id);
                    }}
                    data-display-order-item={row.id}
                    data-display-order-category={categoryId}
                    data-display-order-index={index}
                    onPointerDown={(e) =>
                      onPointerDown(e, index, row, categoryId)
                    }
                    onDragStart={(e) => e.preventDefault()}
                    className={`group relative flex min-h-44 touch-none select-none overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition-[box-shadow,opacity,border-color,transform] duration-150 dark:bg-slate-800/90 ${
                      isDragging
                        ? "scale-[0.98] border-dashed border-primary/50 bg-primary/5 opacity-35 shadow-none dark:bg-primary/10"
                        : "border-primary/10 hover:shadow-md dark:border-slate-700"
                    } ${disabled ? "pointer-events-none opacity-60" : "cursor-grab active:cursor-grabbing"}`}
                  >
                    {isDragging ? (
                      <div className="flex w-full flex-col items-center justify-center gap-2 p-6 text-center">
                        <span className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs font-bold text-primary/80">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-primary/70">
                          {t("dropPlaceholder")}
                        </span>
                      </div>
                    ) : (
                      <ProductCardFace
                        row={row}
                        index={index}
                        locale={locale}
                        currency={currency}
                        disabled={disabled}
                        canMoveEarlier={index > 0}
                        canMoveLater={index < group.items.length - 1}
                        onMoveEarlier={() =>
                          applyGroupReorder(categoryId, index, index - 1)
                        }
                        onMoveLater={() =>
                          applyGroupReorder(categoryId, index, index + 1)
                        }
                      />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {ghost && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed z-200 flex overflow-hidden rounded-[1.75rem] border-2 border-primary bg-white shadow-[0_24px_60px_-16px_rgba(15,23,42,0.45)] ring-4 ring-primary/30 dark:bg-slate-800"
              style={{
                left: ghost.x,
                top: ghost.y,
                width: ghost.width,
                height: ghost.height,
                transform: "rotate(2deg) scale(1.04)",
              }}
            >
              <ProductCardFace
                row={ghost.row}
                index={ghost.index}
                locale={locale}
                currency={currency}
                hideChrome
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
