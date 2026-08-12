"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { Badge, PageShell, SearchInput, Toolbar } from "@/components/ui";
import { localizedMenuName } from "@/hooks/useDashboardMenus";
import { useDashboardOrdersPage } from "@/hooks/useDashboardOrdersPage";
import type { OrderMenuBadges } from "@/lib/tableOrders";
import DeliveryOrderDetailsModal from "./DeliveryOrderDetailsModal";
import DeliveryOrdersCardGrid from "./DeliveryOrdersCardGrid";
import OrdersFilters from "./OrdersFilters";

/** Online (delivery) orders across every menu of the account. */
export default function AccountDeliveryOrdersView() {
  const t = useTranslations("deliveryOrders");
  const locale = useLocale();

  const {
    menus,
    menuFilter,
    setMenuFilter,
    modalMenuId,
    entries,
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
  } = useDashboardOrdersPage("delivery");

  const menuOptions = useMemo(
    () =>
      menus.map((menu) => ({
        id: menu.id,
        label: localizedMenuName(menu, locale),
      })),
    [menus, locale],
  );

  const menuBadges = useMemo<OrderMenuBadges>(() => {
    const badges: OrderMenuBadges = {};
    for (const menu of menus) {
      badges[menu.id] = {
        label: localizedMenuName(menu, locale),
        currency: menu.currency ?? "",
      };
    }
    return badges;
  }, [menus, locale]);

  const modalCurrency = modalEntry?.menuId
    ? (menuBadges[modalEntry.menuId]?.currency ?? "")
    : "";

  return (
    <PageShell
      kind="wide"
      /* Delivery and table orders are the same job on two channels, so they now
         share one chrome — including the shell. The emerald gradient hero this
         replaces made them look like two different products, and spent a
         blurred orb and two shadows saying what the sidebar already says. */
      header={
        <PageTitleWithHelp
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
      }
      toolbar={
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
      }
    >
      <NotificationPermissionCard />

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
        menus={menuOptions}
        menuFilter={menuFilter}
        onMenuFilterChange={setMenuFilter}
      />

      <DeliveryOrdersCardGrid
        entries={entries}
        loading={loading}
        locale={locale}
        currency=""
        menuBadges={menuBadges}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isFiltered={isFiltered}
        changedIds={changedIds}
        onView={openModal}
        onActionComplete={handleActionComplete}
      />

      {showModal && (
        <DeliveryOrderDetailsModal
          entry={modalEntry}
          loading={modalLoading}
          currency={modalCurrency}
          onClose={closeModal}
          menuId={modalMenuId}
          onActionComplete={handleActionComplete}
          onItemsUpdated={handleItemsUpdated}
        />
      )}
    </PageShell>
  );
}
