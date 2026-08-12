"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import {
  AdminBarChart,
  AdminMetricsGrid,
  AdminRankedList,
  AdminSectionCard,
  DemoDataBanner,
  type MetricItem,
} from "@/components/Admin/AdminAnalyticsWidgets";
import {
  getAnalyticsItemName,
  formatMenuChartDate,
  formatMenuCurrency,
  formatChangePercent,
  exportMenuAnalyticsCsv,
} from "@/lib/fetchMenuAnalytics";
import type {
  MenuAnalyticsPeriod,
  MenuAnalyticsResponse,
} from "@/types/MenuAnalytics";
import {
  IoEyeOutline,
  IoReceiptOutline,
  IoStatsChartOutline,
  IoDownloadOutline,
  IoTimeOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";
import { MdOutlineFastfood, MdOutlineTableBar } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  SkeletonRegion,
  StatCard,
  StatGrid,
  Toolbar,
} from "@/components/ui";

const PERIODS: MenuAnalyticsPeriod[] = ["7d", "30d", "90d"];

type RankedItem = { id: number | string; label: string; count: number };

function InsightsPanelSkeleton() {
  return (
    <SkeletonRegion label="Loading analytics">
      <Card padded="lg">
        <Skeleton className="mb-4 h-4 w-32" rounded="sm" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" rounded="lg" />
          ))}
        </div>
      </Card>
    </SkeletonRegion>
  );
}

/**
 * Period-over-period movement, as an instrument rail.
 *
 * Three coloured pills gave the reader three hues and no figures worth reading.
 * These are the same three numbers set as metrics with a direction arrow, so
 * the movement is legible in greyscale and the label says which way is good.
 */
function ComparisonRail({
  comparison,
  labels,
  periodLabel,
  dir,
}: {
  comparison: { views: number; orders: number; revenue: number };
  labels: { views: string; orders: string; revenue: string };
  periodLabel: string;
  dir: "rtl" | "ltr";
}) {
  const rows = [
    { id: "views", label: labels.views, value: comparison.views },
    { id: "orders", label: labels.orders, value: comparison.orders },
    { id: "revenue", label: labels.revenue, value: comparison.revenue },
  ];

  return (
    <div dir={dir}>
      <StatGrid columns={3} ruled>
        {rows.map((row) => (
          <StatCard
            key={row.id}
            label={row.label}
            value={
              <span lang="en">
                {formatChangePercent(row.value)}
              </span>
            }
            delta={
              row.value === 0
                ? undefined
                : {
                    value: formatChangePercent(Math.abs(row.value)),
                    direction: row.value > 0 ? "up" : "down",
                  }
            }
            hint={periodLabel}
          />
        ))}
      </StatGrid>
    </div>
  );
}

/** Order status → token. Every consumer also prints the label, so the hue is
 *  a second reading rather than the only one. */
const statusFill: Record<string, string> = {
  completed: "bg-success",
  pending: "bg-warning",
  cancelled: "bg-danger",
};

function StatusBreakdown({
  items,
  dir,
  emptyMessage,
}: {
  items: { label: string; count: number; status: string }[];
  dir: "rtl" | "ltr";
  emptyMessage: string;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return <EmptyState title={emptyMessage} size="sm" />;

  return (
    <div dir={dir}>
      <div
        className="flex h-2 overflow-hidden rounded-sm bg-surface-3"
        role="presentation"
      >
        {items.map((item) => (
          <div
            key={item.status}
            className={statusFill[item.status] ?? "bg-line-strong"}
            style={{ width: `${(item.count / total) * 100}%` }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <ul className="mt-3">
        {items.map((item) => (
          <li
            key={item.status}
            className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0"
          >
            <span className="flex items-center gap-2 text-sm text-fg">
              <span
                aria-hidden
                className={`size-2 shrink-0 rounded-sm ${statusFill[item.status] ?? "bg-line-strong"}`}
              />
              {item.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span lang="en" className="ui-figure text-[13px] text-fg">
                {item.count.toLocaleString("en-US")}
              </span>
              <span lang="en" className="ui-label text-fg-subtle">
                {Math.round((item.count / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Items that get looked at but not ordered.
 *
 * This is a diagnostic list, so it is set as a ledger with both figures and
 * the derived conversion rate visible — the amber boxes it replaces flagged
 * every row as a warning without ever saying how bad each one was.
 */
function GapItemsList({
  items,
  dir,
  viewsLabel,
  ordersLabel,
}: {
  items: { id: number; label: string; views: number; orders: number }[];
  dir: "rtl" | "ltr";
  viewsLabel: string;
  ordersLabel: string;
}) {
  return (
    <ul dir={dir}>
      {items.map((item) => {
        const rate = item.views > 0 ? (item.orders / item.views) * 100 : 0;
        return (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-fg">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-fg-subtle">
                <span lang="en">{item.views.toLocaleString("en-US")}</span>{" "}
                {viewsLabel} ·{" "}
                <span lang="en">{item.orders.toLocaleString("en-US")}</span>{" "}
                {ordersLabel}
              </p>
            </div>
            <span
              lang="en"
              className="ui-figure shrink-0 text-[13px] text-warning"
            >
              {rate.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DeadItemsList({
  items,
  dir,
}: {
  items: { id: number; label: string }[];
  dir: "rtl" | "ltr";
}) {
  return (
    <ul className="flex flex-wrap gap-1.5" dir={dir}>
      {items.map((item) => (
        <li key={item.id}>
          <Badge tone="neutral" size="md">
            {item.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export type MenuProAnalyticsProps = {
  variant?: "quick" | "full";
  analytics: MenuAnalyticsResponse | null;
  loading: boolean;
  isFreePlan: boolean;
  locale: string;
  menuSlugOrId: string;
  period?: MenuAnalyticsPeriod;
  onPeriodChange?: (period: MenuAnalyticsPeriod) => void;
  displayTotalViews: number;
  activeItemsRate: number;
  tablesCount: number;
  totalOrders: number;
  topOrderedDisplay: RankedItem[];
};

export default function MenuProAnalytics({
  variant = "full",
  analytics,
  loading,
  isFreePlan,
  locale,
  menuSlugOrId,
  period = "7d",
  onPeriodChange,
  displayTotalViews,
  activeItemsRate,
  tablesCount,
  totalOrders,
  topOrderedDisplay,
}: MenuProAnalyticsProps) {
  const isQuick = variant === "quick";
  const t = useTranslations("menuOverview");
  const textDir = locale === "ar" ? "rtl" : "ltr";
  const currency = analytics?.summary.currency ?? "EGP";

  const topVisitedItems = useMemo(
    () =>
      (analytics?.topVisitedItems ?? []).map((item) => ({
        id: item.id,
        label: getAnalyticsItemName(item, locale),
        count: item.views,
      })),
    [analytics?.topVisitedItems, locale],
  );

  const freeBasicMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    return [
      {
        id: "views",
        label: t("totalViews"),
        value: (s?.totalViews ?? displayTotalViews).toLocaleString("en-US"),
      },
      {
        id: "today",
        label: t("viewsToday"),
        value: (s?.viewsToday ?? 0).toLocaleString("en-US"),
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: (s?.viewsThisWeek ?? 0).toLocaleString("en-US"),
      },
      {
        id: "active",
        label: t("activeItemsRate"),
        value: `${activeItemsRate}%`,
      },
    ];
  }, [analytics?.summary, displayTotalViews, activeItemsRate, t]);

  /**
   * The ten summary figures, split in two.
   *
   * Ten metrics in one grid is a wall: nothing is more important than anything
   * else and the reader has to read all ten to find the one they came for. Split
   * into traffic and trade, each rail answers one question, and a four-column
   * rail followed by a three-column one divides evenly at every breakpoint
   * instead of leaving holes in a ruled panel.
   */
  const trafficMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    return [
      {
        id: "views",
        label: t("totalViews"),
        value: (s?.totalViews ?? displayTotalViews).toLocaleString("en-US"),
      },
      {
        id: "today",
        label: t("viewsToday"),
        value: (s?.viewsToday ?? 0).toLocaleString("en-US"),
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: (s?.viewsThisWeek ?? 0).toLocaleString("en-US"),
      },
      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s?.conversionRate ?? 0}%`,
      },
    ];
  }, [analytics?.summary, displayTotalViews, t]);

  const tradeMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    const orders = s?.totalOrders ?? totalOrders ?? 0;

    return [
      {
        id: "orders",
        label: t("totalOrders"),
        value: orders.toLocaleString("en-US"),
      },
      {
        id: "aov",
        label: t("averageOrderValue"),
        value: formatMenuCurrency(s?.averageOrderValue ?? 0, currency, locale),
      },
      {
        id: "revToday",
        label: t("revenueToday"),
        value: formatMenuCurrency(s?.revenueToday ?? 0, currency, locale),
      },
      {
        id: "revWeek",
        label: t("revenueThisWeek"),
        value: formatMenuCurrency(s?.revenueThisWeek ?? 0, currency, locale),
      },
      {
        id: "active",
        label: t("activeItemsRate"),
        value: `${activeItemsRate}%`,
      },
      {
        id: "tables",
        label: t("tablesCount"),
        value: tablesCount.toLocaleString("en-US"),
      },
    ];
  }, [
    analytics?.summary,
    activeItemsRate,
    tablesCount,
    totalOrders,
    currency,
    locale,
    t,
  ]);

  const quickSummaryMetrics = useMemo<MetricItem[]>(() => {
    if (isFreePlan) return freeBasicMetrics;

    const s = analytics?.summary;
    if (!s) {
      return freeBasicMetrics;
    }

    const orders = s.totalOrders ?? totalOrders ?? 0;

    return [
      {
        id: "today",
        label: t("viewsToday"),
        value: s.viewsToday.toLocaleString("en-US"),
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: s.viewsThisWeek.toLocaleString("en-US"),
      },
      {
        id: "orders",
        label: t("totalOrders"),
        value: orders.toLocaleString("en-US"),
      },
      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s.conversionRate ?? 0}%`,
      },
    ];
  }, [analytics?.summary, isFreePlan, totalOrders, t, freeBasicMetrics]);

  const topTables = useMemo(
    () =>
      (analytics?.topTables ?? []).map((tbl, i) => ({
        id: `tbl-${i}`,
        label: `${tbl.tableNumber} · ${formatMenuCurrency(tbl.revenue, currency, locale)}`,
        count: tbl.orders,
      })),
    [analytics?.topTables, currency, locale],
  );

  const topCategories = useMemo(
    () =>
      (analytics?.topCategories ?? []).map((cat) => ({
        id: cat.id,
        label: getAnalyticsItemName(cat, locale),
        count: cat.orders,
      })),
    [analytics?.topCategories, locale],
  );

  const staffItems = useMemo(
    () =>
      (analytics?.staffPerformance ?? []).map((s, i) => ({
        id: `staff-${i}`,
        label: s.name,
        count: s.ordersHandled,
      })),
    [analytics?.staffPerformance],
  );

  const gapItems = useMemo(
    () =>
      (analytics?.viewToOrderGap ?? []).map((item) => ({
        id: item.id,
        label: getAnalyticsItemName(item, locale),
        views: item.views,
        orders: item.orders,
      })),
    [analytics?.viewToOrderGap, locale],
  );

  const deadItems = useMemo(
    () =>
      (analytics?.deadItems ?? []).map((item) => ({
        id: item.id,
        label: getAnalyticsItemName(item, locale),
      })),
    [analytics?.deadItems, locale],
  );

  const statusItems = useMemo(
    () =>
      (analytics?.orderStatusBreakdown ?? []).map((s) => ({
        status: s.status,
        label: locale === "ar" ? s.labelAr || s.status : s.labelEn || s.status,
        count: s.count,
      })),
    [analytics?.orderStatusBreakdown, locale],
  );

  const viewsChartTitle =
    period === "7d"
      ? t("viewsChartTitle7d")
      : period === "30d"
        ? t("viewsChartTitle30d")
        : t("viewsChartTitle90d");

  const handleExport = () => {
    if (!analytics) return;
    exportMenuAnalyticsCsv(analytics, locale, menuSlugOrId);
  };

  if (loading) {
    if (isQuick) {
      return <InsightsPanelSkeleton />;
    }
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightsPanelSkeleton />
        {!isFreePlan && <InsightsPanelSkeleton />}
      </div>
    );
  }

  /**
   * The overview's inset panel.
   *
   * Metrics run edge to edge across the top as one rail, and the two ranked
   * lists sit below sharing a rule — the previous three floating cards read as
   * unrelated widgets and put the numbers at three different scales.
   */
  if (isQuick) {
    return (
      <section className="flex flex-col gap-3" dir={textDir}>
        <SectionHeader
          eyebrow={t("analytics")}
          title={t("quickInsightsTitle")}
          actions={
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/analytics`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              {t("viewFullAnalytics")}
              <IoChevronForwardOutline
                className="size-3.5 rtl:-scale-x-100"
                aria-hidden
              />
            </LinkTo>
          }
        />

        {analytics?._isDemoData && (
          <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
        )}

        <AdminMetricsGrid
          items={quickSummaryMetrics}
          columns={4}
          dir={textDir}
          ruled
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card padded="md">
            <p className="ui-label mb-2 text-fg-muted">
              {t("topVisitedItems")}
            </p>
            <AdminRankedList
              items={topVisitedItems.slice(0, 3)}
              dir={textDir}
              emptyMessage={t("noVisitData")}
            />
          </Card>

          {!isFreePlan && (
            <Card padded="md">
              <p className="ui-label mb-2 text-fg-muted">
                {t("topOrderedItems")}
              </p>
              <AdminRankedList
                items={topOrderedDisplay.slice(0, 3)}
                dir={textDir}
                emptyMessage={t("noOrderData")}
              />
            </Card>
          )}
        </div>
      </section>
    );
  }

  /**
   * Free plan.
   *
   * The metrics lead as a rail, the 7-day ceiling is stated once as an inline
   * note rather than a shouting banner, and the chart gets the full width —
   * with four metrics there is no reason to squeeze it into half a row.
   */
  if (isFreePlan && analytics) {
    return (
      <div className="flex flex-col gap-4" dir={textDir}>
        {analytics._isDemoData && (
          <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
        )}

        <AdminMetricsGrid
          items={freeBasicMetrics}
          columns={4}
          dir={textDir}
          ruled
        />

        <p className="ui-label text-fg-subtle">{t("freePlanLimit7d")}</p>

        <AdminSectionCard
          title={t("viewsChartTitle7d")}
          icon={<FaChartLine aria-hidden />}
          dir={textDir}
        >
          <AdminBarChart
            points={analytics.viewsOverTime}
            locale={locale}
            dir={textDir}
            emptyMessage={t("noVisitData")}
          />
        </AdminSectionCard>

        <AdminSectionCard
          title={t("topVisitedItems")}
          subtitle={t("topVisitedItemsHint")}
          icon={<IoEyeOutline aria-hidden />}
          dir={textDir}
        >
          <AdminRankedList
            items={topVisitedItems}
            dir={textDir}
            emptyMessage={t("noVisitData")}
          />
        </AdminSectionCard>
      </div>
    );
  }

  if (isFreePlan) {
    return null;
  }

  /**
   * The full report.
   *
   * The old page was fourteen identical cards in seven equal two-column rows —
   * every panel claimed the same importance, so the page had no reading order.
   * This version is four named acts: the headline figures as edge-sharing rails,
   * then the time series, then demand (what sells, where, to whom), then the
   * two diagnostic lists that tell the owner what to fix. Each act is announced
   * by a ruled section header, which is what lets someone scroll to the part
   * they want instead of scanning every card title.
   */
  return (
    <div className="flex flex-col gap-8" dir={textDir}>
      {analytics?._isDemoData && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {onPeriodChange && (
        <Toolbar
          filters={
            <SegmentedControl
              label={t("analytics")}
              value={period}
              onChange={onPeriodChange}
              options={PERIODS.map((p) => ({
                value: p,
                label: t(`period.${p}`),
              }))}
            />
          }
          actions={
            analytics ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExport}
                startIcon={<IoDownloadOutline aria-hidden />}
              >
                {t("exportCsv")}
              </Button>
            ) : null
          }
        />
      )}

      <section className="flex flex-col gap-3">
        <SectionHeader
          ruled
          eyebrow={t("insightsTitle")}
          title={t("totalViews")}
          description={t("topVisitedItemsHint")}
        />
        <AdminMetricsGrid
          items={trafficMetrics}
          columns={4}
          dir={textDir}
          ruled
        />

        {analytics?.comparison && (
          <ComparisonRail
            dir={textDir}
            periodLabel={t(`period.${period}`)}
            comparison={{
              views: analytics.comparison.viewsChangePercent,
              orders: analytics.comparison.ordersChangePercent,
              revenue: analytics.comparison.revenueChangePercent,
            }}
            labels={{
              views: t("vsPreviousPeriod"),
              orders: t("ordersVsPrevious"),
              revenue: t("revenueVsPrevious"),
            }}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          ruled
          eyebrow={t("totalOrders")}
          title={t("revenueChartTitle")}
        />
        <AdminMetricsGrid items={tradeMetrics} columns={3} dir={textDir} ruled />
      </section>

      {analytics && (
        <>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <AdminSectionCard
              title={viewsChartTitle}
              icon={<FaChartLine aria-hidden />}
              dir={textDir}
            >
              <AdminBarChart
                points={analytics.viewsOverTime}
                locale={locale}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </AdminSectionCard>

            <AdminSectionCard
              title={t("revenueChartTitle")}
              icon={<FaChartLine aria-hidden />}
              dir={textDir}
            >
              <AdminBarChart
                points={(analytics.revenueOverTime ?? []).map((p) => ({
                  date: p.date,
                  count: p.amount,
                }))}
                locale={locale}
                dir={textDir}
                tone="success"
                formatValue={(v) => formatMenuCurrency(v, currency, locale)}
                formatLabel={(d) => formatMenuChartDate(d, locale)}
                emptyMessage={t("noRevenueData")}
              />
            </AdminSectionCard>

            <AdminSectionCard
              title={t("peakHoursTitle")}
              subtitle={t("peakHoursHint")}
              icon={<IoTimeOutline aria-hidden />}
              dir={textDir}
            >
              <AdminBarChart
                points={(analytics.peakHours ?? []).map((p) => ({
                  date: String(p.hour),
                  count: p.count,
                }))}
                locale={locale}
                dir={textDir}
                tone="accent"
                formatLabel={(hour) =>
                  new Date(2000, 0, 1, Number(hour)).toLocaleTimeString(
                    locale === "ar" ? "ar-EG" : "en-US",
                    { hour: "numeric", hour12: true },
                  )
                }
                emptyMessage={t("noVisitData")}
              />
            </AdminSectionCard>

            <AdminSectionCard
              title={t("orderStatusTitle")}
              subtitle={t("orderStatusHint")}
              icon={<IoReceiptOutline aria-hidden />}
              dir={textDir}
            >
              <StatusBreakdown
                items={statusItems}
                dir={textDir}
                emptyMessage={t("noOrderData")}
              />
            </AdminSectionCard>
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader
              ruled
              eyebrow={t("analytics")}
              title={t("topOrderedItems")}
              description={t("topOrderedItemsHint")}
            />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
              <AdminSectionCard
                title={t("topVisitedItems")}
                icon={<IoEyeOutline aria-hidden />}
                dir={textDir}
              >
                <AdminRankedList
                  items={topVisitedItems}
                  dir={textDir}
                  emptyMessage={t("noVisitData")}
                />
              </AdminSectionCard>

              <AdminSectionCard
                title={t("topOrderedItems")}
                icon={<IoReceiptOutline aria-hidden />}
                dir={textDir}
              >
                <AdminRankedList
                  items={topOrderedDisplay}
                  dir={textDir}
                  emptyMessage={t("noOrderData")}
                />
              </AdminSectionCard>

              <AdminSectionCard
                title={t("topCategoriesTitle")}
                icon={<BiCategory aria-hidden />}
                dir={textDir}
              >
                <AdminRankedList
                  items={topCategories}
                  dir={textDir}
                  emptyMessage={t("noCategoryData")}
                />
              </AdminSectionCard>

              <AdminSectionCard
                title={t("topTablesTitle")}
                icon={<MdOutlineTableBar aria-hidden />}
                dir={textDir}
              >
                <AdminRankedList
                  items={topTables}
                  dir={textDir}
                  emptyMessage={t("noTableData")}
                />
              </AdminSectionCard>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader
              ruled
              eyebrow={t("analytics")}
              title={t("viewToOrderGapTitle")}
              description={t("viewToOrderGapHint")}
            />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <AdminSectionCard
                title={t("viewToOrderGapTitle")}
                icon={<IoEyeOutline aria-hidden />}
                dir={textDir}
              >
                {gapItems.length === 0 ? (
                  <EmptyState title={t("noGapData")} size="sm" />
                ) : (
                  <GapItemsList
                    items={gapItems}
                    dir={textDir}
                    viewsLabel={t("totalViews")}
                    ordersLabel={t("totalOrders")}
                  />
                )}
              </AdminSectionCard>

              <AdminSectionCard
                title={t("deadItemsTitle")}
                subtitle={t("deadItemsHint")}
                icon={<MdOutlineFastfood aria-hidden />}
                dir={textDir}
              >
                {deadItems.length === 0 ? (
                  <EmptyState title={t("noDeadItems")} size="sm" />
                ) : (
                  <DeadItemsList items={deadItems} dir={textDir} />
                )}
              </AdminSectionCard>

              <AdminSectionCard
                title={t("staffPerformanceTitle")}
                subtitle={t("staffPerformanceHint")}
                icon={<IoStatsChartOutline aria-hidden />}
                dir={textDir}
              >
                <AdminRankedList
                  items={staffItems}
                  dir={textDir}
                  emptyMessage={t("noStaffData")}
                />
              </AdminSectionCard>
            </div>
          </section>

          {analytics.adMetrics && (
            <section className="flex flex-col gap-3">
              <SectionHeader
                ruled
                eyebrow={t("analytics")}
                title={t("adMetricsTitle")}
                description={t("adMetricsHint")}
                actions={
                  <LinkTo
                    href={`/dashboard/${menuSlugOrId}/advertisements`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                  >
                    {t("viewAdsPage")}
                    <IoChevronForwardOutline
                      className="size-3.5 rtl:-scale-x-100"
                      aria-hidden
                    />
                  </LinkTo>
                }
              />
              <AdminMetricsGrid
                ruled
                columns={3}
                dir={textDir}
                items={[
                  {
                    id: "imp",
                    label: t("adImpressions"),
                    value:
                      analytics.adMetrics.totalImpressions.toLocaleString(
                        "en-US",
                      ),
                  },
                  {
                    id: "clk",
                    label: t("adClicks"),
                    value:
                      analytics.adMetrics.totalClicks.toLocaleString("en-US"),
                  },
                  {
                    id: "ctr",
                    label: t("adCtr"),
                    value: `${analytics.adMetrics.averageCtr}%`,
                  },
                ]}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
