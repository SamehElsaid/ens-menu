"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import AddStaffModal from "@/components/Dashboard/AddStaffModal";
import DeleteStaffConfirm from "@/components/Dashboard/DeleteStaffConfirm";
import DataTable from "@/components/Custom/DataTable";
import LinkTo from "@/components/Global/LinkTo";
import { MenuStaff } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoEllipseSharp,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";

export default function StaffPage() {
  const t = useTranslations("Staff");
  const emptyCell = t("emptyCell");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const [staffList, setStaffList] = useState<MenuStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<MenuStaff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<MenuStaff | null>(null);
  const [refreshing, setRefreshing] = useState(0);

  const fetchStaff = useCallback(async () => {
    if (!menuId) return;
    if (isFreePlan) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await axiosGet<MenuStaff[] | { staff: MenuStaff[] }>(
        `/menus/${menuId}/staff`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { staff?: MenuStaff[] };
        const list = Array.isArray(result.data)
          ? result.data
          : (raw?.staff ?? []);
        setStaffList(list);
      } else {
        setStaffList([]);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, isFreePlan]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff, refreshing]);

  const handleEdit = useCallback((row: MenuStaff) => {
    setEditingStaff(row);
  }, []);

  const handleDelete = useCallback((row: MenuStaff) => {
    setDeletingStaff(row);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingStaff(null);
  }, []);

  const columnDefs = useMemo<ColDef<MenuStaff>[]>(
    () => [
      {
        headerName: t("name"),
        field: "name",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<MenuStaff>) => (
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {params.data?.name ?? emptyCell}
          </h3>
        ),
      },
      {
        headerName: t("role"),
        field: "role",
        width: 140,
        minWidth: 120,
        valueFormatter: (p) => {
          const r = String(p.value ?? "")
            .trim()
            .toLowerCase();
          if (r === "cashier" || r === "casher") return t("roleCashier");
          if (r === "waiter") return t("roleWaiter");
          return p.value ? String(p.value) : emptyCell;
        },
      },
      {
        headerName: t("email"),
        field: "email",
        flex: 1,
        minWidth: 160,
        valueFormatter: (p) => (p.value ? String(p.value) : emptyCell),
      },
      {
        headerName: t("status"),
        field: "isActive",
        width: 120,
        cellRenderer: (params: ICellRendererParams<MenuStaff>) => {
          const row = params.data;
          if (!row) return null;
          const active = row.isActive;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              <IoEllipseSharp
                className={`text-[8px] ${active ? "text-green-500 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
              />
              {active ? t("active") : t("inactive")}
            </span>
          );
        },
      },
      {
        headerName: t("action"),
        width: 120,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<MenuStaff>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                type="button"
                title={t("edit")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 hover:text-primary transition-colors"
              >
                <IoCreateOutline className="text-lg" />
              </button>
              <button
                type="button"
                title={t("delete")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <IoTrashOutline className="text-lg" />
              </button>
            </div>
          );
        },
      },
    ],
    [t, emptyCell, handleEdit, handleDelete],
  );

  if (isFreePlan) {
    const title =
      locale === "ar"
        ? "إدارة الطاقم متاحة لخطط Pro فقط"
        : "Staff management is available on Pro plans only";
    const description =
      locale === "ar"
        ? "قم بالترقية لإضافة موظفين وتلقي نداءات الطاولات."
        : "Upgrade to add staff and receive table call notifications.";
    const buttonLabel = locale === "ar" ? "الترقية" : "Upgrade";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
        <p className="max-w-md text-slate-500 dark:text-slate-400">{description}</p>
        <LinkTo
          href={`/dashboard/${menuId}/personal`}
          className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-primary/80 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {buttonLabel}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 text-sm font-medium transition-all"
          >
            {t("backToOverview")}
          </LinkTo>
          <button
            type="button"
            onClick={() => {
              setEditingStaff(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <IoAddCircleOutline className="text-xl" />
            {t("addStaff")}
          </button>
        </div>
      </div>

      <DataTable<MenuStaff>
        rowData={staffList}
        columnDefs={columnDefs}
        loading={loading}
        locale={locale}
        showRowNumbers={true}
        pagination={true}
        paginationPageSize={10}
      />

      {(showAddModal || editingStaff) && menuId && (
        <AddStaffModal
          menuId={menuId}
          staff={editingStaff}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingStaff && menuId && (
        <DeleteStaffConfirm
          menuId={menuId}
          staff={deletingStaff}
          displayLabel={deletingStaff.name}
          onClose={() => setDeletingStaff(null)}
          onDeleted={refreshList}
        />
      )}
      <div className="pb-10" />
    </>
  );
}
