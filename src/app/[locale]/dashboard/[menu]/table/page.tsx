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
import {
  Badge,
  Button,
  buttonClasses,
  EmptyState,
  PageShell,
} from "@/components/ui";
import { MenuTable } from "@/types/Menu";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { IoAddCircleOutline, IoSparklesOutline } from "react-icons/io5";
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
  const menuName =
    (locale === "ar" ? menuRecord?.nameAr : menuRecord?.nameEn)?.trim() ?? "";
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

  /* The page keeps its own heading and breadcrumbs on the locked plan: the
     reader is still on the tables page, and replacing the whole screen with a
     sales pitch loses their place in the product. Only the list is swapped for
     the gate. */
  const breadcrumbs = [
    { label: menuName || tStaff("backToOverview"), href: `/dashboard/${menuId}` },
    { label: t("title") },
  ];

  if (isFreePlan) {
    return (
      <PageShell
        kind="detail"
        header={
          <PageTitleWithHelp
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={breadcrumbs}
            breadcrumbsLabel={t("title")}
            meta={
              <Badge tone="neutral" dot>
                {tStaff("upgradeShort")}
              </Badge>
            }
          />
        }
      >
        <div id="onboarding-tables-upgrade">
          <EmptyState
            icon={<IoSparklesOutline />}
            title={t("proOnlyTitle")}
            description={t("proOnlyDescription")}
            action={
              <LinkTo
                href={`/dashboard/${menuId}/subscription`}
                className={buttonClasses({ variant: "primary" })}
              >
                {tStaff("upgradeShort")}
              </LinkTo>
            }
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp
          id="onboarding-tables-header"
          className="dashboard-tables-header"
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={breadcrumbs}
          breadcrumbsLabel={t("title")}
          meta={
            !loading && tables.length > 0 ? (
              <Badge tone="neutral">
                {t("totalTablesLabel")}:{" "}
                <span className="tabular-nums" lang="en">
                  {tables.length}
                </span>
              </Badge>
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
      }
    >
      <div id="onboarding-tables-table" className="dashboard-tables-page min-w-0">
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
    </PageShell>
  );
}
