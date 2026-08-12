"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { IoRefreshOutline } from "react-icons/io5";
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaTimesCircle,
  FaUserCog,
  FaUserShield,
  FaWallet,
} from "react-icons/fa";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  NoResultsState,
  PageHeader,
  PageShell,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  StatCard,
  StatGrid,
  Toolbar,
  type DataColumn,
  type StatusTone,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
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

/* Money moved through a gateway and money granted by an operator are different
   kinds of fact, so they are held apart by tone as well as by word. */
const SOURCE_TONE: Record<AdminSubscriptionSource, StatusTone> = {
  paid: "success",
  admin: "info",
};

const SUBSCRIPTION_STATUS_TONE: Record<
  AdminSubscriptionRecordStatus,
  StatusTone
> = {
  active: "success",
  expired: "neutral",
  cancelled: "danger",
};

const PAYMENT_STATUS_TONE: Record<AdminPaymentStatus, StatusTone> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  cancelled: "danger",
  refunded: "neutral",
};

export default function AdminPaymentsPage() {
  const locale = useLocale();
  const t = useTranslations("adminPayments");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();
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

  const columns = useMemo<DataColumn<AdminPaymentTransaction>[]>(
    () => [
      {
        id: "customer",
        header: t("columns.customer"),
        primary: true,
        cell: (row) => (
          <button
            type="button"
            className="min-w-0 text-start"
            onClick={() => router.push(`/admin/users/${row.userId}`)}
          >
            <span className="block font-medium text-fg hover:underline">
              {row.userName}
            </span>
            <span className="block max-w-[200px] truncate font-mono text-[11px] text-fg-muted">
              {row.userEmail}
            </span>
          </button>
        ),
      },
      {
        id: "plan",
        header: t("columns.plan"),
        cell: (row) => <span className="text-fg-muted">{row.planName}</span>,
      },
      {
        id: "source",
        header: t("columns.subscriptionSource"),
        cell: (row) => (
          <Badge tone={SOURCE_TONE[row.subscriptionSource] ?? "neutral"} dot>
            {t(`source.${row.subscriptionSource}`)}
          </Badge>
        ),
      },
      {
        id: "subscriptionStatus",
        header: t("columns.subscriptionStatus"),
        cell: (row) =>
          row.subscriptionStatus ? (
            <Badge
              tone={SUBSCRIPTION_STATUS_TONE[row.subscriptionStatus] ?? "neutral"}
              dot
            >
              {t(`subscriptionStatus.${row.subscriptionStatus}`)}
            </Badge>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        id: "billing",
        header: t("columns.billing"),
        hideOnMobile: true,
        cell: (row) => (
          <span className="text-fg-muted">{t(`billing.${row.billingCycle}`)}</span>
        ),
      },
      {
        id: "amount",
        header: t("columns.amount"),
        numeric: true,
        align: "end",
        cell: (row) =>
          row.subscriptionSource === "admin" || row.amount <= 0 ? (
            <span className="ui-figure text-[12px] text-fg-subtle">
              {t("amountFree")}
            </span>
          ) : (
            <span className="ui-figure text-[12px] text-fg" lang="en">
              {formatPaymentAmount(row.amount, row.currency)}
            </span>
          ),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: (row) => (
          <Badge tone={PAYMENT_STATUS_TONE[row.status] ?? "neutral"} dot>
            {t(`status.${row.status}`)}
          </Badge>
        ),
      },
      {
        id: "startDate",
        header: t("columns.startDate"),
        numeric: true,
        align: "end",
        hideOnMobile: true,
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {formatPaymentDate(row.subscriptionStartAt ?? row.createdAt, locale)}
          </span>
        ),
      },
      {
        id: "endDate",
        header: t("columns.endDate"),
        numeric: true,
        align: "end",
        hideOnMobile: true,
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {formatPaymentDate(row.subscriptionEndAt, locale)}
          </span>
        ),
      },
      {
        id: "paidAt",
        header: t("columns.date"),
        numeric: true,
        align: "end",
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {formatPaymentDate(row.paidAt ?? row.createdAt, locale)}
          </span>
        ),
      },
    ],
    [locale, router, t],
  );

  /* The seven metrics are a fixed set, so the row is described up front and each
     card carries `loading` until its figure arrives. Building the array from
     `statistics` meant the strip did not exist on first paint and then shoved
     the filter form and the table down the page when it did. */
  const statCards = [
    {
      id: "proActive",
      label: t("stats.proActive"),
      value: (statistics?.proActiveCount ?? 0).toLocaleString(),
      icon: <FaUserShield />,
    },
    {
      id: "paidActive",
      label: t("stats.paidViaGateway"),
      value: (statistics?.paidActiveCount ?? 0).toLocaleString(),
      icon: <FaCheckCircle />,
    },
    {
      id: "adminGranted",
      label: t("stats.adminGranted"),
      value: (statistics?.adminGrantedCount ?? 0).toLocaleString(),
      icon: <FaUserCog />,
    },
    {
      id: "revenue",
      label: t("stats.totalRevenue"),
      value: formatPaymentAmount(
        statistics?.totalRevenue ?? 0,
        statistics?.currency ?? "EGP",
      ),
      icon: <FaWallet />,
    },
    {
      id: "month",
      label: t("stats.revenueThisMonth"),
      value: formatPaymentAmount(
        statistics?.revenueThisMonth ?? 0,
        statistics?.currency ?? "EGP",
      ),
      icon: <FaCreditCard />,
    },
    {
      id: "pending",
      label: t("stats.pending"),
      value: (statistics?.pendingCount ?? 0).toLocaleString(),
      icon: <FaClock />,
    },
    {
      id: "failed",
      label: t("stats.failed"),
      value: (statistics?.failedCount ?? 0).toLocaleString(),
      icon: <FaTimesCircle />,
    },
  ];

  return (
    <PageShell
      kind="table"
      header={
        <>
          {/* The back button is gone: the breadcrumb already says where this
              sits, and a duplicate control in the primary action slot spends
              the most valuable spot on the page on going backwards. */}
          <PageHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
          />

          {isDemo && (
            <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
          )}

          <StatGrid columns={4} ruled>
            {statCards.map((card) => (
              <StatCard
                key={card.id}
                label={card.label}
                value={<span lang="en">{card.value}</span>}
                icon={card.icon}
                loading={loading && !statistics}
              />
            ))}
            {/* Seven metrics leave a hole in the last row of an edge-shared
                grid, and the hole would show the rule colour, not a panel. */}
            <div className="bg-surface" aria-hidden />
          </StatGrid>
        </>
      }
      toolbar={
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
            filters={
              <>
                <Select
                  inputSize="sm"
                  aria-label={t("filters.source")}
                  value={sourceFilter}
                  onChange={(event) => {
                    setSourceFilter(
                      event.target.value as AdminSubscriptionSourceFilter,
                    );
                    setPage(1);
                  }}
                  wrapperClassName="w-auto"
                >
                  {SOURCE_FILTERS.map((source) => (
                    <option key={source} value={source}>
                      {t(`source.${source}`)}
                    </option>
                  ))}
                </Select>
                <Select
                  inputSize="sm"
                  aria-label={t("filters.subscriptionStatus")}
                  value={subscriptionStatusFilter}
                  onChange={(event) => {
                    setSubscriptionStatusFilter(
                      event.target.value as AdminSubscriptionStatusFilter,
                    );
                    setPage(1);
                  }}
                  wrapperClassName="w-auto"
                >
                  {SUBSCRIPTION_STATUS_FILTERS.map((subStatus) => (
                    <option key={subStatus} value={subStatus}>
                      {t(`subscriptionStatus.${subStatus}`)}
                    </option>
                  ))}
                </Select>
                <Select
                  inputSize="sm"
                  aria-label={t("filters.status")}
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as AdminPaymentStatusFilter,
                    );
                    setPage(1);
                  }}
                  wrapperClassName="w-auto"
                >
                  {STATUS_FILTERS.map((status) => (
                    <option key={status} value={status}>
                      {t(`filters.${status}`)}
                    </option>
                  ))}
                </Select>
                <SegmentedControl<AdminPaymentsPeriod>
                  label={t("filters.period")}
                  value={period}
                  onChange={(next) => {
                    setPeriod(next);
                    setPage(1);
                  }}
                  size="sm"
                  options={PERIODS.map((p) => ({
                    value: p,
                    label: t(`period.${p}`),
                  }))}
                />
              </>
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
      {/* Ten columns is past what any screen shows at once, so the operator gets
          the column and density controls rather than a horizontal scrollbar as
          the only answer. */}
      <DataTable<AdminPaymentTransaction>
        columns={columns}
        rows={transactions}
        getRowKey={(row, index) => String(row.id ?? index)}
        caption={t("title")}
        loading={loading}
        skeletonRows={10}
        tableId="admin-payments"
        stickyHeader
        columnControl
        densityControl
        labels={tableLabels}
        empty={
          searchQuery ? (
            <NoResultsState
              title={tCommon("noResultsTitle")}
              onClear={handleReset}
              clearLabel={t("reset")}
            />
          ) : (
            <EmptyState title={tCommon("noResultsTitle")} size="sm" />
          )
        }
      />
    </PageShell>
  );
}
