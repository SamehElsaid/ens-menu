"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  EmptyState,
  PageHeader,
  PageShell,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  SkeletonRegion,
  Table,
  TableShell,
  Td,
  Th,
  Toolbar,
  Tr,
} from "@/components/ui";
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
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import type {
  AdminAnalyticsPeriod,
  AdminAnalyticsResponse,
} from "@/types/AdminAnalytics";

const PERIODS: AdminAnalyticsPeriod[] = ["7d", "30d", "90d"];

export default function AdminAnalyticsPage() {
  const locale = useLocale();
  const t = useTranslations("adminAnalytics");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [period, setPeriod] = useState<AdminAnalyticsPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(
    null,
  );

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    const data = await fetchAdminAnalytics(locale, period);
    setAnalytics(data);
    setLoading(false);
  }, [locale, period]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const num = useCallback((value: number) => value.toLocaleString("en-US"), []);

  /**
   * Twelve figures, read as three rows rather than one wall.
   *
   * The order is the order the platform is read in: what the menus are doing,
   * then who the accounts are, then what needs chasing. In a four-column ruled
   * rail each of those groups lands on its own row, so the panel has a reading
   * order without needing three separate headings.
   */
  const summaryMetrics = useMemo<MetricItem[]>(() => {
    const s = analytics?.summary;
    if (!s) return [];
    return [
      { id: "views", label: t("totalMenuViews"), value: num(s.totalMenuViews) },
      { id: "today", label: t("viewsToday"), value: num(s.menuViewsToday) },
      {
        id: "week",
        label: t("viewsThisWeek"),
        value: num(s.menuViewsThisWeek),
      },
      { id: "orders", label: t("totalOrders"), value: num(s.totalOrders) },

      { id: "activeMenus", label: t("activeMenus"), value: num(s.activeMenus) },
      {
        id: "inactiveMenus",
        label: t("inactiveMenus"),
        value: num(s.inactiveMenus),
      },
      { id: "free", label: t("freeUsers"), value: num(s.freeUsers) },
      { id: "pro", label: t("proUsers"), value: num(s.proUsers) },

      {
        id: "conversion",
        label: t("conversionRate"),
        value: `${s.conversionRate}%`,
      },
      {
        id: "noMenu",
        label: t("usersWithoutMenu"),
        value: num(s.usersWithoutMenu),
      },
      {
        id: "expiring",
        label: t("expiringSubscriptions"),
        value: num(s.expiringSubscriptions),
      },
      {
        id: "inactive30",
        label: t("inactiveUsers30d"),
        value: num(s.inactiveUsers30d),
      },
    ];
  }, [analytics?.summary, num, t]);

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
        value: num(a.totalImpressions),
      },
      { id: "clicks", label: t("adClicks"), value: num(a.totalClicks) },
      { id: "ctr", label: t("averageCtr"), value: `${a.averageCtr}%` },
    ];
  }, [analytics, num, t]);

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
        value: num(b.totalImpressions),
      },
      {
        id: "bannerClicks",
        label: t("freeBannerClicks"),
        value: num(b.totalClicks),
      },
      {
        id: "bannerCtr",
        label: t("freeBannerCtr"),
        value: `${b.averageCtr}%`,
      },
    ];
  }, [analytics, num, t]);

  const topBannerMenus = useMemo(
    () =>
      (analytics?.freeBannerMetrics?.topMenusByClicks ?? []).map((m) => {
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

  const expiringSoon = analytics?.subscriptions?.expiringSoon ?? [];

  /**
   * The report as four acts.
   *
   * Every panel used to be an equal card in one long run, so the page had no
   * reading order and the twelve platform figures sat inside a card inside the
   * page. Now the figures lead as one edge-sharing instrument rail, and the
   * rest is announced by ruled section headers — traffic, demand, advertising,
   * renewals — so an operator can jump to the act they came for.
   */
  return (
    <PageShell
      kind="wide"
      header={
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
        />
      }
      toolbar={
        /* The period governs every figure below it, so it stays pinned under the
           app header — on a report this long the reader is usually deep in the
           page when they decide 30 days was the wrong window. */
        <Toolbar
          filters={
            <SegmentedControl
              label={t("title")}
              value={period}
              onChange={setPeriod}
              options={PERIODS.map((p) => ({
                value: p,
                label: t(`period.${p}`),
              }))}
            />
          }
        />
      }
    >
      <div className="flex flex-col gap-7">
        {loading ? (
          <SkeletonRegion label={tCommon("loading")}>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-surface p-3">
                  <Skeleton className="h-2.5 w-20" rounded="sm" />
                  <Skeleton className="mt-2.5 h-7 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 w-full" rounded="lg" />
              ))}
            </div>
          </SkeletonRegion>
        ) : !analytics ? (
          <EmptyState
            icon={<IoStatsChartOutline />}
            title={t("noDataTitle")}
            description={t("noDataHint")}
          />
        ) : (
          <>
            {analytics._isDemoData && (
              <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
            )}

            <section className="flex flex-col gap-3">
              <SectionHeader
                ruled
                eyebrow={t("eyebrow")}
                title={t("platformSummary")}
                description={t("platformSummaryHint")}
              />
              <AdminMetricsGrid
                items={summaryMetrics}
                columns={4}
                dir={textDir}
                ruled
              />
            </section>

            <section>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <AdminSectionCard
                  title={t("viewsOverTime")}
                  subtitle={t(`period.${period}`)}
                  icon={<FaChartLine className="size-4 shrink-0" />}
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
                    icon={<FaCreditCard className="size-4 shrink-0" />}
                    dir={textDir}
                  >
                    <AdminMonthGrid
                      points={analytics.revenueOverTime ?? []}
                      dir={textDir}
                      formatCount={(count) =>
                        formatMenuPrice(count, "EGP", locale)
                      }
                    />
                  </AdminSectionCard>
                )}
              </div>
            </section>

            <section>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AdminSectionCard
                  title={t("topMenus")}
                  subtitle={t("topMenusHint")}
                  icon={<IoEyeOutline className="size-4 shrink-0" />}
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
                  icon={<IoReceiptOutline className="size-4 shrink-0" />}
                  dir={textDir}
                >
                  <AdminRankedList
                    items={topProducts}
                    dir={textDir}
                    emptyMessage={t("noVisitData")}
                  />
                </AdminSectionCard>

                <AdminSectionCard
                  title={t("geoDistribution")}
                  icon={<IoGlobeOutline className="size-4 shrink-0" />}
                  dir={textDir}
                >
                  <AdminRankedList
                    items={geoItems}
                    dir={textDir}
                    emptyMessage={t("noVisitData")}
                  />
                </AdminSectionCard>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <SectionHeader
                ruled
                title={t("adPerformance")}
                description={t("adPerformanceHint")}
                actions={
                  <LinkTo
                    href="/admin/advertisements"
                    className="text-[13px] font-medium text-accent hover:underline"
                  >
                    {t("viewAds")}
                  </LinkTo>
                }
              />
              <AdminMetricsGrid
                items={adMetrics}
                columns={3}
                dir={textDir}
                ruled
              />

              {/* The free banner is a second, smaller ad surface, so it sits under
                the paid one as its own rail rather than as a separate card. */}
              <p className="ui-label mt-2">{t("freeBannerPerformance")}</p>
              <AdminMetricsGrid
                items={freeBannerMetrics}
                columns={3}
                dir={textDir}
                ruled
              />
              <AdminSectionCard
                title={t("topMenusByBannerClicks")}
                subtitle={t("freeBannerPerformanceHint")}
                icon={<IoLinkOutline className="size-4 shrink-0" />}
                dir={textDir}
              >
                <AdminRankedList
                  items={topBannerMenus}
                  dir={textDir}
                  emptyMessage={t("noVisitData")}
                />
              </AdminSectionCard>
            </section>

            {expiringSoon.length > 0 && (
              <section className="flex flex-col gap-3">
                <SectionHeader
                  ruled
                  title={
                    <span className="inline-flex items-center gap-2">
                      <IoPeopleOutline
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                      {t("expiringSoon")}
                    </span>
                  }
                  description={t("expiringSoonHint")}
                  actions={
                    <LinkTo
                      href="/admin/users"
                      className="text-[13px] font-medium text-accent hover:underline"
                    >
                      {t("viewUsers")}
                    </LinkTo>
                  }
                />
                <TableShell>
                  <Table caption={t("expiringSoon")}>
                    <thead>
                      <tr>
                        <Th>{t("userName")}</Th>
                        <Th>{t("userEmail")}</Th>
                        <Th>{t("plan")}</Th>
                        <Th align="end" numeric>
                          {t("endDate")}
                        </Th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringSoon.map((row) => (
                        <Tr key={row.userId}>
                          <Td className="font-medium">
                            <LinkTo
                              href={`/admin/users/${row.userId}`}
                              className="hover:underline"
                            >
                              {row.name}
                            </LinkTo>
                          </Td>
                          <Td className="font-mono text-[12px] text-fg-muted">
                            <span dir="ltr">{row.email}</span>
                          </Td>
                          <Td>{row.planName}</Td>
                          <Td align="end" numeric className="ui-figure">
                            <span lang="en">
                              {formatAdminDate(row.endDate, locale)}
                            </span>
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </TableShell>
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
