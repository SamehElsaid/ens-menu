"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import {
  AdminBarChart,
  AdminMetricsGrid,
  AdminRankedList,
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
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRemoveOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";
import { MdOutlineFastfood, MdOutlineTableBar } from "react-icons/md";
import { BiCategory } from "react-icons/bi";

const PERIODS: MenuAnalyticsPeriod[] = ["7d", "30d", "90d"];

type RankedItem = { id: number | string; label: string; count: number };

function InsightsPanelSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse">
      <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-slate-600 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-slate-100 dark:bg-slate-700/50"
          />
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  icon,
  children,
  dir,
}: {
  title: string;
  hint?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      dir={dir}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary text-xl shrink-0">{icon}</span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{hint}</p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </div>
  );
}

function ChangeBadge({
  value,
  label,
  dir,
}: {
  value: number;
  label: string;
  dir: "rtl" | "ltr";
}) {
  const isUp = value > 0;
  const isDown = value < 0;
  const Icon = isUp ? IoTrendingUpOutline : isDown ? IoTrendingDownOutline : IoRemoveOutline;
  const color = isUp
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
    : isDown
      ? "text-red-600 dark:text-red-400 bg-red-500/10"
      : "text-slate-500 bg-slate-500/10";

  return (
    <span
      dir={dir}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${color}`}
    >
      <Icon className="text-sm shrink-0" />
      {formatChangePercent(value)} {label}
    </span>
  );
}

function PeakHoursChart({
  points,
  locale,
  dir,
}: {
  points: { hour: number; count: number }[];
  locale: string;
  dir: "rtl" | "ltr";
}) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-36 pt-2 overflow-x-auto" dir={dir}>
      {points.map((point) => (
        <div
          key={point.hour}
          className="flex flex-col items-center gap-1.5 min-w-[2rem] flex-1"
        >
          <span className="text-[10px] font-semibold text-primary tabular-nums">
            {point.count}
          </span>
          <div className="w-full flex items-end justify-center h-20">
            <div
              className="w-full max-w-[1.75rem] rounded-t-md bg-orange-500/80 dark:bg-orange-500"
              style={{
                height: `${Math.max(8, (point.count / max) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
            {new Date(2000, 0, 1, point.hour).toLocaleTimeString(
              locale === "ar" ? "ar-EG" : "en-US",
              { hour: "numeric", hour12: true },
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusBreakdown({
  items,
  locale,
  dir,
}: {
  items: { label: string; count: number; status: string }[];
  locale: string;
  dir: "rtl" | "ltr";
}) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  const colors: Record<string, string> = {
    completed: "bg-emerald-500",
    pending: "bg-amber-500",
    cancelled: "bg-red-500",
  };

  return (
    <div className="space-y-3" dir={dir}>
      <div className="flex h-3 rounded-full overflow-hidden">
        {items.map((item) => (
          <div
            key={item.status}
            className={`${colors[item.status] ?? "bg-slate-400"}`}
            style={{ width: `${(item.count / total) * 100}%` }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.status}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span
                className={`w-2.5 h-2.5 rounded-full ${colors[item.status] ?? "bg-slate-400"}`}
              />
              {item.label}
            </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {item.count.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} (
              {Math.round((item.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GapItemsList({
  items,
  locale,
  dir,
}: {
  items: { id: number; label: string; views: number; orders: number }[];
  locale: string;
  dir: "rtl" | "ltr";
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-3" dir={dir}>
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-3"
        >
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
            {item.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {item.views.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}{" "}
            · {item.orders}{" "}
            {locale === "ar" ? "طلب" : "orders"}
          </p>
        </li>
      ))}
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
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" dir={dir}>
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300"
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function RevenueBarChart({
  points,
  locale,
  currency,
  dir,
  emptyMessage,
}: {
  points: { date: string; amount: number }[];
  locale: string;
  currency: string;
  dir: "rtl" | "ltr";
  emptyMessage: string;
}) {
  const chartPoints = points.map((p) => ({ date: p.date, count: p.amount }));
  if (chartPoints.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">
        {emptyMessage}
      </p>
    );
  }

  const max = Math.max(...chartPoints.map((p) => p.count), 1);

  return (
    <div className="flex items-end gap-2 h-40 pt-2 overflow-x-auto" dir={dir}>
      {chartPoints.map((point) => (
        <div
          key={point.date}
          className="flex flex-1 flex-col items-center gap-2 min-w-[2rem]"
        >
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {Math.round(point.count)}
          </span>
          <div className="w-full flex items-end justify-center h-24">
            <div
              className="w-full max-w-[2.5rem] rounded-t-lg bg-emerald-500/80 dark:bg-emerald-500"
              style={{
                height: `${Math.max(8, (point.count / max) * 100)}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center truncate w-full">
            {formatMenuChartDate(point.date, locale)}
          </span>
        </div>
      ))}
    </div>
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
        value: (s?.totalViews ?? displayTotalViews).toLocaleString(),
        tone: "amber",
      },
      {
        id: "today",
        label: t("viewsToday"),
        value: (s?.viewsToday ?? 0).toLocaleString(),
        tone: "orange",
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: (s?.viewsThisWeek ?? 0).toLocaleString(),
        tone: "sky",
      },
      {
        id: "active",
        label: t("activeItemsRate"),
        value: `${activeItemsRate}%`,
        tone: "primary",
      },
    ];
  }, [analytics?.summary, displayTotalViews, activeItemsRate, t]);

  const summaryMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    if (!s || isFreePlan) {
      return freeBasicMetrics;
    }

    const orders =
      s.totalOrders ?? totalOrders ?? (analytics?._isDemoData ? 0 : 0);

    return [
      {
        id: "views",
        label: t("totalViews"),
        value: (s.totalViews ?? displayTotalViews).toLocaleString(),
        tone: "amber",
      },
      {
        id: "today",
        label: t("viewsToday"),
        value: s.viewsToday.toLocaleString(),
        tone: "orange",
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: s.viewsThisWeek.toLocaleString(),
        tone: "sky",
      },
      {
        id: "orders",
        label: t("totalOrders"),
        value: orders.toLocaleString(),
        tone: "emerald",
      },
      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s.conversionRate ?? 0}%`,
        tone: "purple",
      },
      {
        id: "aov",
        label: t("averageOrderValue"),
        value: formatMenuCurrency(s.averageOrderValue ?? 0, currency, locale),
        tone: "primary",
      },
      {
        id: "revToday",
        label: t("revenueToday"),
        value: formatMenuCurrency(s.revenueToday ?? 0, currency, locale),
        tone: "emerald",
      },
      {
        id: "revWeek",
        label: t("revenueThisWeek"),
        value: formatMenuCurrency(s.revenueThisWeek ?? 0, currency, locale),
        tone: "sky",
      },
      {
        id: "active",
        label: t("activeItemsRate"),
        value: `${activeItemsRate}%`,
        tone: "slate",
      },
      {
        id: "tables",
        label: t("tablesCount"),
        value: tablesCount,
        tone: "slate",
      },
    ];
  }, [
    analytics,
    isFreePlan,
    displayTotalViews,
    activeItemsRate,
    tablesCount,
    totalOrders,
    currency,
    locale,
    t,
    freeBasicMetrics,
  ]);

  const quickSummaryMetrics = useMemo<MetricItem[]>(() => {
    if (isFreePlan) return freeBasicMetrics;

    const s = analytics?.summary;
    if (!s) {
      return freeBasicMetrics;
    }

    const orders =
      s.totalOrders ?? totalOrders ?? (analytics?._isDemoData ? 0 : 0);

    return [
      {
        id: "today",
        label: t("viewsToday"),
        value: s.viewsToday.toLocaleString(),
        tone: "orange",
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: s.viewsThisWeek.toLocaleString(),
        tone: "sky",
      },
      {
        id: "orders",
        label: t("totalOrders"),
        value: orders.toLocaleString(),
        tone: "emerald",
      },
      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s.conversionRate ?? 0}%`,
        tone: "purple",
      },
    ];
  }, [
    analytics,
    isFreePlan,
    displayTotalViews,
    activeItemsRate,
    totalOrders,
    t,
    freeBasicMetrics,
  ]);

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
        label:
          locale === "ar"
            ? s.labelAr || s.status
            : s.labelEn || s.status,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanelSkeleton />
        {!isFreePlan && <InsightsPanelSkeleton />}
      </div>
    );
  }

  if (isQuick) {
    return (
      <div className="space-y-4" dir={textDir}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IoStatsChartOutline className="text-primary text-xl" />
            {t("quickInsightsTitle")}
          </h2>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/analytics`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("viewFullAnalytics")}
            <IoChevronForwardOutline
              className={`text-base ${locale === "ar" ? "rotate-180" : ""}`}
            />
          </LinkTo>
        </div>

        {analytics?._isDemoData && (
          <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
        )}

        <div
          className={`grid grid-cols-1 gap-4 ${isFreePlan ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <AdminMetricsGrid
              items={quickSummaryMetrics}
              columns={2}
              dir={textDir}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {t("topVisitedItems")}
            </p>
            <AdminRankedList
              items={topVisitedItems.slice(0, 3)}
              dir={textDir}
              emptyMessage={t("noVisitData")}
            />
          </div>

          {!isFreePlan && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {t("topOrderedItems")}
              </p>
              <AdminRankedList
                items={topOrderedDisplay.slice(0, 3)}
                dir={textDir}
                emptyMessage={t("noOrderData")}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isFreePlan && analytics) {
    return (
      <div className="space-y-6" dir={textDir}>
        {analytics._isDemoData && (
          <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          {t("freePlanLimit7d")}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title={t("insightsTitle")}
            icon={<IoStatsChartOutline />}
            dir={textDir}
          >
            <AdminMetricsGrid
              items={freeBasicMetrics}
              columns={2}
              dir={textDir}
            />
          </SectionCard>

          <SectionCard
            title={t("topVisitedItems")}
            hint={t("topVisitedItemsHint")}
            icon={<IoEyeOutline />}
            dir={textDir}
          >
            <AdminRankedList
              items={topVisitedItems}
              dir={textDir}
              emptyMessage={t("noVisitData")}
            />
          </SectionCard>
        </div>

        <SectionCard
          title={t("viewsChartTitle7d")}
          icon={<FaChartLine />}
          dir={textDir}
        >
          <AdminBarChart
            points={analytics.viewsOverTime}
            locale={locale}
            dir={textDir}
            emptyMessage={t("noVisitData")}
          />
        </SectionCard>
      </div>
    );
  }

  if (isFreePlan) {
    return null;
  }

  return (
    <div className="space-y-6" dir={textDir}>
      {analytics?._isDemoData && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {onPeriodChange && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {t(`period.${p}`)}
              </button>
            ))}
          </div>
          {analytics && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <IoDownloadOutline className="text-lg" />
              {t("exportCsv")}
            </button>
          )}
        </div>
      )}

      {analytics?.comparison && (
        <div className="flex flex-wrap gap-2">
          <ChangeBadge
            value={analytics.comparison.viewsChangePercent}
            label={t("vsPreviousPeriod")}
            dir={textDir}
          />
          <ChangeBadge
            value={analytics.comparison.ordersChangePercent}
            label={t("ordersVsPrevious")}
            dir={textDir}
          />
          <ChangeBadge
            value={analytics.comparison.revenueChangePercent}
            label={t("revenueVsPrevious")}
            dir={textDir}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title={t("insightsTitle")}
          icon={<IoStatsChartOutline />}
          dir={textDir}
        >
          <AdminMetricsGrid items={summaryMetrics} columns={3} dir={textDir} />
        </SectionCard>

        <SectionCard
          title={t("topVisitedItems")}
          hint={t("topVisitedItemsHint")}
          icon={<IoEyeOutline />}
          dir={textDir}
        >
          <AdminRankedList
            items={topVisitedItems}
            dir={textDir}
            emptyMessage={t("noVisitData")}
          />
        </SectionCard>

        <SectionCard
          title={t("topOrderedItems")}
          hint={t("topOrderedItemsHint")}
          icon={<IoReceiptOutline />}
          dir={textDir}
        >
          <AdminRankedList
            items={topOrderedDisplay}
            dir={textDir}
            emptyMessage={t("noOrderData")}
          />
        </SectionCard>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title={viewsChartTitle}
              icon={<FaChartLine />}
              dir={textDir}
            >
              <AdminBarChart
                points={analytics.viewsOverTime}
                locale={locale}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </SectionCard>

            <SectionCard
              title={t("revenueChartTitle")}
              icon={<FaChartLine />}
              dir={textDir}
            >
              <RevenueBarChart
                points={analytics.revenueOverTime ?? []}
                locale={locale}
                currency={currency}
                dir={textDir}
                emptyMessage={t("noRevenueData")}
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title={t("peakHoursTitle")}
              hint={t("peakHoursHint")}
              icon={<IoTimeOutline />}
              dir={textDir}
            >
              <PeakHoursChart
                points={analytics.peakHours ?? []}
                locale={locale}
                dir={textDir}
              />
            </SectionCard>

            <SectionCard
              title={t("orderStatusTitle")}
              hint={t("orderStatusHint")}
              icon={<IoReceiptOutline />}
              dir={textDir}
            >
              <StatusBreakdown
                items={statusItems}
                locale={locale}
                dir={textDir}
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title={t("topTablesTitle")}
              hint={t("topTablesHint")}
              icon={<MdOutlineTableBar />}
              dir={textDir}
            >
              <AdminRankedList
                items={topTables}
                dir={textDir}
                emptyMessage={t("noTableData")}
              />
            </SectionCard>

            <SectionCard
              title={t("topCategoriesTitle")}
              hint={t("topCategoriesHint")}
              icon={<BiCategory />}
              dir={textDir}
            >
              <AdminRankedList
                items={topCategories}
                dir={textDir}
                emptyMessage={t("noCategoryData")}
              />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title={t("viewToOrderGapTitle")}
              hint={t("viewToOrderGapHint")}
              icon={<IoEyeOutline />}
              dir={textDir}
            >
              {gapItems.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  {t("noGapData")}
                </p>
              ) : (
                <GapItemsList items={gapItems} locale={locale} dir={textDir} />
              )}
            </SectionCard>

            <SectionCard
              title={t("deadItemsTitle")}
              hint={t("deadItemsHint")}
              icon={<MdOutlineFastfood />}
              dir={textDir}
            >
              {deadItems.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  {t("noDeadItems")}
                </p>
              ) : (
                <DeadItemsList items={deadItems} dir={textDir} />
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title={t("staffPerformanceTitle")}
              hint={t("staffPerformanceHint")}
              icon={<IoStatsChartOutline />}
              dir={textDir}
            >
              <AdminRankedList
                items={staffItems}
                dir={textDir}
                emptyMessage={t("noStaffData")}
              />
            </SectionCard>

            {analytics.adMetrics && (
              <SectionCard
                title={t("adMetricsTitle")}
                hint={t("adMetricsHint")}
                icon={<IoEyeOutline />}
                dir={textDir}
              >
                <AdminMetricsGrid
                  items={[
                    {
                      id: "imp",
                      label: t("adImpressions"),
                      value:
                        analytics.adMetrics.totalImpressions.toLocaleString(),
                      tone: "sky",
                    },
                    {
                      id: "clk",
                      label: t("adClicks"),
                      value: analytics.adMetrics.totalClicks.toLocaleString(),
                      tone: "amber",
                    },
                    {
                      id: "ctr",
                      label: t("adCtr"),
                      value: `${analytics.adMetrics.averageCtr}%`,
                      tone: "emerald",
                    },
                  ]}
                  columns={3}
                  dir={textDir}
                />
                <LinkTo
                  href={`/dashboard/${menuSlugOrId}/advertisements`}
                  className="mt-4 inline-flex text-sm text-primary hover:underline"
                >
                  {t("viewAdsPage")}
                </LinkTo>
              </SectionCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}
