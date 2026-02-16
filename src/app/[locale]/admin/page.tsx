"use client";

import { useLocale, useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { usePathname } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import {
  FaUserAlt,
  FaUsers,
  FaChartLine,
  FaCreditCard,
  FaBan,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoMegaphoneOutline,
  IoPersonOutline,
  IoStatsChart,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet } from "@/shared/axiosCall";

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

function KPICardSkeleton() {
  return (
    <CardDashBoard className="animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-7 w-14 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </CardDashBoard>
  );
}

export default function AdminPage() {
  const locale = useLocale();
  const t = useTranslations("adminDashboard");
  const isRTL = locale === "ar";
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatsResponse["stats"] | null>(null);
  const [charts, setCharts] = useState<AdminStatsResponse["charts"] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await axiosGet<AdminStatsResponse>("/admin/stats", locale);
        if (result.status && result.data) {
          setStats(result.data.stats);
          setCharts(result.data.charts);
        }
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
      color: "blue",
      href: "/admin/users",
    },
    {
      id: "plans",
      label: t("plans"),
      icon: IoDocumentTextOutline,
      color: "purple",
      href: "/admin/plans",
    },
    {
      id: "advertisements",
      label: t("advertisements"),
      icon: IoMegaphoneOutline,
      color: "green",
      href: "/admin/advertisements",
    },
    {
      id: "admins",
      label: t("admins"),
      icon: IoPersonOutline,
      color: "slate",
      href: "/admin/admins",
    },
  ];

  const kpiCards = [
    {
      id: "totalUsers",
      title: t("totalUsers"),
      value: stats?.totalUsers ?? 0,
      change: null,
      changeType: null,
      label: t("usersLabel"),
      icon: FaUserAlt,
      color: "blue",
      href: "/admin/users",
    },
    {
      id: "activeAccounts",
      title: t("activeAccounts"),
      value: stats?.activeAccounts ?? 0,
      change: null,
      changeType: null,
      label: t("activeAccountsLabel"),
      icon: IoCalendarOutline,
      color: "green",
      href: "/admin/users?filter=active",
    },
    {
      id: "paidPlans",
      title: t("paidPlans"),
      value: stats?.paidPlans ?? 0,
      change: null,
      changeType: null,
      label: t("paidPlansLabel"),
      icon: FaCreditCard,
      color: "purple",
      href: "/admin/plans",
    },
    {
      id: "admins",
      title: t("adminsCount"),
      value: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.1) : 0,
      change: null,
      changeType: null,
      label: t("adminsLabel"),
      icon: FaUsers,
      color: "slate",
      href: "/admin/admins",
    },
  ];

  const secondRowCards = [
    {
      id: "trialUsers",
      title: t("trialUsers"),
      value: stats?.trialUsers ?? 0,
      change: null,
      changeType: null,
      label: t("trialUsersLabel"),
      icon: FaChartLine,
      color: "amber",
      href: "/admin/users?filter=trial",
    },
    {
      id: "monthlyRevenue",
      title: t("monthlyRevenue"),
      value: stats?.monthlyRevenue ?? 0,
      change: null,
      changeType: null,
      label: t("revenueLabel"),
      icon: FaDollarSign,
      color: "emerald",
      href: "/admin/plans",
    },
    {
      id: "suspendedAccounts",
      title: t("suspendedAccounts"),
      value: stats?.suspendedAccounts ?? 0,
      change: null,
      changeType: null,
      label: t("suspendedLabel"),
      icon: FaBan,
      color: "red",
      href: "/admin/users?filter=suspended",
    },
  ];

  const isActiveTab = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getColorClasses = (color: string, type: "bg" | "text" | "border" | "button" = "bg") => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/20",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-500/20",
        button: "bg-purple-600 hover:bg-purple-700",
      },
      green: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
        button: "bg-emerald-600 hover:bg-emerald-700",
      },
      emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/20",
        button: "bg-emerald-600 hover:bg-emerald-700",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/20",
        button: "bg-amber-600 hover:bg-amber-700",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-500/20",
        button: "bg-red-600 hover:bg-red-700",
      },
      slate: {
        bg: "bg-slate-50 dark:bg-slate-500/10",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-700",
        button: "bg-slate-600 hover:bg-slate-700",
      },
    };
    return colors[color]?.[type] || colors.slate[type];
  };

  const formatValue = (value: number | string, type?: string) => {
    if (typeof value === "string") return value;
    if (type === "revenue") {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-5 py-5">
      {/* Simple Elegant Header */}
      <CardDashBoard className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Elegant Navigation */}
        <nav
          className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          aria-label="Admin navigation"
        >
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActiveTab(tab.href);
            const buttonClass = getColorClasses(tab.color, "button");
            return (
              <LinkTo
                key={tab.id}
                href={tab.href}
                className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${active
                    ? `${buttonClass} text-white`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
              `}
              >
                <Icon className="text-base" />
                <span>{tab.label}</span>
              </LinkTo>
            );
          })}
        </nav>
      </CardDashBoard>

      {/* Elegant KPI Cards - First Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          kpiCards.map((card) => {
            const Icon = card.icon;
            const bgClass = getColorClasses(card.color, "bg");
            const textClass = getColorClasses(card.color, "text");
            const borderClass = getColorClasses(card.color, "border");
            return (
              <LinkTo key={card.id} href={card.href} className="block">
                <CardDashBoard hover borderColor={borderClass} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`${bgClass} ${textClass} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {card.title}
                      </p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatValue(card.value)}
                        </p>
                        {card.change && (
                          <span
                            className={`
                            text-xs font-medium px-1.5 py-0.5 rounded
                            ${card.changeType === "increase"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                              }
                          `}
                          >
                            {card.changeType === "increase" ? (
                              <FaArrowUp className="inline text-[9px] mr-0.5" />
                            ) : (
                              <FaArrowDown className="inline text-[9px] mr-0.5" />
                            )}
                            {card.change}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {card.label}
                      </p>
                    </div>
                  </div>
                </CardDashBoard>
              </LinkTo>
            );
          })
        )}
      </section>

      {/* Elegant KPI Cards - Second Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          secondRowCards.map((card) => {
            const Icon = card.icon;
            const bgClass = getColorClasses(card.color, "bg");
            const textClass = getColorClasses(card.color, "text");
            const borderClass = getColorClasses(card.color, "border");
            const displayValue = card.id === "monthlyRevenue"
              ? formatValue(card.value, "revenue")
              : formatValue(card.value);
            return (
              <LinkTo key={card.id} href={card.href} className="block">
                <CardDashBoard hover borderColor={borderClass} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`${bgClass} ${textClass} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {card.title}
                      </p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {displayValue}
                        </p>
                        {card.change && (
                          <span
                            className={`
                            text-xs font-medium px-1.5 py-0.5 rounded
                            ${card.changeType === "increase"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                              }
                          `}
                          >
                            {card.changeType === "increase" ? (
                              <FaArrowUp className="inline text-[9px] mr-0.5" />
                            ) : (
                              <FaArrowDown className="inline text-[9px] mr-0.5" />
                            )}
                            {card.change}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {card.label}
                      </p>
                    </div>
                  </div>
                </CardDashBoard>
              </LinkTo>
            );
          })
        )}
      </section>

      {/* Statistics Section with Charts */}
      <CardDashBoard className="p-8">
        <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <IoStatsChart className="text-primary text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("detailedStatistics")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRTL ? "عرض الإحصائيات التفصيلية" : "View detailed analytics"}
            </p>
          </div>
        </div>

        {charts && (charts.usersGrowth.length > 0 || charts.plansDistribution.length > 0) ? (
          <div className="space-y-6">
            {/* Users Growth Chart */}
            {charts.usersGrowth.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  {isRTL ? "نمو المستخدمين" : "Users Growth"}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {charts.usersGrowth.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {item.month}
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {item.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans Distribution */}
            {charts.plansDistribution.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  {isRTL ? "توزيع الخطط" : "Plans Distribution"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {charts.plansDistribution.map((plan, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {plan.name}
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {plan.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
              <IoStatsChart className="text-slate-400 dark:text-slate-500 text-xl" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
              {t("graphsComingSoon")}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {isRTL
                ? "سيتم إضافة الرسوم البيانية قريباً"
                : "Charts will be added soon"}
            </p>
          </div>
        )}
      </CardDashBoard>
    </div>
  );
}
