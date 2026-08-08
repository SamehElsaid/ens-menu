"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ColDef } from "ag-grid-community";
import { IoArrowBack } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { Button, PageHeader } from "@/components/ui";
import { axiosGet } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import type {
  AdminActivityAction,
  AdminActivityLogEntry,
  AdminActivityLogResponse,
  AdminActivityTargetType,
} from "@/types/AdminActivityLog";

const ACTION_FILTER_OPTIONS: Array<AdminActivityAction | "all"> = [
  "all",
  "admin_created",
  "admin_deleted",
  "admin_permissions_updated",
  "user_deleted",
  "user_soft_deleted",
  "user_restored",
  "user_subscription_updated",
];

export default function AdminActivityLogPage() {
  const locale = useLocale();
  const t = useTranslations("adminActivityLog");
  const router = useRouter();
  const isRTL = locale === "ar";

  const [entries, setEntries] = useState<AdminActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [actionFilter, setActionFilter] = useState<AdminActivityAction | "all">(
    "all",
  );
  const [targetFilter, setTargetFilter] = useState<
    AdminActivityTargetType | "all"
  >("all");

  const fetchLog = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          page: pageNum,
          limit: 20,
        };
        if (actionFilter !== "all") params.action = actionFilter;
        if (targetFilter !== "all") params.targetType = targetFilter;

        const result = await axiosGet<AdminActivityLogResponse>(
          "/admin/activity-log",
          locale,
          undefined,
          params,
        );

        if (result.status && result.data) {
          setEntries(result.data.entries ?? []);
          setTotalPages(result.data.pagination?.totalPages ?? 1);
          setItemsPerPage(result.data.pagination?.itemsPerPage ?? 20);
        } else {
          toast.error(t("error"));
        }
      } catch (err) {
        console.error("Error fetching admin activity log:", err);
        toast.error(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [locale, t, actionFilter, targetFilter],
  );

  useEffect(() => {
    fetchLog(page);
  }, [page, fetchLog]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, targetFilter]);

  const actionLabel = useCallback(
    (action: string) => {
      const key = `actions.${action}` as Parameters<typeof t>[0];
      try {
        return t(key);
      } catch {
        return action;
      }
    },
    [t],
  );

  const formatDetails = useCallback(
    (entry: AdminActivityLogEntry) => {
      if (!entry.details) return "—";
      try {
        const parsed = JSON.parse(entry.details) as Record<string, unknown>;
        if (entry.action === "user_subscription_updated") {
          const planName = parsed.planName ?? "";
          const billingCycle = parsed.billingCycle ?? "";
          return t("details.subscription", {
            plan: String(planName),
            cycle: String(billingCycle),
          });
        }
        if (entry.action === "admin_permissions_updated") {
          const perms = parsed.permissions;
          if (perms === "full_access") return t("details.fullAccess");
          if (Array.isArray(perms)) {
            return t("details.limitedPermissions", { count: perms.length });
          }
        }
        return entry.details;
      } catch {
        return entry.details;
      }
    },
    [t],
  );

  const columnDefs: ColDef<AdminActivityLogEntry>[] = useMemo(
    () => [
      {
        headerName: t("columns.date"),
        field: "createdAt",
        width: 170,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => {
          const entry = params.data;
          if (!entry) return null;
          return (
            <span className="text-fg-muted text-sm">
              {formatAdminDate(entry.createdAt, locale)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.actor"),
        field: "actorAdminName",
        flex: 1,
        minWidth: 140,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => (
          <span className="font-medium text-fg">
            {params.data?.actorAdminName ?? "—"}
          </span>
        ),
      },
      {
        headerName: t("columns.action"),
        field: "action",
        flex: 1,
        minWidth: 160,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => {
          const entry = params.data;
          if (!entry) return null;
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-fg-muted">
              {actionLabel(entry.action)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.target"),
        flex: 1.2,
        minWidth: 200,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => {
          const entry = params.data;
          if (!entry) return null;
          return (
            <div>
              <p className="font-medium text-fg">{entry.targetName}</p>
              {entry.targetEmail && (
                <p className="text-xs text-fg-subtle">{entry.targetEmail}</p>
              )}
            </div>
          );
        },
      },
      {
        headerName: t("columns.targetType"),
        field: "targetType",
        width: 110,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => {
          const type = params.data?.targetType;
          if (!type) return null;
          return (
            <span className="text-xs font-medium text-fg-muted">
              {t(`targetTypes.${type}` as Parameters<typeof t>[0])}
            </span>
          );
        },
      },
      {
        headerName: t("columns.details"),
        flex: 1,
        minWidth: 160,
        cellRenderer: (params: { data: AdminActivityLogEntry }) => {
          const entry = params.data;
          if (!entry) return null;
          return (
            <span className="text-sm text-fg-muted">
              {formatDetails(entry)}
            </span>
          );
        },
      },
    ],
    [t, locale, actionLabel, formatDetails],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack className="rtl:rotate-180" />}
            onClick={() => router.push("/admin/administrators")}
          >
            {t("back")}
          </Button>
        }
      />

      <CardDashBoard>
        <div
          className={`flex flex-wrap items-end gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div>
            <label className="block text-xs font-medium text-fg-subtle mb-1">
              {t("filters.action")}
            </label>
            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value as AdminActivityAction | "all")
              }
              className="rounded-lg border border-line bg-raised px-3 py-2 text-sm min-w-[200px]"
            >
              {ACTION_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all"
                    ? t("filters.allActions")
                    : actionLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-fg-subtle mb-1">
              {t("filters.targetType")}
            </label>
            <select
              value={targetFilter}
              onChange={(e) =>
                setTargetFilter(
                  e.target.value as AdminActivityTargetType | "all",
                )
              }
              className="rounded-lg border border-line bg-raised px-3 py-2 text-sm min-w-[160px]"
            >
              <option value="all">{t("filters.allTargets")}</option>
              <option value="admin">{t("targetTypes.admin")}</option>
              <option value="user">{t("targetTypes.user")}</option>
            </select>
          </div>
        </div>

        <DataTable<AdminActivityLogEntry>
          rowData={entries}
          columnDefs={columnDefs}
          loading={loading}
          locale={locale}
          showRowNumbers
          pagination
          page={page}
          totalPages={totalPages}
          paginationPageSize={itemsPerPage}
          onPageChange={setPage}
        />
      </CardDashBoard>
    </div>
  );
}
