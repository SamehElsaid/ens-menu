"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import MenuProAnalytics from "@/components/Dashboard/MenuProAnalytics";
import { Badge, PageShell } from "@/components/ui";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenuAnalyticsInsights } from "@/hooks/useMenuAnalyticsInsights";
import type { MenuAnalyticsPeriod } from "@/types/MenuAnalytics";

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

  const displayTotalViews = analytics?.summary.totalViews ?? menu?.views ?? 0;
  const menuName = (locale === "ar" ? menu?.nameAr : menu?.nameEn)?.trim() ?? "";

  const activeItemsRate = useMemo(() => {
    if (!menu || (menu.itemsCount ?? 0) <= 0) return 0;
    return Math.round(((menu.activeItemsCount ?? 0) / menu.itemsCount!) * 100);
  }, [menu]);

  return (
    <PageShell
      kind="wide"
      /* Breadcrumbs rather than a back link: this page is three levels deep
         (account → menu → analytics) and a single arrow cannot say where the
         reader is, only that they can leave. */
      header={
        <PageTitleWithHelp
          dir={textDir}
          title={t("title")}
          description={isFreePlan ? t("freeSubtitle") : t("subtitle")}
          breadcrumbs={[
            {
              label: menuName || t("backToOverview"),
              href: `/dashboard/${menuSlugOrId}`,
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("title")}
          meta={
            isFreePlan ? (
              <Badge tone="neutral" dot>
                {t("upgradeToPro")}
              </Badge>
            ) : null
          }
        />
      }
    >
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
    </PageShell>
  );
}
