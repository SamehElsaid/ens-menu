"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { axiosGet } from "@/shared/axiosCall";
import type { Item } from "@/types/Menu";
import type { DisplayOrderRow } from "@/components/Dashboard/DisplayOrderList";

/** Matches public menu catalog page size. */
export const DISPLAY_ORDER_PAGE_SIZE = 30;

type ItemsPagePayload = {
  items?: Item[];
  pagination?: {
    page?: number;
    limit?: number;
    totalPages?: number;
    totalItems?: number;
    total?: number;
  };
};

type MapItemToRow = (item: Item) => DisplayOrderRow;

function mergeRowsById(
  current: DisplayOrderRow[],
  incoming: DisplayOrderRow[],
): DisplayOrderRow[] {
  if (!incoming.length) return current;
  const byId = new Map(current.map((row) => [row.id, row]));
  for (const row of incoming) {
    byId.set(row.id, row);
  }
  // Keep existing order, append only newly seen ids (catalog append behaviour).
  const seen = new Set(current.map((row) => row.id));
  const appended = incoming.filter((row) => !seen.has(row.id));
  return [...current, ...appended];
}

function resolveHasMore(
  page: number,
  pageSize: number,
  itemCount: number,
  pagination?: ItemsPagePayload["pagination"],
): boolean {
  const totalPages = pagination?.totalPages;
  if (typeof totalPages === "number") {
    return page < totalPages;
  }
  const total = pagination?.totalItems ?? pagination?.total;
  if (typeof total === "number") {
    return page * pageSize < total;
  }
  return itemCount >= pageSize;
}

/**
 * Dashboard equivalent of public `useMenuCatalogPagination`:
 * first page on category change, then infinite scroll (+ eager prefetch).
 */
export function useDisplayOrderItemsPagination({
  menuId,
  locale,
  categoryId,
  mapItem,
  enabled = true,
}: {
  menuId: string;
  locale: string;
  /** `0` = all products (no category filter). */
  categoryId: number | null;
  mapItem: MapItemToRow;
  enabled?: boolean;
}) {
  const [rows, setRows] = useState<DisplayOrderRow[]>([]);
  const [savedRows, setSavedRows] = useState<DisplayOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(0);
  const requestIdRef = useRef(0);
  const eagerLoadRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadNextPageRef = useRef<() => Promise<void>>(async () => {});
  const mapItemRef = useRef(mapItem);

  mapItemRef.current = mapItem;
  hasMoreRef.current = hasMore;
  pageRef.current = page;

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    loadingRef.current = false;
    eagerLoadRef.current = false;
    setLoading(false);
    setRows([]);
    setSavedRows([]);
    setPage(0);
    setHasMore(false);
    pageRef.current = 0;
    hasMoreRef.current = false;
  }, []);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      if (!menuId) return null;

      const categoryParam =
        categoryId && categoryId > 0
          ? `&categoryId=${encodeURIComponent(String(categoryId))}`
          : "";

      const result = await axiosGet<ItemsPagePayload>(
        `/menus/${menuId}/items?page=${nextPage}&limit=${DISPLAY_ORDER_PAGE_SIZE}${categoryParam}`,
        locale,
      );

      if (!result.status || !result.data) return null;

      const list = result.data.items ?? [];
      return {
        items: list.map((item) => mapItemRef.current(item)),
        hasMore: resolveHasMore(
          nextPage,
          DISPLAY_ORDER_PAGE_SIZE,
          list.length,
          result.data.pagination,
        ),
      };
    },
    [menuId, locale, categoryId],
  );

  const loadNextPage = useCallback(async () => {
    if (!enabled || categoryId == null || loadingRef.current || !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    const requestId = ++requestIdRef.current;
    const nextPage = pageRef.current + 1;

    try {
      const result = await fetchPage(nextPage);
      if (requestId !== requestIdRef.current) return;

      if (!result) {
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }

      setRows((current) => mergeRowsById(current, result.items));
      setSavedRows((current) => mergeRowsById(current, result.items));
      setPage(nextPage);
      pageRef.current = nextPage;
      setHasMore(result.hasMore);
      hasMoreRef.current = result.hasMore;
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [enabled, categoryId, fetchPage]);

  loadNextPageRef.current = loadNextPage;

  const loadInitial = useCallback(async () => {
    if (!enabled || !menuId || categoryId == null) {
      reset();
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    eagerLoadRef.current = false;
    loadingRef.current = true;
    setLoading(true);
    setRows([]);
    setSavedRows([]);
    setPage(0);
    pageRef.current = 0;
    setHasMore(false);
    hasMoreRef.current = false;

    try {
      const result = await fetchPage(1);
      if (requestId !== requestIdRef.current) return;

      if (!result) {
        setRows([]);
        setSavedRows([]);
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }

      setRows(result.items);
      setSavedRows(result.items);
      setPage(1);
      pageRef.current = 1;
      setHasMore(result.hasMore);
      hasMoreRef.current = result.hasMore;
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [enabled, menuId, categoryId, fetchPage, reset]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // Eager-load page 2 once first page lands (same idea as catalog "All" prefetch).
  useEffect(() => {
    if (
      !enabled ||
      categoryId == null ||
      !hasMore ||
      page !== 1 ||
      loading ||
      eagerLoadRef.current
    ) {
      return;
    }
    eagerLoadRef.current = true;
    void loadNextPageRef.current();
  }, [enabled, categoryId, hasMore, page, loading]);

  useEffect(() => {
    if (!hasMore || !enabled) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }

    let cancelled = false;

    const attachObserver = () => {
      if (cancelled) return;
      const element = sentinelRef.current;
      if (!element) {
        requestAnimationFrame(attachObserver);
        return;
      }

      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (
            !entry?.isIntersecting ||
            loadingRef.current ||
            !hasMoreRef.current
          ) {
            return;
          }
          void loadNextPageRef.current();
        },
        {
          root: null,
          rootMargin: "400px 0px",
          threshold: 0,
        },
      );
      observerRef.current.observe(element);
    };

    attachObserver();

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [hasMore, enabled, categoryId]);

  const markSaved = useCallback((next: DisplayOrderRow[]) => {
    setSavedRows(next);
  }, []);

  const initialLoading = loading && rows.length === 0;
  const loadingMore = loading && rows.length > 0;

  return {
    rows,
    setRows,
    savedRows,
    markSaved,
    loading,
    initialLoading,
    loadingMore,
    hasMore,
    loadMore: loadNextPage,
    sentinelRef,
    reload: loadInitial,
  };
}
