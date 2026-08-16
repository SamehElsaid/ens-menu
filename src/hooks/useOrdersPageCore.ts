"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { ApiResponse } from "@/shared/axiosCall";
import type {
  CallEntry,
  CallEntryDetail,
  OrdersMenuOption,
} from "@/lib/tableOrders";
import {
  ORDERS_PAGE_SIZE,
  type OrdersPageScope,
  useOrderEntriesState,
  useOrderModalNavigation,
  useOrdersFilterState,
} from "@/hooks/useOrdersPageShared";

const FLASH_MS = 1300;
const NO_CHANGES: ReadonlySet<string> = new Set();

interface ParsedOrdersPage {
  entries: CallEntry[];
  totalPages: number;
  menus?: OrdersMenuOption[];
  changedIds?: ReadonlySet<string>;
}

export interface OrdersPageCoreStrategy<TList, TDetail> {
  scope: OrdersPageScope;
  enabled: boolean;
  extraFilterActive?: boolean;
  augmentListParams: (params: Record<string, unknown>) => void;
  requestList: (
    locale: string,
    params: Record<string, unknown>,
  ) => Promise<ApiResponse<TList>>;
  parseList: (
    payload: TList,
    previous: CallEntry[],
    silent: boolean,
  ) => ParsedOrdersPage;
  requestDetail: (
    locale: string,
    entryId: string,
  ) => Promise<ApiResponse<TDetail>>;
  parseDetail: (payload: TDetail) => CallEntryDetail | null;
  useUpdates: (context: {
    menuIds: number[];
    onUpdate: () => void;
  }) => void;
}

export function useOrdersPageCore<TList, TDetail>(
  strategy: OrdersPageCoreStrategy<TList, TDetail>,
) {
  const locale = useLocale();
  const [menus, setMenus] = useState<OrdersMenuOption[]>([]);
  const [loading, setLoading] = useState(strategy.enabled);
  const [modalLoading, setModalLoading] = useState(false);
  const [changedIds, setChangedIds] =
    useState<ReadonlySet<string>>(NO_CHANGES);
  const flashTimer = useRef<number | null>(null);
  const filters = useOrdersFilterState(strategy.extraFilterActive);
  const orderState = useOrderEntriesState(strategy.scope);
  const modalNavigation = useOrderModalNavigation();
  const { setEntries, entriesRef, modalEntry, setModalEntry } = orderState;
  const {
    page,
    debouncedSearch,
    dateFrom,
    dateTo,
    statusFilter,
    setTotalPages,
  } = filters;

  useEffect(
    () => () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flashChanged = useCallback((ids: ReadonlySet<string>) => {
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
      if (!strategy.enabled) {
        if (!silent) setLoading(false);
        return;
      }
      try {
        if (!silent) setLoading(true);
        const params: Record<string, unknown> = {
          page,
          limit: ORDERS_PAGE_SIZE,
        };
        if (debouncedSearch) params.q = debouncedSearch;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        strategy.augmentListParams(params);
        const result = await strategy.requestList(locale, params);
        if (result.status && result.data) {
          const parsed = strategy.parseList(
            result.data,
            entriesRef.current,
            silent,
          );
          setEntries(parsed.entries);
          setTotalPages(Math.max(1, parsed.totalPages));
          if (parsed.menus) setMenus(parsed.menus);
          if (parsed.changedIds) flashChanged(parsed.changedIds);
        } else if (!silent) {
          setEntries([]);
          setTotalPages(1);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      entriesRef,
      dateFrom,
      dateTo,
      debouncedSearch,
      page,
      setTotalPages,
      statusFilter,
      flashChanged,
      locale,
      setEntries,
      strategy,
    ],
  );

  useEffect(() => {
    void fetchOrders(false);
  }, [fetchOrders]);

  const handleSocketUpdate = useCallback(() => {
    void fetchOrders(true);
  }, [fetchOrders]);
  strategy.useUpdates({
    menuIds: menus.map((menu) => menu.id),
    onUpdate: handleSocketUpdate,
  });

  useEffect(() => {
    if (!modalNavigation.entryParam || !strategy.enabled) {
      setModalEntry(null);
      return;
    }
    let cancelled = false;
    setModalLoading(true);
    void strategy
      .requestDetail(locale, modalNavigation.entryParam)
      .then((result) => {
        if (cancelled) return;
        if (result.status && result.data) {
          setModalEntry(strategy.parseDetail(result.data));
        }
      })
      .finally(() => {
        if (!cancelled) setModalLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    locale,
    modalNavigation.entryParam,
    setModalEntry,
    strategy,
  ]);

  const closeModal = useCallback(() => {
    modalNavigation.closeModal();
    setModalEntry(null);
  }, [modalNavigation, setModalEntry]);

  return {
    ...filters,
    ...orderState,
    menus,
    loading,
    changedIds,
    openModal: modalNavigation.openModal,
    closeModal,
    replaceQuery: modalNavigation.replaceQuery,
    showModal:
      Boolean(modalNavigation.entryParam) &&
      (modalLoading || Boolean(modalEntry)),
    modalLoading,
  };
}
