"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoReceiptOutline } from "react-icons/io5";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  Badge,
  ButtonLink,
  EmptyState,
  SearchInput,
  Toolbar,
} from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { useMenuOrdersPage } from "@/hooks/useMenuOrdersPage";
import OrderDetailsModal from "./OrderDetailsModal";
import OrdersCardGrid from "./OrdersCardGrid";
import OrdersFilters from "./OrdersFilters";

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

      <PageTitleWithHelp
        id="onboarding-orders-header"
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

      <div id="onboarding-orders-search">
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
