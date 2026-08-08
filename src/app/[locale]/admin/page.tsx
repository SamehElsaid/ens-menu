"use client";

import { useLocale, useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { usePathname } from "@/i18n/navigation";
import { localizeHref } from "@/i18n/routing";
import { useState, useEffect } from "react";
import {
  FaUserAlt,
  FaUsers,
  FaChartLine,
  FaCreditCard,
  FaBan,
  FaDollarSign,
} from "react-icons/fa";
import {
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoMegaphoneOutline,
  IoPersonOutline,
  IoStatsChart,
  IoPricetagOutline,
  IoTicketOutline,
} from "react-icons/io5";
import {
  Card,
  EmptyState,
  PageHeader,
  SectionHeader,
  StatCard,
  StatGrid,
  Tabs,
} from "@/components/ui";
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
  const pathname = usePathname();
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

  const navigationTabs = [
    {
      id: "users",
      label: t("users"),
      icon: FaUserAlt,
      href: "/admin/users",
      permission: "users" as AdminPermissionKey,
    },
    {
      id: "plans",
      label: t("plans"),
      icon: IoDocumentTextOutline,
      href: "/admin/plans",
      permission: "plans" as AdminPermissionKey,
    },
    {
      id: "payments",
      label: t("payments"),
      icon: FaCreditCard,
      href: "/admin/payments",
      permission: "payments" as AdminPermissionKey,
    },
    {
      id: "advertisements",
      label: t("advertisements"),
      icon: IoMegaphoneOutline,
      href: "/admin/advertisements",
      permission: "advertisements" as AdminPermissionKey,
    },
    {
      id: "admins",
      label: t("admins"),
      icon: IoPersonOutline,
      href: "/admin/administrators",
      permission: "administrators" as AdminPermissionKey,
    },
    {
      id: "promo",
      label: t("promo"),
      icon: IoPricetagOutline,
      href: "/admin/promo",
      permission: "promo" as AdminPermissionKey,
    },
    {
      id: "vouchers",
      label: t("vouchers"),
      icon: IoTicketOutline,
      href: "/admin/vouchers",
      permission: "promo" as AdminPermissionKey,
    },
    {
      id: "analytics",
      label: t("analytics"),
      icon: IoStatsChart,
      href: "/admin/analytics",
      permission: "analytics" as AdminPermissionKey,
    },
  ].filter((tab) => canSee(tab.permission));

  const kpiCards = [
    {
      id: "totalUsers",
      title: t("totalUsers"),
      value: stats?.totalUsers ?? 0,
      label: t("usersLabel"),
      icon: FaUserAlt,
      href: "/admin/users",
      permission: "users" as AdminPermissionKey,
    },
    {
      id: "activeAccounts",
      title: t("activeAccounts"),
      value: stats?.activeAccounts ?? 0,
      label: t("activeAccountsLabel"),
      icon: IoCalendarOutline,
      href: "/admin/users?filter=active",
      permission: "users" as AdminPermissionKey,
    },
    {
      id: "paidPlans",
      title: t("paidPlans"),
      value: stats?.paidPlans ?? 0,
      label: t("paidPlansLabel"),
      icon: FaCreditCard,
      href: "/admin/plans",
      permission: "plans" as AdminPermissionKey,
    },
    {
      id: "admins",
      title: t("adminsCount"),
      value: adminsCount,
      label: t("adminsLabel"),
      icon: FaUsers,
      href: "/admin/administrators",
      permission: "administrators" as AdminPermissionKey,
    },
  ].filter((card) => canSee(card.permission));

  const secondRowCards = [
    {
      id: "trialUsers",
      title: t("trialUsers"),
      value: stats?.trialUsers ?? 0,
      label: t("trialUsersLabel"),
      icon: FaChartLine,
      href: "/admin/users?filter=trial",
      permission: "users" as AdminPermissionKey,
    },
    {
      id: "monthlyRevenue",
      title: t("monthlyRevenue"),
      value: stats?.monthlyRevenue ?? 0,
      label: t("revenueLabel"),
      icon: FaDollarSign,
      href: "/admin/plans",
      permission: "plans" as AdminPermissionKey,
    },
    {
      id: "suspendedAccounts",
      title: t("suspendedAccounts"),
      value: stats?.suspendedAccounts ?? 0,
      label: t("suspendedLabel"),
      icon: FaBan,
      href: "/admin/users?filter=suspended",
      permission: "users" as AdminPermissionKey,
    },
  ].filter((card) => canSee(card.permission));

  const isActiveTab = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const activeTabId =
    navigationTabs.find((tab) => isActiveTab(tab.href))?.id ?? "";

  const formatValue = (value: number | string, type?: string) => {
    if (typeof value === "string") return value;
    if (type === "revenue") {
      return formatMenuPrice(value, "EGP", locale);
    }
    return value.toString();
  };

  const platformCards = analytics?.summary
    ? [
        {
          id: "menuViews",
          title: t("totalMenuViews"),
          value: analytics.summary.totalMenuViews,
          href: "/admin/analytics",
          permission: "analytics" as AdminPermissionKey,
        },
        {
          id: "conversion",
          title: t("conversionRate"),
          value: `${analytics.summary.conversionRate}%`,
          href: "/admin/analytics",
          permission: "analytics" as AdminPermissionKey,
        },
        {
          id: "noMenu",
          title: t("usersWithoutMenu"),
          value: analytics.summary.usersWithoutMenu,
          href: "/admin/users?filter=no-menu",
          permission: "users" as AdminPermissionKey,
        },
        {
          id: "inactive30",
          title: t("inactiveUsers30d"),
          value: analytics.summary.inactiveUsers30d,
          href: "/admin/users?filter=inactive",
          permission: "users" as AdminPermissionKey,
        },
        {
          id: "freeBannerClicks",
          title: t("freeBannerClicks"),
          value: analytics.freeBannerMetrics?.totalClicks ?? 0,
          href: "/admin/analytics",
          permission: "analytics" as AdminPermissionKey,
        },
      ].filter((card) => canSee(card.permission))
    : [];

  const revenuePoints = analytics?.revenueOverTime?.length
    ? analytics.revenueOverTime
    : (charts?.revenueGrowth ?? []);

  return (
    <div className="space-y-5 py-5" dir={textDir}>
      {analytics?._isDemoData && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      <PageHeader title={t("title")} description={t("subtitle")} />

      <Tabs
        items={navigationTabs.map((tab) => {
          const Icon = tab.icon;
          return {
            id: tab.id,
            label: tab.label,
            icon: <Icon />,
            href: localizeHref(tab.href, locale),
          };
        })}
        activeId={activeTabId}
        label={t("title")}
      />

      <StatGrid columns={4}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.id}
              label={card.title}
              value={formatValue(card.value)}
              hint={card.label}
              icon={<Icon />}
              loading={isLoading}
              href={localizeHref(card.href, locale)}
            />
          );
        })}
      </StatGrid>

      <StatGrid columns={3}>
        {secondRowCards.map((card) => {
          const Icon = card.icon;
          const displayValue =
            card.id === "monthlyRevenue"
              ? formatValue(card.value, "revenue")
              : formatValue(card.value);
          return (
            <StatCard
              key={card.id}
              label={card.title}
              value={displayValue}
              hint={card.label}
              icon={<Icon />}
              loading={isLoading}
              href={localizeHref(card.href, locale)}
            />
          );
        })}
      </StatGrid>

      {platformCards.length > 0 && (
        <StatGrid columns={4}>
          {platformCards.map((card) => (
            <StatCard
              key={card.id}
              label={card.title}
              value={
                typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value
              }
              href={localizeHref(card.href, locale)}
            />
          ))}
        </StatGrid>
      )}

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

        {charts &&
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
    </div>
  );
}
