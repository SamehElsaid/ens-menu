"use client";

import { useLocale, useTranslations } from "next-intl";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { Badge, SearchInput, Toolbar } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { useMenuOrdersPage } from "@/hooks/useMenuOrdersPage";
import DeliveryOrderDetailsModal from "./DeliveryOrderDetailsModal";
import DeliveryOrdersCardGrid from "./DeliveryOrdersCardGrid";
import OrdersFilters from "./OrdersFilters";

export default function DeliveryOrdersView() {
  const t = useTranslations("deliveryOrders");
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

      <PageTitleWithHelp
        id="onboarding-delivery-orders-header"
        title={t("title")}
        description={t("subtitle")}
        meta={
          pendingCount > 0 ? (
            <Badge tone="warning">
              {t("pendingBadge", { count: pendingCount })}
            </Badge>
          ) : undefined
        }
      />

      <div id="onboarding-delivery-orders-search">
        <Toolbar
          search={
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder={t("searchPlaceholder")}
              label={t("searchPlaceholder")}
            />
          }
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
