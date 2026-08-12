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
} from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import { cn } from "@/lib/cn";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import {
  Badge,
  Button,
  Card,
  CountBadge,
  SectionHeader,
  focusRing,
} from "@/components/ui";

/** Virtual category id for “All products” (same as public catalog). */
export const DISPLAY_ORDER_ALL_CATEGORY_ID = 0;

const DRAG_THRESHOLD_PX = 6;

/**
 * A draggable category chip.
 *
 * Selection is an ink fill rather than a tinted outline, because a strip of
 * fifteen chips with pale-purple borders has no findable current item. The
 * chips are square-cornered and unshadowed like everything else in the
 * product, and they do not lift on hover — a row you are about to drag should
 * not already be moving.
 */
const chipBase = cn(
  "relative inline-flex min-h-11 items-center gap-2 rounded-lg border px-2 py-1.5 text-[13px] font-medium sm:min-h-9",
  "transition-[background-color,border-color,color] duration-(--dur-fast) ease-(--ease-settle)",
  focusRing,
);
const chipActive = "border-brand bg-brand text-on-brand";
const chipRest =
  "border-line-control bg-surface text-fg hover:border-fg-subtle hover:bg-surface-2";
const chipThumb =
  "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm";

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
    <Card padded="md">
      <SectionHeader
        ruled
        eyebrow={t("allCategories")}
        title={t("categoriesStripHint")}
      />
      <div
        className="mt-3 flex flex-wrap gap-1.5"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <button
          type="button"
          onClick={() => onSelect(DISPLAY_ORDER_ALL_CATEGORY_ID)}
          className={cn(chipBase, allActive ? chipActive : chipRest)}
          aria-pressed={allActive}
        >
          <span className={cn(chipThumb, "bg-surface-3 text-fg-subtle")}>
            <IoGridOutline className="size-4" aria-hidden />
          </span>
          <span className="max-w-40 truncate">{t("allCategories")}</span>
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
              className={cn(
                chipBase,
                "touch-none select-none",
                isDragging
                  ? "border-dashed border-line-strong bg-surface-2 opacity-40"
                  : active
                    ? chipActive
                    : chipRest,
                disabled
                  ? "pointer-events-none"
                  : "cursor-grab active:cursor-grabbing",
              )}
              aria-pressed={active}
            >
              {/* The position number sits inside the chip as a mono ticket
                  rather than as a floating counter bubble: on a strip being
                  dragged into order, the order is the point. */}
              <span
                lang="en"
                aria-hidden
                className="ui-label w-4 shrink-0 text-center text-fg-subtle"
              >
                {index + 1}
              </span>
              <span className={cn(chipThumb, "bg-surface-3")}>
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
                  <IoRestaurantOutline
                    className="size-4 text-fg-subtle"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="max-w-40 truncate">
                {isDragging ? t("dropPlaceholder") : row.label}
              </span>
            </button>
          );
        })}
      </div>

      {ghost && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed z-200 inline-flex items-center gap-2 rounded-lg border border-brand bg-surface px-2 py-1.5 text-[13px] font-medium text-fg shadow-lg"
              style={{
                left: ghost.x,
                top: ghost.y,
                width: ghost.width,
                minWidth: ghost.width,
              }}
            >
              <span className={cn(chipThumb, "bg-surface-3")}>
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
                  <IoRestaurantOutline
                    className="size-4 text-fg-subtle"
                    aria-hidden
                  />
                )}
              </span>
              <span className="max-w-40 truncate">{ghost.label}</span>
            </div>,
            document.body,
          )
        : null}
    </Card>
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
      <div className="relative w-[42%] shrink-0 overflow-hidden bg-surface-3">
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
          <div className="flex h-full items-center justify-center text-fg-subtle">
            <IoImageOutline className="text-3xl" aria-hidden />
          </div>
        )}
        {/* The position is the one fact this screen exists to change, so it is
            a stamped mono figure on the image rather than a small pill. */}
        <span
          lang="en"
          className="ui-figure absolute start-0 top-0 bg-brand px-1.5 py-0.5 text-[11px] text-on-brand"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {!available ? (
          <span className="absolute end-1.5 top-1.5">
            <Badge tone="neutral" variant="solid">
              {t("unavailable")}
            </Badge>
          </span>
        ) : null}
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col p-3"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {!hideChrome ? (
          <div className="mb-1.5 flex items-center gap-1 text-fg-subtle">
            <IoMenuOutline className="size-4" aria-hidden />
            <span className="ui-label">{t("dragHandle")}</span>
          </div>
        ) : null}
        {row.categoryLabel ? (
          <p className="ui-label mb-1 truncate text-fg-muted">
            {row.categoryLabel}
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-[13px] leading-snug font-semibold text-fg">
          {row.label}
        </h3>
        {row.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
            {row.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="ui-figure text-[15px] text-fg" lang="en">
            {typeof row.price === "number"
              ? formatMenuPrice(row.price, currency, locale)
              : "—"}
          </span>
          {!hideChrome ? (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                disabled={disabled || !canMoveEarlier}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onMoveEarlier}
                aria-label={t("moveUp")}
              >
                <PrevIcon aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                disabled={disabled || !canMoveLater}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onMoveLater}
                aria-label={t("moveDown")}
              >
                <NextIcon aria-hidden />
              </Button>
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
          (node) => node && node.dataset.displayOrderItem !== String(activeId),
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
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.categoryId} className="flex flex-col gap-3">
            {groupByCategory && group.label ? (
              <SectionHeader
                ruled
                title={group.label}
                actions={
                  <CountBadge count={group.items.length} tone="neutral" />
                }
              />
            ) : null}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
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
                    className={cn(
                      "relative flex min-h-36 touch-none select-none overflow-hidden rounded-xl border bg-surface",
                      "transition-[border-color,opacity] duration-(--dur-fast) ease-(--ease-settle)",
                      isDragging
                        ? "border-dashed border-line-strong bg-surface-2 opacity-40"
                        : "border-line hover:border-line-strong",
                      disabled
                        ? "pointer-events-none opacity-60"
                        : "cursor-grab active:cursor-grabbing",
                    )}
                  >
                    {isDragging ? (
                      <div className="flex w-full flex-col items-center justify-center gap-1.5 p-6 text-center">
                        <span
                          lang="en"
                          className="ui-figure text-[15px] text-fg-subtle"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="ui-label text-fg-muted">
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
              className="pointer-events-none fixed z-200 flex overflow-hidden rounded-xl border border-brand bg-surface shadow-lg"
              style={{
                left: ghost.x,
                top: ghost.y,
                width: ghost.width,
                height: ghost.height,
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
