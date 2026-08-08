"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { IoArrowBack, IoRefreshOutline } from "react-icons/io5";
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaTimesCircle,
  FaUserCog,
  FaUserShield,
  FaWallet,
} from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import {
  Button,
  PageHeader,
  SearchInput,
  SectionHeader,
  SegmentedControl,
  Toolbar,
} from "@/components/ui";
import {
  fetchAdminPayments,
  formatPaymentAmount,
  formatPaymentDate,
} from "@/lib/fetchAdminPayments";
import type {
  AdminPaymentsPeriod,
  AdminPaymentStatus,
  AdminPaymentStatusFilter,
  AdminPaymentTransaction,
  AdminSubscriptionRecordStatus,
  AdminSubscriptionSource,
  AdminSubscriptionSourceFilter,
  AdminSubscriptionStatusFilter,
} from "@/types/AdminPayment";

const SOURCE_FILTERS: AdminSubscriptionSourceFilter[] = [
  "all",
  "paid",
  "admin",
];

const SUBSCRIPTION_STATUS_FILTERS: AdminSubscriptionStatusFilter[] = [
  "all",
  "active",
  "expired",
  "cancelled",
];

const STATUS_FILTERS: AdminPaymentStatusFilter[] = [
  "all",
  "success",
  "pending",
  "failed",
  "cancelled",
  "refunded",
];

const PERIODS: AdminPaymentsPeriod[] = ["7d", "30d", "90d", "all"];

function sourceTone(source: AdminSubscriptionSource): string {
  return source === "paid"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
    : "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300";
}

function subscriptionStatusTone(status: AdminSubscriptionRecordStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "expired":
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 ";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    default:
      return "bg-slate-100 text-fg-muted";
  }
}

function statusTone(status: AdminPaymentStatus): string {
  switch (status) {
    case "success":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    case "refunded":
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 ";
    default:
      return "bg-slate-100 text-fg-muted";
  }
}

export default function AdminPaymentsPage() {
  const locale = useLocale();
  const t = useTranslations("adminPayments");
  const router = useRouter();
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<AdminPaymentStatusFilter>("all");
  const [sourceFilter, setSourceFilter] =
    useState<AdminSubscriptionSourceFilter>("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] =
    useState<AdminSubscriptionStatusFilter>("all");
  const [period, setPeriod] = useState<AdminPaymentsPeriod>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>(
    [],
  );
  const [statistics, setStatistics] = useState<
    Awaited<ReturnType<typeof fetchAdminPayments>>["statistics"] | null
  >(null);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminPayments(locale, {
      page,
      limit: 10,
      status: statusFilter,
      source: sourceFilter,
      subscriptionStatus: subscriptionStatusFilter,
      period,
      search: searchQuery,
    });
    setTransactions(data.transactions);
    setStatistics(data.statistics);
    setTotalPages(data.pagination.totalPages);
    setIsDemo(Boolean(data._isDemoData));
    setLoading(false);
  }, [
    locale,
    page,
    period,
    searchQuery,
    sourceFilter,
    statusFilter,
    subscriptionStatusFilter,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const columnDefs = useMemo<ColDef<AdminPaymentTransaction>[]>(
    () => [
      {
        headerName: t("columns.customer"),
        flex: 1,
        minWidth: 160,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const row = params.data;
          if (!row) return null;
          return (
            <button
              type="button"
              className="text-start"
              onClick={() => router.push(`/admin/users/${row.userId}`)}
            >
              <span className="block font-medium text-primary hover:underline">
                {row.userName}
              </span>
              <span className="block text-xs text-fg-muted truncate max-w-[200px]">
                {row.userEmail}
              </span>
            </button>
          );
        },
      },
      {
        headerName: t("columns.plan"),
        field: "planName",
        width: 80,
      },
      {
        headerName: t("columns.subscriptionSource"),
        field: "subscriptionSource",
        width: 130,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const source = params.value as AdminSubscriptionSource;
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${sourceTone(source)}`}
            >
              {t(`source.${source}`)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.subscriptionStatus"),
        field: "subscriptionStatus",
        width: 110,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const subStatus = params.value as
            AdminSubscriptionRecordStatus | undefined;
          if (!subStatus) return <span className="text-fg-subtle">—</span>;
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${subscriptionStatusTone(subStatus)}`}
            >
              {t(`subscriptionStatus.${subStatus}`)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.billing"),
        field: "billingCycle",
        width: 100,
        cellRenderer: (params: ICellRendererParams<AdminPaymentTransaction>) =>
          t(`billing.${params.value as string}`),
      },
      {
        headerName: t("columns.amount"),
        field: "amount",
        width: 120,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const row = params.data;
          if (!row) return null;
          if (row.subscriptionSource === "admin" || row.amount <= 0) {
            return (
              <span className="text-fg-subtle tabular-nums">
                {t("amountFree")}
              </span>
            );
          }
          return (
            <span className="font-semibold tabular-nums">
              {formatPaymentAmount(row.amount, row.currency)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.status"),
        field: "status",
        width: 110,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const status = params.value as AdminPaymentStatus;
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusTone(status)}`}
            >
              {t(`status.${status}`)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.gateway"),
        field: "gateway",
        width: 100,
        hide: true,
      },
      {
        headerName: t("columns.startDate"),
        field: "subscriptionStartAt",
        width: 140,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const row = params.data;
          const value =
            row?.subscriptionStartAt ?? row?.createdAt ?? params.value;
          return formatPaymentDate(value as string, locale);
        },
      },
      {
        headerName: t("columns.endDate"),
        field: "subscriptionEndAt",
        width: 140,
        cellRenderer: (params: ICellRendererParams<AdminPaymentTransaction>) =>
          formatPaymentDate(params.value as string | null, locale),
      },
      {
        headerName: t("columns.date"),
        field: "paidAt",
        width: 140,
        cellRenderer: (
          params: ICellRendererParams<AdminPaymentTransaction>,
        ) => {
          const row = params.data;
          const value = row?.paidAt ?? row?.createdAt;
          return formatPaymentDate(value as string, locale);
        },
      },
    ],
    [locale, router, t],
  );

  const statCards = statistics
    ? [
        {
          id: "proActive",
          label: t("stats.proActive"),
          value: (statistics.proActiveCount ?? 0).toLocaleString(),
          icon: FaUserShield,
          color: "primary",
        },
        {
          id: "paidActive",
          label: t("stats.paidViaGateway"),
          value: (statistics.paidActiveCount ?? 0).toLocaleString(),
          icon: FaCheckCircle,
          color: "green",
        },
        {
          id: "adminGranted",
          label: t("stats.adminGranted"),
          value: (statistics.adminGrantedCount ?? 0).toLocaleString(),
          icon: FaUserCog,
          color: "violet",
        },
        {
          id: "revenue",
          label: t("stats.totalRevenue"),
          value: formatPaymentAmount(
            statistics.totalRevenue,
            statistics.currency,
          ),
          icon: FaWallet,
          color: "emerald",
        },
        {
          id: "month",
          label: t("stats.revenueThisMonth"),
          value: formatPaymentAmount(
            statistics.revenueThisMonth,
            statistics.currency,
          ),
          icon: FaCreditCard,
          color: "primary",
        },
        {
          id: "pending",
          label: t("stats.pending"),
          value: statistics.pendingCount.toLocaleString(),
          icon: FaClock,
          color: "amber",
        },
        {
          id: "failed",
          label: t("stats.failed"),
          value: statistics.failedCount.toLocaleString(),
          icon: FaTimesCircle,
          color: "red",
        },
      ]
    : [];

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
      },
      primary: {
        bg: "bg-primary/10 dark:bg-primary/20",
        text: "text-primary",
        border: "border-primary/20",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-500/20",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/20",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-500/20",
      },
      violet: {
        bg: "bg-violet-50 dark:bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-200 dark:border-violet-500/20",
      },
    };

  return (
    <div className="space-y-6 py-5 animate-fadeIn" dir={textDir}>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack className="rtl:rotate-180" />}
            onClick={() => router.push("/admin")}
          >
            {t("backToAdmin")}
          </Button>
        }
      />

      {isDemo && <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />}

      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const colors = colorMap[card.color] ?? colorMap.primary;
            return (
              <CardDashBoard
                key={card.id}
                borderColor={colors.border}
                className="p-5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}
                  >
                    <Icon className={`text-lg ${colors.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-fg-muted mb-1">{card.label}</p>
                    <p className="text-lg font-bold text-fg tabular-nums truncate">
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardDashBoard>
            );
          })}
        </div>
      )}

      <CardDashBoard className="p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <Toolbar
            search={
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder={t("searchPlaceholder")}
                label={t("search")}
                debounceMs={0}
              />
            }
            actions={
              <>
                <Button type="submit">{t("search")}</Button>
                {(searchQuery || searchInput) && (
                  <Button
                    type="button"
                    variant="secondary"
                    startIcon={<IoRefreshOutline />}
                    onClick={handleReset}
                  >
                    {t("reset")}
                  </Button>
                )}
              </>
            }
          />
        </form>
      </CardDashBoard>

      <CardDashBoard className="space-y-4 p-4">
        <SectionHeader title={t("filters.source")} />
        <SegmentedControl
          label={t("filters.source")}
          value={sourceFilter}
          onChange={(source) => {
            setSourceFilter(source);
            setPage(1);
          }}
          size="sm"
          options={SOURCE_FILTERS.map((source) => ({
            value: source,
            label: t(`source.${source}`),
          }))}
        />
        <SectionHeader title={t("filters.subscriptionStatus")} />
        <SegmentedControl
          label={t("filters.subscriptionStatus")}
          value={subscriptionStatusFilter}
          onChange={(subStatus) => {
            setSubscriptionStatusFilter(subStatus);
            setPage(1);
          }}
          size="sm"
          options={SUBSCRIPTION_STATUS_FILTERS.map((subStatus) => ({
            value: subStatus,
            label: t(`subscriptionStatus.${subStatus}`),
          }))}
        />
        <SectionHeader title={t("filters.status")} />
        <SegmentedControl
          label={t("filters.status")}
          value={statusFilter}
          onChange={(status) => {
            setStatusFilter(status);
            setPage(1);
          }}
          size="sm"
          options={STATUS_FILTERS.map((status) => ({
            value: status,
            label: t(`filters.${status}`),
          }))}
        />
        <SectionHeader title={t("filters.period")} />
        <SegmentedControl
          label={t("filters.period")}
          value={period}
          onChange={(p) => {
            setPeriod(p);
            setPage(1);
          }}
          size="sm"
          options={PERIODS.map((p) => ({
            value: p,
            label: t(`period.${p}`),
          }))}
        />
      </CardDashBoard>

      <CardDashBoard className="p-4">
        <DataTable
          rowData={transactions}
          columnDefs={columnDefs}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pagination
          paginationPageSize={10}
          locale={locale}
          height={520}
        />
      </CardDashBoard>
    </div>
  );
}
