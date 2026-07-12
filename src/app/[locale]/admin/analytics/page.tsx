"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoEyeOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoGlobeOutline,
  IoReceiptOutline,
  IoLinkOutline,
} from "react-icons/io5";
import { FaChartLine, FaCreditCard } from "react-icons/fa";
import LinkTo from "@/components/Global/LinkTo";
import {
  AdminBarChart,
  AdminMetricsGrid,
  AdminMonthGrid,
  AdminRankedList,
  AdminSectionCard,
  DemoDataBanner,
  type MetricItem,
} from "@/components/Admin/AdminAnalyticsWidgets";
import {
  fetchAdminAnalytics,
  formatAdminDate,
  getAdminMenuLabel,
  getAdminProductLabel,
} from "@/lib/fetchAdminAnalytics";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import {
  publicMenuLinkUrl,
  resolvePublicMenuSlug,
} from "@/lib/publicMenuUrl";
import type {
  AdminAnalyticsPeriod,
  AdminAnalyticsResponse,
} from "@/types/AdminAnalytics";

const PERIODS: AdminAnalyticsPeriod[] = ["7d", "30d", "90d"];

export default function AdminAnalyticsPage() {
  const locale = useLocale();
  const t = useTranslations("adminAnalytics");
  const router = useRouter();
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [period, setPeriod] = useState<AdminAnalyticsPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminAnalytics(locale, period);
    setAnalytics(data);
    setLoading(false);
  }, [locale, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const summaryMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    if (!s) return [];
    return [
      {
        id: "views",
        label: t("totalMenuViews"),
        value: s.totalMenuViews.toLocaleString(),
        tone: "amber",
      },
      {
        id: "today",
        label: t("viewsToday"),
        value: s.menuViewsToday.toLocaleString(),
        tone: "orange",
      },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: s.menuViewsThisWeek.toLocaleString(),
        tone: "sky",
      },
      {
        id: "orders",
        label: t("totalOrders"),
        value: s.totalOrders.toLocaleString(),
        tone: "emerald",
      },
      {
        id: "activeMenus",
        label: t("activeMenus"),
        value: s.activeMenus.toLocaleString(),
        tone: "primary",
      },
      {
        id: "inactiveMenus",
        label: t("inactiveMenus"),
        value: s.inactiveMenus.toLocaleString(),
        tone: "slate",
      },
      {
        id: "free",
        label: t("freeUsers"),
        value: s.freeUsers.toLocaleString(),
        tone: "slate",
      },
      {
        id: "pro",
        label: t("proUsers"),
        value: s.proUsers.toLocaleString(),
        tone: "purple",
      },
      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s.conversionRate}%`,
        tone: "emerald",
      },
      {
        id: "noMenu",
        label: t("usersWithoutMenu"),
        value: s.usersWithoutMenu.toLocaleString(),
        tone: "orange",
      },
      {
        id: "expiring",
        label: t("expiringSubscriptions"),
        value: s.expiringSubscriptions.toLocaleString(),
        tone: "amber",
      },
      {
        id: "inactive30",
        label: t("inactiveUsers30d"),
        value: s.inactiveUsers30d.toLocaleString(),
        tone: "slate",
      },
    ];
  }, [analytics?.summary, t]);

  const adMetrics = useMemo<MetricItem[]>(() => {
    if (!analytics) return [];
    const a = analytics.adMetrics ?? {
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
    };
    return [
      {
        id: "impressions",
        label: t("adImpressions"),
        value: a.totalImpressions.toLocaleString(),
        tone: "sky",
      },
      {
        id: "clicks",
        label: t("adClicks"),
        value: a.totalClicks.toLocaleString(),
        tone: "purple",
      },
      {
        id: "ctr",
        label: t("averageCtr"),
        value: `${a.averageCtr}%`,
        tone: "emerald",
      },
    ];
  }, [analytics, t]);

  const freeBannerMetrics = useMemo<MetricItem[]>(() => {
    if (!analytics) return [];
    const b = analytics.freeBannerMetrics ?? {
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
      topMenusByClicks: [],
    };
    return [
      {
        id: "bannerImpressions",
        label: t("freeBannerImpressions"),
        value: b.totalImpressions.toLocaleString(),
        tone: "sky",
      },
      {
        id: "bannerClicks",
        label: t("freeBannerClicks"),
        value: b.totalClicks.toLocaleString(),
        tone: "purple",
      },
      {
        id: "bannerCtr",
        label: t("freeBannerCtr"),
        value: `${b.averageCtr}%`,
        tone: "emerald",
      },
    ];
  }, [analytics, t]);

  const topBannerMenus = useMemo(
    () =>
      (
        analytics?.freeBannerMetrics?.topMenusByClicks ?? []
      ).map((m) => {
        const slug = resolvePublicMenuSlug(m.slug, m.id);
        return {
          id: m.id,
          label: getAdminMenuLabel(m, locale),
          count: m.clicks,
          href: slug ? publicMenuLinkUrl(slug) : undefined,
        };
      }),
    [analytics?.freeBannerMetrics?.topMenusByClicks, locale],
  );

  const topMenus = useMemo(
    () =>
      (analytics?.topMenus ?? []).map((m) => {
        const slug = resolvePublicMenuSlug(m.slug, m.id);
        return {
          id: m.id,
          label: getAdminMenuLabel(m, locale),
          count: m.views,
          href: slug ? publicMenuLinkUrl(slug) : undefined,
        };
      }),
    [analytics?.topMenus, locale],
  );

  const topProducts = useMemo(
    () =>
      (analytics?.topProducts ?? []).map((p) => ({
        id: p.id,
        label: getAdminProductLabel(p, locale),
        count: p.views,
      })),
    [analytics?.topProducts, locale],
  );

  const geoItems = useMemo(
    () =>
      (analytics?.geoDistribution ?? []).map((g, i) => ({
        id: g.country || i,
        label: g.country || t("unknownCountry"),
        count: g.count,
      })),
    [analytics?.geoDistribution, t],
  );

  return (
    <div className="space-y-6 pb-8" dir={textDir}>
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${textDir === "rtl" ? "flex-row-reverse" : ""}`}
        >
          <IoArrowBack className="text-lg" />
          <span className="font-medium">{t("back")}</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <div
        className={`flex flex-wrap gap-2 ${textDir === "rtl" ? "flex-row-reverse" : ""}`}
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
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

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : !analytics ? null : (
        <>
          {analytics._isDemoData && (
            <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
          )}

          <AdminSectionCard
            title={t("platformSummary")}
            subtitle={t("platformSummaryHint")}
            icon={
              <IoStatsChartOutline className="text-primary text-xl shrink-0" />
            }
            dir={textDir}
          >
            <AdminMetricsGrid items={summaryMetrics} columns={4} dir={textDir} />
          </AdminSectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminSectionCard
              title={t("viewsOverTime")}
              icon={<FaChartLine className="text-primary text-xl shrink-0" />}
              dir={textDir}
            >
              <AdminBarChart
                points={analytics.viewsOverTime}
                locale={locale}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </AdminSectionCard>

            {(analytics.revenueOverTime?.length ?? 0) > 0 && (
              <AdminSectionCard
                title={t("revenueOverTime")}
                icon={<FaCreditCard className="text-primary text-xl shrink-0" />}
                dir={textDir}
              >
                <AdminMonthGrid
                  points={analytics.revenueOverTime ?? []}
                  dir={textDir}
                  formatCount={(count) => formatMenuPrice(count, "EGP", locale)}
                />
              </AdminSectionCard>
            )}

            <AdminSectionCard
              title={t("topMenus")}
              subtitle={t("topMenusHint")}
              icon={<IoEyeOutline className="text-primary text-xl shrink-0" />}
              dir={textDir}
            >
              <AdminRankedList
                items={topMenus}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </AdminSectionCard>

            <AdminSectionCard
              title={t("topProducts")}
              subtitle={t("topProductsHint")}
              icon={
                <IoReceiptOutline className="text-primary text-xl shrink-0" />
              }
              dir={textDir}
            >
              <AdminRankedList
                items={topProducts}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </AdminSectionCard>
          </div>

          <AdminSectionCard
            title={t("freeBannerPerformance")}
            subtitle={t("freeBannerPerformanceHint")}
            icon={<IoLinkOutline className="text-primary text-xl shrink-0" />}
            dir={textDir}
          >
            <AdminMetricsGrid
              items={freeBannerMetrics}
              columns={3}
              dir={textDir}
            />
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t("topMenusByBannerClicks")}
              </p>
              <AdminRankedList
                items={topBannerMenus}
                dir={textDir}
                emptyMessage={t("noVisitData")}
              />
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title={t("adPerformance")}
            subtitle={t("adPerformanceHint")}
            icon={
              <IoStatsChartOutline className="text-primary text-xl shrink-0" />
            }
            dir={textDir}
            action={
              <LinkTo
                href="/admin/advertisements"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("viewAds")}
              </LinkTo>
            }
          >
            <AdminMetricsGrid items={adMetrics} columns={3} dir={textDir} />
          </AdminSectionCard>

          {geoItems.length > 0 && (
            <AdminSectionCard
              title={t("geoDistribution")}
              icon={<IoGlobeOutline className="text-primary text-xl shrink-0" />}
              dir={textDir}
            >
              <AdminRankedList items={geoItems} dir={textDir} />
            </AdminSectionCard>
          )}

          {(analytics.subscriptions?.expiringSoon?.length ?? 0) > 0 && (
            <AdminSectionCard
              title={t("expiringSoon")}
              subtitle={t("expiringSoonHint")}
              icon={<IoPeopleOutline className="text-primary text-xl shrink-0" />}
              dir={textDir}
              action={
                <LinkTo
                  href="/admin/users"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("viewUsers")}
                </LinkTo>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      <th className={`py-2 ${textDir === "rtl" ? "text-right" : "text-left"}`}>
                        {t("userName")}
                      </th>
                      <th className={`py-2 ${textDir === "rtl" ? "text-right" : "text-left"}`}>
                        {t("userEmail")}
                      </th>
                      <th className={`py-2 ${textDir === "rtl" ? "text-right" : "text-left"}`}>
                        {t("plan")}
                      </th>
                      <th className={`py-2 ${textDir === "rtl" ? "text-right" : "text-left"}`}>
                        {t("endDate")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.subscriptions!.expiringSoon.map((row) => (
                      <tr
                        key={row.userId}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                          <LinkTo
                            href={`/admin/users/${row.userId}`}
                            className="hover:text-primary"
                          >
                            {row.name}
                          </LinkTo>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {row.email}
                        </td>
                        <td className="py-3">{row.planName}</td>
                        <td className="py-3 tabular-nums">
                          {formatAdminDate(row.endDate, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSectionCard>
          )}
        </>
      )}
    </div>
  );
}
