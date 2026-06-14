"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import MenuProAnalytics from "@/components/Dashboard/MenuProAnalytics";
import LinkTo from "@/components/Global/LinkTo";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenuAnalyticsInsights } from "@/hooks/useMenuAnalyticsInsights";
import type { MenuAnalyticsPeriod } from "@/types/MenuAnalytics";
import { IoArrowBack } from "react-icons/io5";

export default function MenuAnalyticsPage() {
  const locale = useLocale();
  const t = useTranslations("menuAnalyticsPage");
  const params = useParams();
  const menuSlugOrId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const { menu } = useAppSelector((state) => state.menuData);
  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const [period, setPeriod] = useState<MenuAnalyticsPeriod>("7d");
  const effectivePeriod = isFreePlan ? "7d" : period;
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const { analytics, loading, totalOrders, topOrderedDisplay } =
    useMenuAnalyticsInsights({
      menuSlugOrId,
      locale,
      isFreePlan,
      menuViews: menu?.views ?? 0,
      menuCurrency: menu?.currency,
      period: effectivePeriod,
      enabled: Boolean(menuSlugOrId),
    });

  const displayTotalViews =
    analytics?.summary.totalViews ?? menu?.views ?? 0;

  const activeItemsRate = useMemo(() => {
    if (!menu || (menu.itemsCount ?? 0) <= 0) return 0;
    return Math.round(((menu.activeItemsCount ?? 0) / menu.itemsCount!) * 100);
  }, [menu]);

  return (
    <div className="space-y-6 pb-10 animate-fadeIn" dir={textDir}>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-3 transition-colors"
          >
            <IoArrowBack
              className={`text-base ${locale === "ar" ? "rotate-180" : ""}`}
            />
            {t("backToOverview")}
          </LinkTo>
          <PageTitleWithHelp>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isFreePlan ? t("freeSubtitle") : t("subtitle")}
          </p>
        </div>
      </header>

      <MenuProAnalytics
        variant="full"
        analytics={analytics}
        loading={loading}
        isFreePlan={isFreePlan}
        locale={locale}
        menuSlugOrId={menuSlugOrId}
        period={effectivePeriod}
        onPeriodChange={isFreePlan ? undefined : setPeriod}
        displayTotalViews={displayTotalViews}
        activeItemsRate={activeItemsRate}
        tablesCount={menu?.tablesCount ?? 0}
        totalOrders={totalOrders}
        topOrderedDisplay={topOrderedDisplay}
      />
    </div>
  );
}
