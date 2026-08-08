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
import { Button, buttonClasses } from "@/components/ui";
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
        <PageTitleWithHelp
          className="justify-center"
          title={title}
          description={description}
        />
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className={buttonClasses({
            variant: "primary",
            className: "mt-2 md:mt-4",
          })}
        >
          {buttonLabel}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div
        id="onboarding-tables-header"
        className="dashboard-tables-header mb-5 min-w-0 md:mb-6"
      >
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-fg-muted transition-colors hover:text-brand"
        >
          <IoArrowBackOutline className="text-sm rtl:rotate-180" aria-hidden />
          {tStaff("backToOverview")}
        </LinkTo>

        <PageTitleWithHelp
          title={t("title")}
          description={t("subtitle")}
          meta={
            !loading && tables.length > 0 ? (
              <span className="text-xs font-medium text-fg-subtle">
                {t("totalTablesLabel")}:{" "}
                <span className="font-bold tabular-nums text-fg-muted">
                  {tables.length}
                </span>
              </span>
            ) : undefined
          }
          actions={
            <Button
              id="onboarding-tables-actions"
              type="button"
              onClick={openAddModal}
              startIcon={<IoAddCircleOutline className="size-4.5" />}
            >
              {t("addTable")}
            </Button>
          }
        />
      </div>

      <div
        id="onboarding-tables-table"
        className="dashboard-tables-page min-w-0 pb-6"
      >
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
