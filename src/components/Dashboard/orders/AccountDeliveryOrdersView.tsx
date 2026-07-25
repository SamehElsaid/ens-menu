"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
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
  const isRTL = locale === "ar";

  const {
    menus,
    menuFilter,
    setMenuFilter,
    modalMenuId,
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
  } = useDashboardOrdersPage("delivery");

  const menuOptions = useMemo(
    () => menus.map((menu) => ({ id: menu.id, label: localizedMenuName(menu, locale) })),
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
    <div className="space-y-6 animate-fadeIn">
      <NotificationPermissionCard />

      <header className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-linear-to-br from-emerald-50 via-teal-50/80 to-white p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-slate-900 md:p-8">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-linear-to-br from-emerald-400/20 to-teal-400/10 blur-2xl dark:from-emerald-500/15 dark:to-teal-500/10"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <MdOutlineDeliveryDining className="text-2xl" aria-hidden />
            </div>
            <div>
              <PageTitleWithHelp>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  {t("title")}
                </h1>
              </PageTitleWithHelp>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                {t("subtitle")}
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-300/60 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50">
              {t("pendingBadge", { count: pendingCount })}
            </span>
          )}
        </div>

        <div className="relative mt-6">
          <label htmlFor="account-delivery-orders-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500 dark:text-emerald-400 ${isRTL ? "end-3" : "start-3"}`}
            aria-hidden
          />
          <input
            id="account-delivery-orders-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`w-full rounded-xl border border-emerald-200/90 bg-white/90 py-3 text-sm text-slate-900 shadow-inner shadow-emerald-500/5 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/35 dark:border-emerald-500/30 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/25 ${isRTL ? "pe-11 ps-4" : "ps-11 pe-4"}`}
            autoComplete="off"
          />
        </div>

        <OrdersFilters
          translationNs="deliveryOrders"
          theme="emerald"
          dateFrom={dateFrom}
          dateTo={dateTo}
          statusFilter={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={isFiltered}
          isRTL={isRTL}
          menus={menuOptions}
          menuFilter={menuFilter}
          onMenuFilterChange={setMenuFilter}
        />
      </header>

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
    </div>
  );
}
