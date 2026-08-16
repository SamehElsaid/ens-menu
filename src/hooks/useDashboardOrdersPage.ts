"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenusActivitySocket } from "@/hooks/useMenuActivitySocket";
import {
  collectChangedOrderIds,
  mergeOrderEntries,
  type CallEntryDetail,
  type DashboardOrdersPayload,
} from "@/lib/tableOrders";
import { orderEndpoints } from "@/api/endpoints/orders";
import {
  useOrdersPageCore,
  type OrdersPageCoreStrategy,
} from "@/hooks/useOrdersPageCore";

export type DashboardOrdersChannel = "table" | "delivery";

export function useDashboardOrdersPage(channel: DashboardOrdersChannel) {
  const searchParams = useSearchParams();
  const menuFilter = searchParams.get("menuId") ?? "";
  const strategy = useMemo<
    OrdersPageCoreStrategy<
      DashboardOrdersPayload,
      { entry: CallEntryDetail }
    >
  >(
    () => ({
      scope: "account",
      enabled: true,
      extraFilterActive: menuFilter.length > 0,
      augmentListParams: (params) => {
        params.channel = channel;
        if (menuFilter) params.menuId = menuFilter;
      },
      requestList: (locale, params) =>
        axiosGet(
          orderEndpoints.account.list(),
          locale,
          undefined,
          params,
        ),
      parseList: (payload, previous, silent) => {
        const fresh = payload.entries ?? payload.calls ?? [];
        return {
          entries: silent ? mergeOrderEntries(previous, fresh) : fresh,
          totalPages: payload.totalPages ?? 1,
          menus: payload.menus ?? [],
          changedIds: silent
            ? collectChangedOrderIds(previous, fresh)
            : undefined,
        };
      },
      requestDetail: (locale, entryId) =>
        axiosGet(orderEndpoints.account.detail(entryId), locale),
      parseDetail: (payload) => payload.entry,
      useUpdates: ({ menuIds, onUpdate }) => {
        useMenusActivitySocket(menuIds, onUpdate);
      },
    }),
    [channel, menuFilter],
  );
  const core = useOrdersPageCore(strategy);
  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const setMenuFilter = useCallback(
    (value: string) => {
      core.replaceQuery((params) => {
        if (value) params.set("menuId", value);
        else params.delete("menuId");
      });
      core.setPage(1);
    },
    [core],
  );
  const clearFilters = useCallback(() => {
    core.clearFilters();
    setMenuFilter("");
  }, [core, setMenuFilter]);

  return {
    menus: core.menus,
    menuFilter,
    setMenuFilter,
    modalMenuId:
      core.modalEntry?.menuId != null ? String(core.modalEntry.menuId) : "",
    isFreePlan,
    entries: core.entries,
    changedIds: core.changedIds,
    loading: core.loading,
    page: core.page,
    setPage: core.setPage,
    totalPages: core.totalPages,
    searchInput: core.searchInput,
    setSearchInput: core.setSearchInput,
    dateFrom: core.dateFrom,
    setDateFrom: core.setDateFrom,
    dateTo: core.dateTo,
    setDateTo: core.setDateTo,
    statusFilter: core.statusFilter,
    setStatusFilter: core.setStatusFilter,
    clearFilters,
    pendingCount: core.pendingCount,
    isFiltered: core.isFiltered,
    openModal: core.openModal,
    closeModal: core.closeModal,
    showModal: core.showModal,
    modalEntry: core.modalEntry,
    modalLoading: core.modalLoading,
    handleActionComplete: core.handleActionComplete,
    handleItemsUpdated: core.handleItemsUpdated,
  };
}
