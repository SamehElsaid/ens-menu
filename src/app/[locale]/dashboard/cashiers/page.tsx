"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import LinkTo from "@/components/Global/LinkTo";
import { isFreePlanUser } from "@/lib/subscription";
import { ColDef } from "ag-grid-community";
import { IoArrowBack, IoAddOutline } from "react-icons/io5";
import { FaSpinner, FaUsers, FaUserCheck } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import CashierModal, { type CashierRow } from "@/components/Dashboard/CashierModal";
import { Menu, MenusResponse } from "@/types/Menu";

type CashiersApi = { cashiers: CashierRow[] };

export default function CashiersManagementPage() {
  const locale = useLocale();
  const t = useTranslations("dashboardCashiers");
  const tc = useTranslations("Dashboard");
  const router = useRouter();
  const isRTL = locale === "ar";

  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const auth = userData as
    | { user?: { role?: string } }
    | undefined;
  const isOwner = auth?.user?.role === "user";

  const [menus, setMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [cashiers, setCashiers] = useState<CashierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCashier, setEditCashier] = useState<CashierRow | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    cashier: CashierRow | null;
  }>({ isOpen: false, cashier: null });
  const [loadingCashierId, setLoadingCashierId] = useState<number | null>(null);

  const fetchMenus = useCallback(async () => {
    setMenusLoading(true);
    const result = await axiosGet<MenusResponse | Menu[]>(
      "/menus",
      locale,
      undefined,
      { locale },
    );
    if (result.status && result.data) {
      const list = Array.isArray(result.data)
        ? result.data
        : result.data.menus ?? [];
      setMenus(list);
    }
    setMenusLoading(false);
  }, [locale]);

  const fetchCashiers = useCallback(async () => {
    setLoading(true);
    const result = await axiosGet<CashiersApi>("/user/cashiers", locale, undefined, {
      locale,
    });
    if (result.status && result.data?.cashiers) {
      setCashiers(result.data.cashiers);
    } else {
      setCashiers([]);
      if (isOwner) toast.error(t("errorLoad"));
    }
    setLoading(false);
  }, [locale, isOwner, t]);

  useEffect(() => {
    if (!isOwner) return;
    void fetchMenus();
  }, [fetchMenus, isOwner]);

  useEffect(() => {
    if (!isOwner || isFreePlan) return;
    void fetchCashiers();
  }, [fetchCashiers, isOwner, isFreePlan]);

  const stats = useMemo(() => {
    const total = cashiers.length;
    const active = cashiers.filter(
      (c) => !(c.isSuspended === true || c.isSuspended === 1),
    ).length;
    return { total, active };
  }, [cashiers]);

  const formatDate = useCallback(
    (dateString?: string | null) => {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(date);
    },
    [locale],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteModal.cashier) return;
    const id = deleteModal.cashier.id;
    setLoadingCashierId(id);
    try {
      const result = await axiosDelete<{ message?: string }>(
        `/user/cashiers/${id}`,
        locale,
      );
      if (result.status) {
        toast.success(t("deleteSuccess"));
        setDeleteModal({ isOpen: false, cashier: null });
        void fetchCashiers();
      } else {
        toast.error(t("deleteError"));
      }
    } finally {
      setLoadingCashierId(null);
    }
  }, [deleteModal.cashier, locale, t, fetchCashiers]);

  const columnDefs: ColDef<CashierRow>[] = useMemo(
    () => [
      {
        headerName: t("columns.name"),
        field: "name",
        flex: 1,
        minWidth: 160,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {row.name}
            </span>
          );
        },
      },
      {
        headerName: t("columns.email"),
        field: "email",
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: t("columns.menus"),
        field: "menuIds",
        width: 100,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className="text-slate-600 dark:text-slate-400">
              {row.menuIds?.length ?? 0}
            </span>
          );
        },
      },
      {
        headerName: t("columns.pages"),
        field: "pageKeys",
        width: 100,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className="text-slate-600 dark:text-slate-400">
              {row.pageKeys?.length ?? 0}
            </span>
          );
        },
      },
      {
        headerName: t("columns.status"),
        width: 120,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          const suspended =
            row.isSuspended === true || row.isSuspended === 1;
          return (
            <span
              className={
                suspended
                  ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  : "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
              }
            >
              {suspended ? t("statusSuspended") : t("statusActive")}
            </span>
          );
        },
      },
      {
        headerName: t("columns.dateAdded"),
        field: "createdAt",
        width: 130,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className="text-slate-600 dark:text-slate-400">
              {formatDate(row.createdAt)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.actions"),
        width: 200,
        sortable: false,
        cellRenderer: (params: { data: CashierRow }) => {
          const row = params.data;
          if (!row) return null;
          const busy = loadingCashierId === row.id;
          return (
            <div
              className={`flex flex-wrap items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                type="button"
                onClick={() => setEditCashier(row)}
                disabled={busy}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                {t("actions.edit")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: true, cashier: row })}
                disabled={busy}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  t("actions.delete")
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [t, isRTL, formatDate, loadingCashierId],
  );

  if (!isOwner) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "ar"
            ? "هذه الصفحة لأصحاب الحسابات فقط."
            : "This page is only for restaurant owners."}
        </p>
      </div>
    );
  }

  if (isFreePlan) {
    const personalHref = menus[0]?.id
      ? `/dashboard/${menus[0].id}/personal`
      : "/dashboard";

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
          {tc("cashiersProOnlyTitle")}
        </h1>
        <p className="max-w-md text-slate-500 dark:text-slate-400">
          {tc("cashiersProOnlyDescription")}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <LinkTo
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-3 font-semibold text-slate-700 transition-all hover:border-primary/40 dark:border-slate-600 dark:text-slate-200"
          >
            {tc("backToMenus")}
          </LinkTo>
          <LinkTo
            href={personalHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            {tc("cashiersUpgradeCta")}
          </LinkTo>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div
            className={`mb-4 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium">{t("back")}</span>
            </button>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20" hover={true}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-blue-100 shadow-sm dark:from-blue-500/20 dark:to-blue-600/10">
              <FaUsers className="text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("statTotal")}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? (
                  <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-transparent dark:border-slate-600" />
                ) : (
                  stats.total.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard borderColor="border-emerald-200 dark:border-emerald-500/20" hover={true}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-emerald-50 to-emerald-100 shadow-sm dark:from-emerald-500/20 dark:to-emerald-600/10">
              <FaUserCheck className="text-xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("statActive")}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? (
                  <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent dark:border-emerald-600" />
                ) : (
                  stats.active.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>
      </div>

      <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex transform items-center gap-2 rounded-xl bg-linear-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-green-800 hover:shadow-lg"
        >
          <IoAddOutline className="text-lg" />
          <span>{t("addNew")}</span>
        </button>
      </div>

      <CardDashBoard>
        <DataTable<CashierRow>
          rowData={cashiers}
          columnDefs={columnDefs}
          loading={loading}
          locale={locale}
          showRowNumbers={true}
          pagination={true}
          paginationPageSize={10}
        />
      </CardDashBoard>

      {showCreateModal && (
        <CashierModal
          mode="create"
          menus={menus}
          menusLoading={menusLoading}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => void fetchCashiers()}
        />
      )}

      {editCashier && (
        <CashierModal
          mode="edit"
          cashier={editCashier}
          menus={menus}
          menusLoading={menusLoading}
          onClose={() => setEditCashier(null)}
          onSuccess={() => void fetchCashiers()}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, cashier: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirm", { name: deleteModal.cashier?.name ?? "" })}
        confirmText={t("actions.delete")}
        cancelText={t("actions.cancel")}
        isLoading={loadingCashierId === deleteModal.cashier?.id}
        loadingText={t("deleting")}
      />
    </div>
  );
}
