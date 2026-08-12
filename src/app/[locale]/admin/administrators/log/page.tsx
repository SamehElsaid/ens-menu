"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  PageShell,
  Pagination,
  Select,
  Toolbar,
  type DataColumn,
  type StatusTone,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
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

/** Destructive entries carry danger so a deletion is legible at a glance. */
const ACTION_TONE: Record<AdminActivityAction, StatusTone> = {
  admin_created: "success",
  admin_deleted: "danger",
  admin_permissions_updated: "info",
  user_deleted: "danger",
  user_soft_deleted: "warning",
  user_restored: "success",
  user_subscription_updated: "brand",
};

export default function AdminActivityLogPage() {
  const locale = useLocale();
  const t = useTranslations("adminActivityLog");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tAdministrators = useTranslations("adminAdministrators");
  const tableLabels = useDataTableLabels();

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

  const columns: DataColumn<AdminActivityLogEntry>[] = useMemo(
    () => [
      {
        id: "createdAt",
        header: t("columns.date"),
        numeric: true,
        cell: (entry) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {formatAdminDate(entry.createdAt, locale)}
          </span>
        ),
      },
      {
        id: "actor",
        header: t("columns.actor"),
        cell: (entry) => (
          <span className="font-medium text-fg">
            {entry.actorAdminName ?? "—"}
          </span>
        ),
      },
      {
        id: "action",
        header: t("columns.action"),
        cell: (entry) => (
          <Badge tone={ACTION_TONE[entry.action] ?? "neutral"} dot>
            {actionLabel(entry.action)}
          </Badge>
        ),
      },
      {
        id: "target",
        header: t("columns.target"),
        primary: true,
        cell: (entry) => (
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-fg">
              {entry.targetName}
            </span>
            {entry.targetEmail ? (
              <span
                className="truncate font-mono text-[12px] text-fg-subtle"
                dir="ltr"
              >
                {entry.targetEmail}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: "targetType",
        header: t("columns.targetType"),
        cell: (entry) =>
          entry.targetType ? (
            <span className="text-[12px] text-fg-muted">
              {t(`targetTypes.${entry.targetType}` as Parameters<typeof t>[0])}
            </span>
          ) : null,
      },
      {
        id: "details",
        header: t("columns.details"),
        hideOnMobile: true,
        cell: (entry) => (
          <span className="text-[12px] text-fg-muted">
            {formatDetails(entry)}
          </span>
        ),
      },
    ],
    [t, locale, actionLabel, formatDetails],
  );

  /**
   * An audit trail reads top-to-bottom, so the filters sit in one toolbar rule
   * above a single ruled table instead of inside a floating card.
   */
  return (
    <PageShell
      kind="table"
      header={
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            {
              label: tAdministrators("title"),
              href: "/admin/administrators",
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
        />
      }
      toolbar={
        <Toolbar
          filters={
            <>
              <Select
                inputSize="sm"
                aria-label={t("filters.action")}
                value={actionFilter}
                onChange={(e) =>
                  setActionFilter(e.target.value as AdminActivityAction | "all")
                }
                wrapperClassName="w-full sm:w-56"
              >
                {ACTION_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "all"
                      ? t("filters.allActions")
                      : actionLabel(option)}
                  </option>
                ))}
              </Select>
              <Select
                inputSize="sm"
                aria-label={t("filters.targetType")}
                value={targetFilter}
                onChange={(e) =>
                  setTargetFilter(
                    e.target.value as AdminActivityTargetType | "all",
                  )
                }
                wrapperClassName="w-full sm:w-44"
              >
                <option value="all">{t("filters.allTargets")}</option>
                <option value="admin">{t("targetTypes.admin")}</option>
                <option value="user">{t("targetTypes.user")}</option>
              </Select>
            </>
          }
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading}
          labels={{
            region: tCommon("pagination"),
            previous: tCommon("previousPage"),
            next: tCommon("nextPage"),
            page: (n) => tCommon("goToPage", { page: n }),
          }}
        />
      }
    >
      {/* Twenty audit rows per page with a sticky head: the column that says
          whether a row is a deletion has to stay named while you scroll. */}
      <DataTable<AdminActivityLogEntry>
        columns={columns}
        rows={entries}
        getRowKey={(row, index) => String(row.id ?? index)}
        caption={t("title")}
        loading={loading}
        skeletonRows={itemsPerPage}
        tableId="admin-activity-log"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={<EmptyState title={t("empty")} size="sm" />}
      />
    </PageShell>
  );
}
