"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddTableModal from "@/components/Dashboard/AddTableModal";
import DeleteTableConfirm from "@/components/Dashboard/DeleteTableConfirm";
import TablesCardGrid from "@/components/Dashboard/tables/TablesCardGrid";
import LinkTo from "@/components/Global/LinkTo";
import { MenuTable } from "@/types/Menu";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { IoAddCircleOutline, IoArrowBackOutline } from "react-icons/io5";
import { resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import { resolveMenuItemImageSrc } from "@/components/menuItemImage";

export default function TablesPage() {
  const t = useTranslations("Tables");
  const tStaff = useTranslations("Staff");
  const locale = useLocale();
  const params = useParams();
  const menuRecord = useAppSelector((s) => s.menuData.menu);
  const menuSlug = resolvePublicMenuSlug(menuRecord?.slug, menuRecord?.id);
  const menuLogo = menuRecord?.logo;
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);
  const qrCenterLogoSrc = isFreePlan
    ? null
    : menuLogo?.trim()
      ? resolveMenuItemImageSrc(menuLogo)
      : undefined;
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [tables, setTables] = useState<MenuTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<MenuTable | null>(null);
  const [deletingTable, setDeletingTable] = useState<MenuTable | null>(null);
  const [refreshing, setRefreshing] = useState(0);

  const fetchTables = useCallback(async () => {
    if (!menuId) return;
    if (isFreePlan) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await axiosGet<MenuTable[] | { tables: MenuTable[] }>(
        `/menus/${menuId}/tables`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { tables?: MenuTable[] };
        const list = Array.isArray(result.data)
          ? result.data
          : (raw?.tables ?? []);
        setTables(list);
      } else {
        setTables([]);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, isFreePlan]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables, refreshing]);

  const handleEdit = useCallback((row: MenuTable) => {
    setEditingTable(row);
  }, []);

  const handleDelete = useCallback((row: MenuTable) => {
    setDeletingTable(row);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingTable(null);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingTable(null);
    setShowAddModal(true);
  }, []);

  if (isFreePlan) {
    const title =
      locale === "ar"
        ? "الطاولات وروابط QR متاحة لخطط Pro فقط"
        : "Tables and QR links are available on Pro plans only";
    const description =
      locale === "ar"
        ? "قم بالترقية لإدارة الطاولات ونداء الطاقم."
        : "Upgrade your plan to manage tables and staff calls.";
    const buttonLabel = tStaff("upgradeShort");

    return (
      <div
        id="onboarding-tables-upgrade"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4"
      >
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {title}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {description}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {buttonLabel}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div id="onboarding-tables-header" className="dashboard-tables-header mb-5 min-w-0 md:mb-6">
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
        >
          <IoArrowBackOutline className="text-sm rtl:rotate-180" aria-hidden />
          {tStaff("backToOverview")}
        </LinkTo>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <PageTitleWithHelp>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
                {t("title")}
              </h1>
            </PageTitleWithHelp>
            <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
              {t("subtitle")}
            </p>
            {!loading && tables.length > 0 && (
              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                {t("totalTablesLabel")}:{" "}
                <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {tables.length}
                </span>
              </p>
            )}
          </div>

          <button
            id="onboarding-tables-actions"
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
          >
            <IoAddCircleOutline className="text-lg" aria-hidden />
            {t("addTable")}
          </button>
        </div>
      </div>

      <div id="onboarding-tables-table" className="dashboard-tables-page min-w-0 pb-6">
        <TablesCardGrid
          tables={tables}
          loading={loading}
          locale={locale}
          menuSlug={menuSlug}
          qrCenterLogoSrc={qrCenterLogoSrc}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={openAddModal}
        />
      </div>

      {(showAddModal || editingTable) && menuId && (
        <AddTableModal
          menuId={menuId}
          table={editingTable}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingTable && menuId && (
        <DeleteTableConfirm
          menuId={menuId}
          table={deletingTable}
          displayLabel={deletingTable.tableNumber}
          onClose={() => setDeletingTable(null)}
          onDeleted={refreshList}
        />
      )}
    </>
  );
}
