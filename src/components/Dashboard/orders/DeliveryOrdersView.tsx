"use client";

import { useLocale } from "next-intl";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import { useAppSelector } from "@/store/hooks";
import { useMenuOrdersPage } from "@/hooks/useMenuOrdersPage";
import DeliveryOrderDetailsModal from "./DeliveryOrderDetailsModal";
import DeliveryOrdersCardGrid from "./DeliveryOrdersCardGrid";
import OrdersFilters from "./OrdersFilters";
import {
  OrdersPageHeader,
  OrdersSearchToolbar,
} from "./OrdersPageChrome";

export default function DeliveryOrdersView() {
  const locale = useLocale();
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  const {
    menuId,
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
  } = useMenuOrdersPage("delivery");

  return (
    <div className="flex flex-col gap-4">
      <NotificationPermissionCard />

      <OrdersPageHeader
        id="onboarding-delivery-orders-header"
        translationNs="deliveryOrders"
        pendingCount={pendingCount}
      />

      <div id="onboarding-delivery-orders-search">
        <OrdersSearchToolbar
          translationNs="deliveryOrders"
          value={searchInput}
          onChange={setSearchInput}
        />
      </div>

      <OrdersFilters
        translationNs="deliveryOrders"
        dateFrom={dateFrom}
        dateTo={dateTo}
        statusFilter={statusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={isFiltered}
      />

      <DeliveryOrdersCardGrid
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
        <DeliveryOrderDetailsModal
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
