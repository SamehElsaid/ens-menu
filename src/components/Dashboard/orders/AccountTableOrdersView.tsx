"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoReceiptOutline } from "react-icons/io5";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  Badge,
  ButtonLink,
  EmptyState,
  PageShell,
  SearchInput,
  Toolbar,
} from "@/components/ui";
import {
  useDashboardMenus,
  localizedMenuName,
} from "@/hooks/useDashboardMenus";
import { useDashboardOrdersPage } from "@/hooks/useDashboardOrdersPage";
import type { OrderMenuBadges } from "@/lib/tableOrders";
import OrderDetailsModal from "./OrderDetailsModal";
import OrdersCardGrid from "./OrdersCardGrid";
import OrdersFilters from "./OrdersFilters";

/** Table orders across every menu of the account, filterable by menu. */
export default function AccountTableOrdersView() {
  const t = useTranslations("tableOrders");
  const locale = useLocale();

  const { menus: accountMenus, loading: menusLoading } = useDashboardMenus();

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
  } = useDashboardOrdersPage("table");

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

  // Every menu on the account is on a plan without table ordering.
  const noMenuSupportsTableOrders =
    !menusLoading &&
    accountMenus.length > 0 &&
    accountMenus.every((menu) => !menu.capabilities.tableOrderingQr);

  if (noMenuSupportsTableOrders) {
    return (
      <EmptyState
        icon={<IoReceiptOutline />}
        title={t("proOnlyTitle")}
        description={t("proOnlyDescription")}
        action={
          <ButtonLink href="/dashboard/subscription">
            {t("upgradeShort")}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <PageShell
      kind="wide"
      /* The page states itself once, in the standard header, and the count of
         orders still waiting is the one piece of status that belongs beside the
         title. The previous version wrapped all of this in a bordered hero with
         its own icon tile, which made the orders below look like a secondary
         region of the page they are the entire point of. */
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
      /* Only the search field is pinned. The date range and status row is tall
         enough that sticking it would cost a third of the viewport on every
         scroll, and it is set once per session rather than typed into. */
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
        translationNs="tableOrders"
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

      <OrdersCardGrid
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
        <OrderDetailsModal
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
