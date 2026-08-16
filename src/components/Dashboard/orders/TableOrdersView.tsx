"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoReceiptOutline } from "react-icons/io5";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import {
  ButtonLink,
  EmptyState,
} from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { useMenuOrdersPage } from "@/hooks/useMenuOrdersPage";
import OrderDetailsModal from "./OrderDetailsModal";
import OrdersCardGrid from "./OrdersCardGrid";
import OrdersFilters from "./OrdersFilters";
import {
  OrdersPageHeader,
  OrdersSearchToolbar,
} from "./OrdersPageChrome";

export default function TableOrdersView() {
  const t = useTranslations("tableOrders");
  const locale = useLocale();
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  const {
    menuId,
    tableOrderingEnabled,
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
    handleItemsUpdated,
  } = useMenuOrdersPage("table");

  if (!tableOrderingEnabled) {
    return (
      <div id="onboarding-orders-upgrade">
        <EmptyState
          icon={<IoReceiptOutline />}
          title={t("proOnlyTitle")}
          description={t("proOnlyDescription")}
          action={
            <ButtonLink href={`/dashboard/${menuId}/subscription`}>
              {t("upgradeShort")}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotificationPermissionCard />

      <OrdersPageHeader
        id="onboarding-orders-header"
        translationNs="tableOrders"
        pendingCount={pendingCount}
      />

      <div id="onboarding-orders-search">
        <OrdersSearchToolbar
          translationNs="tableOrders"
          value={searchInput}
          onChange={setSearchInput}
        />
      </div>

      <OrdersFilters
        translationNs="tableOrders"
        dateFrom={dateFrom}
        dateTo={dateTo}
        statusFilter={statusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={isFiltered}
      />

      <OrdersCardGrid
        entries={entries}
        loading={loading}
        locale={locale}
        currency={currency}
        menuId={menuId}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isFiltered={isFiltered}
        onView={openModal}
        onActionComplete={handleActionComplete}
      />

      {showModal && (
        <OrderDetailsModal
          entry={modalEntry}
          loading={modalLoading}
          currency={currency}
          onClose={closeModal}
          menuId={menuId}
          onActionComplete={handleActionComplete}
          onItemsUpdated={handleItemsUpdated}
        />
      )}
    </div>
  );
}
