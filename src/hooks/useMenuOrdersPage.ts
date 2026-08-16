"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useCurrentPlanCapabilities } from "@/hooks/useCurrentPlanCapabilities";
import { useMenuActivitySocket } from "@/hooks/useMenuActivitySocket";
import {
  mergeOrderEntries,
  type ActivityCallsPayload,
  type CallEntryDetail,
} from "@/lib/tableOrders";
import { orderEndpoints } from "@/api/endpoints/orders";
import {
  useOrdersPageCore,
  type OrdersPageCoreStrategy,
} from "@/hooks/useOrdersPageCore";

export type MenuOrdersChannel = "table" | "delivery";
type MenuOrderDetailPayload =
  | { entry: CallEntryDetail }
  | CallEntryDetail;

export function useMenuOrdersPage(channel: MenuOrdersChannel) {
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");
  const capabilities = useCurrentPlanCapabilities();
  const tableOrderingEnabled = capabilities.tableOrderingQr;
  const enabled =
    Boolean(menuId) && (channel !== "table" || tableOrderingEnabled);
  const strategy = useMemo<
    OrdersPageCoreStrategy<ActivityCallsPayload, MenuOrderDetailPayload>
  >(
    () => ({
      scope: "menu",
      enabled,
      augmentListParams: (query) => {
        query.channel = channel;
      },
      requestList: (locale, query) =>
        axiosGet(
          orderEndpoints.menu.list(menuId),
          locale,
          undefined,
          query,
        ),
      parseList: (payload, previous, silent) => {
        const fresh = payload.entries ?? payload.calls ?? [];
        return {
          entries: silent ? mergeOrderEntries(previous, fresh) : fresh,
          totalPages: payload.totalPages ?? 1,
        };
      },
      requestDetail: (locale, entryId) =>
        axiosGet(orderEndpoints.menu.detail(menuId, entryId), locale),
      parseDetail: (payload) => {
        const raw = payload as Record<string, unknown>;
        return (raw.entry ?? raw) as CallEntryDetail;
      },
      useUpdates: ({ onUpdate }) => {
        useMenuActivitySocket(enabled ? menuId : "", onUpdate);
      },
    }),
    [channel, enabled, menuId],
  );
  const core = useOrdersPageCore(strategy);
  const userData = useAppSelector((state) => state.auth.data);

  return {
    menuId,
    isFreePlan: isFreePlanUser(userData),
    tableOrderingEnabled,
    entries: core.entries,
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
    clearFilters: core.clearFilters,
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
