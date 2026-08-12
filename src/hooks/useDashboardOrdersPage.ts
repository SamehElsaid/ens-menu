"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenusActivitySocket } from "@/hooks/useMenuActivitySocket";
import type { OrderStatusFilter } from "@/components/Dashboard/orders/OrdersFilters";
import {
  applyLocalEntryStatusUpdate,
  collectChangedOrderIds,
  countPendingOrders,
  mergeOrderEntries,
  type CallEntry,
  type CallEntryDetail,
  type CallItem,
  type DashboardOrdersPayload,
  type OrderActionResult,
  type OrderStatus,
  type OrdersMenuOption,
} from "@/lib/tableOrders";

const PAGE_SIZE = 12;

/** Just past the 1200ms border flash, so the class is gone by the time a second
    update on the same ticket needs to restart it. */
const FLASH_MS = 1300;

const NO_CHANGES: ReadonlySet<string> = new Set();

export type DashboardOrdersChannel = "table" | "delivery";

/**
 * Account-level orders: one list across every menu the actor may see, with the
 * menu filter kept in the URL so a filtered view survives a refresh and can be
 * shared as a link.
 */
export function useDashboardOrdersPage(channel: DashboardOrdersChannel) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [menus, setMenus] = useState<OrdersMenuOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [modalEntry, setModalEntry] = useState<CallEntryDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);
  const pendingCount = useMemo(() => countPendingOrders(entries), [entries]);
  const entryParam = searchParams.get("entry");
  const menuFilter = searchParams.get("menuId") ?? "";

  const isFiltered =
    debouncedSearch.length > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0 ||
    statusFilter !== "all" ||
    menuFilter.length > 0;

  const replaceQuery = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      mutate(sp);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const openModal = useCallback(
    (id: string) => replaceQuery((sp) => sp.set("entry", id)),
    [replaceQuery],
  );

  const closeModal = useCallback(() => {
    replaceQuery((sp) => sp.delete("entry"));
    setModalEntry(null);
  }, [replaceQuery]);

  const setMenuFilter = useCallback(
    (value: string) => {
      replaceQuery((sp) => {
        if (value) sp.set("menuId", value);
        else sp.delete("menuId");
      });
      setPage(1);
    },
    [replaceQuery],
  );

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filterBaseline = useRef<string | null>(null);
  const filterSignature = `${debouncedSearch}|${dateFrom}|${dateTo}|${statusFilter}`;
  useEffect(() => {
    if (filterBaseline.current === null) {
      filterBaseline.current = filterSignature;
      return;
    }
    if (filterBaseline.current !== filterSignature) {
      filterBaseline.current = filterSignature;
      setPage(1);
    }
  }, [filterSignature]);

  /* The visible list, readable without making `fetchOrders` depend on it —
     otherwise every arriving order would rebuild the fetcher and re-run the
     effect that calls it. */
  const entriesRef = useRef<CallEntry[]>([]);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const [changedIds, setChangedIds] =
    useState<ReadonlySet<string>>(NO_CHANGES);
  const flashTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flashChanged = useCallback((ids: Set<string>) => {
    if (ids.size === 0) return;
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    setChangedIds(ids);
    flashTimer.current = window.setTimeout(() => {
      flashTimer.current = null;
      setChangedIds(NO_CHANGES);
    }, FLASH_MS);
  }, []);

  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const paramsQ: Record<string, unknown> = {
          page,
          limit: PAGE_SIZE,
          channel,
        };
        if (debouncedSearch.length > 0) paramsQ.q = debouncedSearch;
        if (dateFrom) paramsQ.dateFrom = dateFrom;
        if (dateTo) paramsQ.dateTo = dateTo;
        if (statusFilter !== "all") paramsQ.status = statusFilter;
        if (menuFilter) paramsQ.menuId = menuFilter;

        const result = await axiosGet<DashboardOrdersPayload>(
          "/dashboard/orders",
          locale,
          undefined,
          paramsQ,
        );

        if (result.status && result.data) {
          const p = result.data;
          const fresh = p.entries ?? p.calls ?? [];
          if (silent) flashChanged(collectChangedOrderIds(entriesRef.current, fresh));
          setEntries((prev) =>
            silent ? mergeOrderEntries(prev, fresh) : fresh,
          );
          setTotalPages(Math.max(1, p.totalPages ?? 1));
          setMenus(p.menus ?? []);
        } else if (!silent) {
          setEntries([]);
          setTotalPages(1);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      locale,
      page,
      debouncedSearch,
      dateFrom,
      dateTo,
      statusFilter,
      menuFilter,
      channel,
      flashChanged,
    ],
  );

  useEffect(() => {
    void fetchOrders(false);
  }, [fetchOrders]);

  const handleSocketUpdate = useCallback(() => {
    void fetchOrders(true);
  }, [fetchOrders]);

  // Watch every menu in scope, not just the filtered one, so clearing the
  // filter never shows stale rows.
  const socketMenuIds = useMemo(() => menus.map((m) => m.id), [menus]);
  useMenusActivitySocket(socketMenuIds, handleSocketUpdate);

  const handleActionComplete = useCallback((result: OrderActionResult) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === result.entryId
          ? applyLocalEntryStatusUpdate(entry, result.status, {
              clearPendingGuestAddition: result.clearPendingGuestAddition,
            })
          : entry,
      ),
    );
    setModalEntry((prev) => {
      if (!prev || String(prev.id) !== result.entryId) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        ...(result.clearPendingGuestAddition
          ? { pendingGuestAddition: false }
          : {}),
        order: prev.order
          ? {
              ...prev.order,
              status: result.status,
              ...(result.clearPendingGuestAddition
                ? { pendingGuestAddition: false }
                : {}),
            }
          : prev.order,
        actions: [...(prev.actions ?? []), { status: result.status, time: now }],
      };
    });
  }, []);

  const handleItemsUpdated = useCallback(
    (
      entryId: string,
      items: CallItem[],
      orderTotal: number,
      status: OrderStatus,
    ) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, items, totalPrice: orderTotal }
            : entry,
        ),
      );
      setModalEntry((prev) => {
        if (!prev || String(prev.id) !== entryId) return prev;
        return {
          ...prev,
          items,
          totalPrice: orderTotal,
          order: prev.order
            ? { ...prev.order, items, orderTotal, status }
            : prev.order,
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (!entryParam) {
      setModalEntry(null);
      return;
    }

    let cancelled = false;
    setModalLoading(true);

    axiosGet<{ entry: CallEntryDetail }>(
      `/dashboard/orders/${entryParam}`,
      locale,
    )
      .then((result) => {
        if (cancelled) return;
        if (result.status && result.data?.entry) {
          setModalEntry(result.data.entry);
        }
        setModalLoading(false);
      })
      .catch(() => {
        if (!cancelled) setModalLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entryParam, locale]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && entryParam) closeModal();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [entryParam, closeModal]);

  const showModal =
    Boolean(entryParam) && (modalLoading || Boolean(modalEntry));

  const clearFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setSearchInput("");
    setMenuFilter("");
  }, [setMenuFilter]);

  const modalMenuId =
    modalEntry?.menuId != null ? String(modalEntry.menuId) : "";

  return {
    menus,
    menuFilter,
    setMenuFilter,
    modalMenuId,
    isFreePlan,
    entries,
    /** Ids a socket update just changed, for the 1.2s border flash. */
    changedIds,
    loading,
    page,
    setPage,
    totalPages,
    searchInput,
    setSearchInput,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    clearFilters,
    pendingCount,
    isFiltered,
    openModal,
    closeModal,
    showModal,
    modalEntry,
    modalLoading,
    handleActionComplete,
    handleItemsUpdated,
  };
}
