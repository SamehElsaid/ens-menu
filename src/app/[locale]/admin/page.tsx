"use client";

import { useLocale, useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { localizeHref } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { FaUserAlt, FaCreditCard, FaDollarSign } from "react-icons/fa";
import { IoCalendarOutline, IoStatsChart } from "react-icons/io5";
import {
  Card,
  EmptyState,
  PageHeader,
  PageShell,
  SectionHeader,
  Skeleton,
  SkeletonRegion,
  StatCard,
  StatGrid,
} from "@/components/ui";
import AttentionQueue, {
  type AttentionItem,
} from "@/components/Dashboard/AttentionQueue";
import {
  AdminBarChart,
  AdminMonthGrid,
  DemoDataBanner,
} from "@/components/Admin/AdminAnalyticsWidgets";
import { axiosGet } from "@/shared/axiosCall";
import {
  fetchAdminAdminsCount,
  fetchAdminAnalytics,
} from "@/lib/fetchAdminAnalytics";
import type { AdminAnalyticsResponse } from "@/types/AdminAnalytics";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { AdminPermissionKey } from "@/types/AdminPermission";
import { formatMenuPrice } from "@/lib/formatMenuPrice";

interface AdminStatsResponse {
  stats: {
    totalUsers: number;
    activeAccounts: number;
    paidPlans: number;
    trialUsers: number;
    monthlyRevenue: number;
    suspendedAccounts: number;
  };
  charts: {
    usersGrowth: Array<{ month: string; count: number }>;
    revenueGrowth: Array<{ month: string; count: number }>;
    plansDistribution: Array<{ name: string; count: number }>;
  };
}

export default function AdminPage() {
  const locale = useLocale();
  const t = useTranslations("adminDashboard");
  const tCommon = useTranslations("common");
  const tDash = useTranslations("Dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatsResponse["stats"] | null>(null);
  const [charts, setCharts] = useState<AdminStatsResponse["charts"] | null>(
    null,
  );
  const [adminsCount, setAdminsCount] = useState(0);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(
    null,
  );
  const textDir = locale === "ar" ? "rtl" : "ltr";
  const { has: hasAdminPermission } = useAdminPermissions();

  const canSee = (permission: AdminPermissionKey | null) =>
    !permission || hasAdminPermission(permission);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsResult, adminsTotal, analyticsData] = await Promise.all([
          axiosGet<AdminStatsResponse>("/admin/stats", locale),
          fetchAdminAdminsCount(locale),
          fetchAdminAnalytics(locale, "30d"),
        ]);
        if (statsResult.status && statsResult.data) {
          setStats(statsResult.data.stats);
          setCharts(statsResult.data.charts);
        }
        setAdminsCount(adminsTotal);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  /**
   * The four figures that decide whether today is normal.
   *
   * Revenue is one of them. It used to sit in a second row below users, active
   * accounts, paid plans and a count of administrators — so the most important
   * number on a commercial back office ranked below how many admins exist.
   */
  const kpiCards = [
    {
      id: "monthlyRevenue",
      title: t("monthlyRevenue"),
      value: formatMenuPrice(stats?.monthlyRevenue ?? 0, "EGP", locale),
      label: t("revenueLabel"),
      icon: FaDollarSign,
      href: "/admin/payments",
      permission: "payments" as AdminPermissionKey,
    },
    {
      id: "paidPlans",
      title: t("paidPlans"),
      value: String(stats?.paidPlans ?? 0),
      label: t("paidPlansLabel"),
      icon: FaCreditCard,
      href: "/admin/plans",
      permission: "plans" as AdminPermissionKey,
    },
    {
      id: "activeAccounts",
      title: t("activeAccounts"),
      value: String(stats?.activeAccounts ?? 0),
      label: t("activeAccountsLabel"),
      icon: IoCalendarOutline,
      href: "/admin/users?filter=active",
      permission: "users" as AdminPermissionKey,
    },
    {
      id: "totalUsers",
      title: t("totalUsers"),
      value: String(stats?.totalUsers ?? 0),
      label: t("usersLabel"),
      icon: FaUserAlt,
      href: "/admin/users",
      permission: "users" as AdminPermissionKey,
    },
  ].filter((card) => canSee(card.permission));

  /**
   * Accounts in a state somebody has to act on.
   *
   * These were four indistinguishable tiles among twelve. As a queue they read
   * as work: a suspended account is not a statistic, it is a conversation
   * somebody owes a customer.
   */
  const attention: AttentionItem[] = [
    {
      id: "suspended",
      label: t("suspendedAccounts"),
      value: canSee("users") ? (stats?.suspendedAccounts ?? 0) : 0,
      href: "/admin/users?filter=suspended",
      tone: "danger",
      hint: t("suspendedLabel"),
    },
    {
      id: "trial",
      label: t("trialUsers"),
      value: canSee("users") ? (stats?.trialUsers ?? 0) : 0,
      href: "/admin/users?filter=trial",
      tone: "warning",
      hint: t("trialUsersLabel"),
    },
    {
      id: "noMenu",
      label: t("usersWithoutMenu"),
      value: canSee("users") ? (analytics?.summary?.usersWithoutMenu ?? 0) : 0,
      href: "/admin/users?filter=no-menu",
      tone: "warning",
    },
    {
      id: "inactive",
      label: t("inactiveUsers30d"),
      value: canSee("users") ? (analytics?.summary?.inactiveUsers30d ?? 0) : 0,
      href: "/admin/users?filter=inactive",
      tone: "info",
    },
  ];

  /* Which platform cards exist depends only on the reader's grants, so the row
     is built before the numbers arrive and each card carries `loading` instead.
     Deriving the row from `analytics` meant it did not exist at all on first
     paint, then appeared and shoved the charts card down the page. */
  const platformCards = (
    [
      {
        id: "menuViews",
        title: t("totalMenuViews"),
        value: analytics?.summary?.totalMenuViews,
        href: "/admin/analytics",
        permission: "analytics" as AdminPermissionKey,
      },
      {
        id: "conversion",
        title: t("conversionRate"),
        value: analytics?.summary
          ? `${analytics.summary.conversionRate}%`
          : undefined,
        href: "/admin/analytics",
        permission: "analytics" as AdminPermissionKey,
      },
      {
        id: "freeBannerClicks",
        title: t("freeBannerClicks"),
        value: analytics?.summary
          ? (analytics.freeBannerMetrics?.totalClicks ?? 0)
          : undefined,
        href: "/admin/analytics",
        permission: "analytics" as AdminPermissionKey,
      },
      {
        id: "admins",
        title: t("adminsCount"),
        value: adminsCount,
        href: "/admin/administrators",
        permission: "administrators" as AdminPermissionKey,
      },
    ] as const
  ).filter((card) => canSee(card.permission));

  const revenuePoints = analytics?.revenueOverTime?.length
    ? analytics.revenueOverTime
    : (charts?.revenueGrowth ?? []);

  return (
    <PageShell
      kind="wide"
      header={
        <>
          {analytics?._isDemoData && (
            <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
          )}
          <PageHeader title={t("title")} description={t("subtitle")} />
        </>
      }
    >
      {/* The tab strip that used to sit here listed eight destinations already
          present in the rail, and went stale the moment a permission changed. */}
      <StatGrid columns={4}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.id}
              label={card.title}
              value={card.value}
              hint={card.label}
              icon={<Icon />}
              loading={isLoading}
              href={localizeHref(card.href, locale)}
            />
          );
        })}
      </StatGrid>

      {/* Growth takes two thirds and the queue one. The chart is the thing you
          study; the queue is the thing you act on, and it stays beside the chart
          rather than below it so neither has to be scrolled to. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start">
        <Card padded="lg" className="space-y-6">
        <SectionHeader
          title={t("detailedStatistics")}
          description={t("viewDetailedAnalytics")}
          actions={
            <LinkTo
              href="/admin/analytics"
              className="text-[13px] font-medium text-brand hover:underline"
            >
              {t("openFullAnalytics")}
            </LinkTo>
          }
        />

        {/* While the request is in flight this said "graphs coming soon", which
            is a claim about the product rather than about the load — and it was
            replaced by four charts a moment later. A skeleton says the same
            thing honestly and reserves roughly the height the charts take. */}
        {isLoading ? (
          <SkeletonRegion label={tCommon("loading")} className="space-y-8">
            {[0, 1].map((row) => (
              <div key={row}>
                <Skeleton className="mb-4 h-4 w-40" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ))}
          </SkeletonRegion>
        ) : charts &&
          (charts.usersGrowth.length > 0 ||
            charts.plansDistribution.length > 0 ||
            revenuePoints.length > 0 ||
            (analytics?.viewsOverTime?.length ?? 0) > 0) ? (
          <div className="space-y-8">
            {charts.usersGrowth.length > 0 && (
              <div>
                <h3 className="mb-4 text-[13px] font-semibold text-fg">
                  {t("usersGrowth")}
                </h3>
                <AdminMonthGrid points={charts.usersGrowth} dir={textDir} />
              </div>
            )}

            {revenuePoints.length > 0 && (
              <div>
                <h3 className="mb-4 text-[13px] font-semibold text-fg">
                  {t("revenueGrowth")}
                </h3>
                <AdminMonthGrid
                  points={revenuePoints}
                  dir={textDir}
                  formatCount={(count) => formatMenuPrice(count, "EGP", locale)}
                />
              </div>
            )}

            {(analytics?.viewsOverTime?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-4 text-[13px] font-semibold text-fg">
                  {t("menuViewsChart")}
                </h3>
                <AdminBarChart
                  points={analytics!.viewsOverTime}
                  locale={locale}
                  dir={textDir}
                  emptyMessage={t("noPlatformData")}
                />
              </div>
            )}

            {charts.plansDistribution.length > 0 && (
              <div>
                <h3 className="mb-4 text-[13px] font-semibold text-fg">
                  {t("plansDistribution")}
                </h3>
                <StatGrid columns={3}>
                  {charts.plansDistribution.map((plan, index) => (
                    <StatCard
                      key={index}
                      label={plan.name}
                      value={plan.count}
                    />
                  ))}
                </StatGrid>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<IoStatsChart />}
            title={t("graphsComingSoon")}
            action={
              <LinkTo
                href="/admin/analytics"
                className="text-[13px] font-medium text-brand hover:underline"
              >
                {t("openFullAnalytics")}
              </LinkTo>
            }
          />
        )}
        </Card>

        <AttentionQueue
          title={tDash("attentionTitle")}
          description={tDash("attentionAdminDescription")}
          items={attention}
          loading={isLoading}
          allClearTitle={tDash("attentionAllClear")}
          allClearHint={tDash("attentionAllClearAdminHint")}
        />
      </div>

      {/* Secondary readings. Quieter than the KPI band on purpose: they are
          context for the numbers above, not decisions of their own. */}
      {platformCards.length > 0 && (
        <StatGrid columns={4}>
          {platformCards.map((card) => (
            <StatCard
              key={card.id}
              label={card.title}
              loading={isLoading}
              value={
                typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : (card.value ?? "—")
              }
              href={localizeHref(card.href, locale)}
            />
          ))}
        </StatGrid>
      )}
    </PageShell>
  );
}
