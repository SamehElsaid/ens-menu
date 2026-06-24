"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenuActivitySocket } from "@/hooks/useMenuActivitySocket";
import { playNewOrderNotificationSound } from "@/lib/orderNotificationSound";
import type { OrderStatusFilter } from "@/components/Dashboard/orders/OrdersFilters";
import {
  applyLocalEntryStatusUpdate,
  countPendingOrders,
  mergeOrderEntries,
  type ActivityCallsPayload,
  type CallEntry,
  type CallEntryDetail,
  type OrderActionResult,
} from "@/lib/tableOrders";

const PAGE_SIZE = 12;

export type MenuOrdersChannel = "table" | "delivery";

export function useMenuOrdersPage(channel: MenuOrdersChannel) {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [entries, setEntries] = useState<CallEntry[]>([]);
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
  const isFiltered =
    debouncedSearch.length > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0 ||
    statusFilter !== "all";
  const entryParam = searchParams.get("entry");

  const openModal = useCallback(
    (id: string) => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      sp.set("entry", id);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const closeModal = useCallback(() => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.delete("entry");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setModalEntry(null);
  }, [router, pathname, searchParams]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const searchBaseline = useRef<string | null>(null);
  useEffect(() => {
    if (searchBaseline.current === null) {
      searchBaseline.current = debouncedSearch;
      return;
    }
    if (searchBaseline.current !== debouncedSearch) {
      searchBaseline.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  const filterBaseline = useRef<string | null>(null);
  const filterSignature = `${dateFrom}|${dateTo}|${statusFilter}`;
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

  const fetchLogs = useCallback(
    async (silent = false) => {
      if (!menuId || (channel !== "delivery" && isFreePlan)) {
        setLoading(false);
        return;
      }
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

        const result = await axiosGet<ActivityCallsPayload>(
          `/menus/${menuId}/activity-logs`,
          locale,
          undefined,
          paramsQ,
        );

        if (result.status && result.data) {
          const p = result.data;
          const fresh = p.entries ?? p.calls ?? [];
          setEntries((prev) =>
            silent ? mergeOrderEntries(prev, fresh) : fresh,
          );
          setTotalPages(Math.max(1, p.totalPages ?? 1));
        } else if (!silent) {
          setEntries([]);
          setTotalPages(1);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [menuId, locale, page, debouncedSearch, dateFrom, dateTo, statusFilter, isFreePlan, channel],
  );

  useEffect(() => {
    void fetchLogs(false);
  }, [fetchLogs]);

  const handleSocketUpdate = useCallback(() => {
    void fetchLogs(true);
  }, [fetchLogs]);

  useMenuActivitySocket(
    channel !== "delivery" && isFreePlan ? "" : menuId,
    handleSocketUpdate,
  );

  const handleActionComplete = useCallback((result: OrderActionResult) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === result.entryId
          ? applyLocalEntryStatusUpdate(entry, result.status)
          : entry,
      ),
    );
    setModalEntry((prev) => {
      if (!prev || String(prev.id) !== result.entryId) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        order: prev.order
          ? { ...prev.order, status: result.status }
          : prev.order,
        actions: [
          ...(prev.actions ?? []),
          { status: result.status, time: now },
        ],
      };
    });
  }, []);

  useEffect(() => {
    if (!entryParam || !menuId) {
      setModalEntry(null);
      return;
    }

    let cancelled = false;
    setModalLoading(true);

    axiosGet<{ entry: CallEntryDetail } | CallEntryDetail>(
      `/menus/${menuId}/activity-logs/${entryParam}`,
      locale,
    )
      .then((result) => {
        if (cancelled) return;
        if (result.status && result.data) {
          const raw = result.data as Record<string, unknown>;
          const resolved = (raw.entry ?? raw) as CallEntryDetail;
          setModalEntry(resolved);
        }
        setModalLoading(false);
      })
      .catch(() => {
        if (!cancelled) setModalLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entryParam, menuId, locale]);

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
  }, []);

  return {
    menuId,
    isFreePlan,
    entries,
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
  };
}
