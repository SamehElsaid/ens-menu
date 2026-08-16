"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OrderStatusFilter } from "@/components/Dashboard/orders/OrdersFilters";
import {
  applyLocalEntryStatusUpdate,
  countPendingOrders,
  type CallEntry,
  type CallEntryDetail,
  type CallItem,
  type OrderActionResult,
  type OrderStatus,
} from "@/lib/tableOrders";

export const ORDERS_PAGE_SIZE = 12;
export type OrdersPageScope = "account" | "menu";

export function useOrdersFilterState(extraFilterActive = false) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFromState] = useState("");
  const [dateTo, setDateToState] = useState("");
  const [statusFilter, setStatusFilterState] =
    useState<OrderStatusFilter>("all");

  useEffect(() => {
    const id = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch !== debouncedSearch) {
        setDebouncedSearch(nextSearch);
        setPage(1);
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchInput, debouncedSearch]);

  const setDateFrom = useCallback((value: string) => {
    setDateFromState(value);
    setPage(1);
  }, []);
  const setDateTo = useCallback((value: string) => {
    setDateToState(value);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((value: OrderStatusFilter) => {
    setStatusFilterState(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setDateFromState("");
    setDateToState("");
    setStatusFilterState("all");
    setSearchInput("");
  }, []);

  return {
    page,
    setPage,
    totalPages,
    setTotalPages,
    searchInput,
    setSearchInput,
    debouncedSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    clearFilters,
    isFiltered:
      extraFilterActive ||
      debouncedSearch.length > 0 ||
      dateFrom.length > 0 ||
      dateTo.length > 0 ||
      statusFilter !== "all",
  };
}

export function useOrderModalNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const entryParam = searchParams.get("entry");

  const replaceQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(Array.from(searchParams.entries()));
      mutate(next);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const openModal = useCallback(
    (id: string) => replaceQuery((params) => params.set("entry", id)),
    [replaceQuery],
  );
  const closeModal = useCallback(
    () => replaceQuery((params) => params.delete("entry")),
    [replaceQuery],
  );

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && entryParam) closeModal();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [closeModal, entryParam]);

  return { entryParam, openModal, closeModal, replaceQuery };
}

export function useOrderEntriesState(scope: OrdersPageScope) {
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [modalEntry, setModalEntry] = useState<CallEntryDetail | null>(null);
  const entriesRef = useRef<CallEntry[]>([]);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const pendingCount = useMemo(() => countPendingOrders(entries), [entries]);

  const handleActionComplete = useCallback(
    (result: OrderActionResult) => {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === result.entryId
            ? applyLocalEntryStatusUpdate(entry, result.status, {
                clearPendingGuestAddition: result.clearPendingGuestAddition,
              })
            : entry,
        ),
      );
      setModalEntry((current) => {
        if (!current || String(current.id) !== result.entryId) return current;
        const clearBill =
          scope === "menu" &&
          (result.status === "delivered" || result.status === "cancelled");
        return {
          ...current,
          ...(result.clearPendingGuestAddition
            ? { pendingGuestAddition: false }
            : {}),
          ...(clearBill ? { pendingBillRequest: false } : {}),
          order: current.order
            ? {
                ...current.order,
                status: result.status,
                ...(result.clearPendingGuestAddition
                  ? { pendingGuestAddition: false }
                  : {}),
                ...(clearBill ? { pendingBillRequest: false } : {}),
              }
            : current.order,
          actions: [
            ...(current.actions ?? []),
            { status: result.status, time: new Date().toISOString() },
          ],
        };
      });
    },
    [scope],
  );

  const handleItemsUpdated = useCallback(
    (
      entryId: string,
      items: CallItem[],
      orderTotal: number,
      status: OrderStatus,
    ) => {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === entryId ? { ...entry, items, totalPrice: orderTotal } : entry,
        ),
      );
      setModalEntry((current) => {
        if (!current || String(current.id) !== entryId) return current;
        return {
          ...current,
          items,
          totalPrice: orderTotal,
          order: current.order
            ? { ...current.order, items, orderTotal, status }
            : current.order,
        };
      });
    },
    [],
  );

  return {
    entries,
    setEntries,
    entriesRef,
    modalEntry,
    setModalEntry,
    pendingCount,
    handleActionComplete,
    handleItemsUpdated,
  };
}
