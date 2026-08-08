"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoReceiptOutline, IoSearchOutline } from "react-icons/io5";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import LinkTo from "@/components/Global/LinkTo";
import { useAppSelector } from "@/store/hooks";
import { useMenuOrdersPage } from "@/hooks/useMenuOrdersPage";
import OrderDetailsModal from "./OrderDetailsModal";
import OrdersCardGrid from "./OrdersCardGrid";
import OrdersFilters from "./OrdersFilters";

export default function TableOrdersView() {
  const t = useTranslations("tableOrders");
  const locale = useLocale();
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");
  const isRTL = locale === "ar";

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
      <div
        id="onboarding-orders-upgrade"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4"
      >
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {t("proOnlyTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {t("proOnlyDescription")}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {t("upgradeShort")}
        </LinkTo>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <NotificationPermissionCard />

      <header
        id="onboarding-orders-header"
        className="rounded-2xl border border-line bg-surface p-6 shadow-sm md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-sm">
              <IoReceiptOutline className="text-2xl" aria-hidden />
            </div>
            <div>
              <PageTitleWithHelp>
                <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
                  {t("title")}
                </h1>
              </PageTitleWithHelp>
              <p className="mt-1 max-w-xl text-sm text-fg-muted">
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

        <div id="onboarding-orders-search" className="relative mt-6">
          <label htmlFor="orders-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-brand ${isRTL ? "end-3" : "start-3"}`}
            aria-hidden
          />
          <input
            id="orders-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`w-full rounded-xl border border-line-strong bg-surface py-3 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/35 ${isRTL ? "pe-11 ps-4" : "ps-11 pe-4"}`}
            autoComplete="off"
          />
        </div>

        <OrdersFilters
          translationNs="tableOrders"
          theme="brand"
          dateFrom={dateFrom}
          dateTo={dateTo}
          statusFilter={statusFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={isFiltered}
          isRTL={isRTL}
        />
      </header>

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
