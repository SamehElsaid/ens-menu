"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPut } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import DeleteAdvertisementConfirm from "@/components/Dashboard/DeleteAdvertisementConfirm";
import AdsStatsSection from "@/components/Dashboard/advertisements/AdsStatsSection";
import AdsCardGrid from "@/components/Dashboard/advertisements/AdsCardGrid";
import AdsEmptyState from "@/components/Dashboard/advertisements/AdsEmptyState";
import { canAddMenuAd } from "@/lib/adPlanLimits";
import LinkTo from "@/components/Global/LinkTo";
import { Alert, Badge, Button, PageShell } from "@/components/ui";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import { fetchMenuAnalytics } from "@/lib/fetchMenuAnalytics";
import { Advertisement } from "@/types/Menu";
import { IoAddCircleOutline } from "react-icons/io5";
import { useCurrentPlanCapabilities } from "@/hooks/useCurrentPlanCapabilities";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

export default function AdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("Advertisements.page");
  const tMenus = useTranslations("Menus");
  const params = useParams();
  const menuParam = (params as Record<string, string | string[] | undefined>)
    .menu;
  const menuId =
    typeof menuParam === "string"
      ? menuParam
      : Array.isArray(menuParam)
        ? (menuParam[0] ?? "")
        : "";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAds, setTotalAds] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [adAnalyticsDemo, setAdAnalyticsDemo] = useState(false);
  const { runApiAction } = useApiAction();

  const capabilities = useCurrentPlanCapabilities();
  const maxAdsPerMenu = capabilities.maxAdsPerMenu;

  const requestAds = useCallback(
    () =>
      axiosGet<{
        success?: boolean;
        data?: {
          ads?: Advertisement[];
          pagination?: { totalPages?: number; total?: number };
        };
      }>(`/menus/${menuId}/ads?page=${page}&limit=12`, locale),
    [menuId, locale, page],
  );
  const adsQuery = useApiQuery({
    request: requestAds,
    enabled: Boolean(menuId),
    onSuccess: (wrapper) => {
      const list = wrapper.data?.ads ?? [];
      setAds(list);
      setTotalPages(wrapper.data?.pagination?.totalPages ?? 0);
      setTotalAds(Number(wrapper.data?.pagination?.total ?? list.length));
    },
    onError: () => {
      setAds([]);
      setTotalPages(0);
      setTotalAds(0);
    },
  });
  const loading = adsQuery.loading;
  const refetchAds = adsQuery.refetch;

  useEffect(() => {
    if (!menuId) return;
    void fetchMenuAnalytics(menuId, locale, "30d").then((data) => {
      setAdAnalyticsDemo(Boolean(data._isDemoData));
    });
  }, [menuId, locale]);

  const canAddAd = canAddMenuAd(maxAdsPerMenu, totalAds);

  const adSummaryMetrics = useMemo(() => {
    const totalImpressions = ads.reduce(
      (s, ad) => s + Number(ad.impressionCount ?? 0),
      0,
    );
    const totalClicks = ads.reduce(
      (s, ad) => s + Number(ad.clickCount ?? 0),
      0,
    );
    const ctr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 1000) / 10
        : 0;
    return [
      {
        id: "imp",
        label: t("metrics.impressions"),
        value: totalImpressions.toLocaleString(),
        tone: "sky" as const,
      },
      {
        id: "clk",
        label: t("metrics.clicks"),
        value: totalClicks.toLocaleString(),
        tone: "amber" as const,
      },
      {
        id: "ctr",
        label: t("metrics.ctr"),
        value: `${ctr}%`,
        tone: "emerald" as const,
      },
    ];
  }, [ads, t]);

  const refreshList = useCallback(() => {
    void refetchAds();
  }, [refetchAds]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingAd(null);
  }, []);

  const handleAddClick = useCallback(() => {
    if (!canAddAd) return;
    setEditingAd(null);
    setShowModal(true);
  }, [canAddAd]);

  const handleEdit = useCallback((ad: Advertisement) => {
    setEditingAd(ad);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((ad: Advertisement) => {
    setDeletingAd(ad);
  }, []);

  const handleToggleActive = useCallback(
    async (ad: Advertisement) => {
      if (ad.id == null) return;
      const nextActive = !ad.isActive;
      try {
        setTogglingId(ad.id);
        await runApiAction(
          () =>
            axiosPut(`/ads/${ad.id}`, locale, { isActive: nextActive }),
          {
            successToast: nextActive
              ? t("toggleActivateSuccess")
              : t("togglePauseSuccess"),
            errorToast: ({ error }) => error || t("toggleError"),
            onSuccess: () =>
              setAds((current) =>
                current.map((item) =>
                  item.id === ad.id
                    ? { ...item, isActive: nextActive }
                    : item,
                ),
              ),
          },
        );
      } finally {
        setTogglingId(null);
      }
    },
    [locale, t, runApiAction],
  );

  const getTitle = useCallback(
    (ad: Advertisement) => {
      if (locale === "ar") return ad.titleAr || ad.title || "";
      return ad.title || ad.titleAr || "";
    },
    [locale],
  );

  const getContent = useCallback(
    (ad: Advertisement) => {
      const full =
        locale === "ar"
          ? ad.contentAr || ad.content
          : ad.content || ad.contentAr;

      if (!full) return "—";
      return full.length > 80 ? `${full.slice(0, 77)}...` : full;
    },
    [locale],
  );

  if (!menuId) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <p>{t("noMenuId")}</p>
      </div>
    );
  }

  const textDir = locale === "ar" ? "rtl" : "ltr";
  const showEmpty = !loading && ads.length === 0;

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp
          id="onboarding-advertisements-header"
          className="dashboard-ads-header"
          dir={textDir}
          title={t("title")}
          description={t("description")}
          meta={
            maxAdsPerMenu >= 0 ? (
              <Badge tone={canAddAd ? "neutral" : "warning"} size="md">
                <span lang="en">
                  {totalAds}/{maxAdsPerMenu}
                </span>
              </Badge>
            ) : null
          }
          actions={
            <Button
              id="onboarding-advertisements-actions"
              type="button"
              onClick={handleAddClick}
              disabled={!canAddAd}
              title={!canAddAd ? t("freePlanLimitReached") : undefined}
              startIcon={<IoAddCircleOutline aria-hidden />}
            >
              {t("addButton")}
            </Button>
          }
        />
      }
    >
      {/* The plan ceiling only needs to interrupt once the ceiling is reached;
          below it the count in the header already states the position. */}
      {maxAdsPerMenu >= 0 && !canAddAd && (
        <div dir={textDir}>
          <Alert
            tone="warning"
            action={
              <LinkTo
                href={`/dashboard/${menuId}/subscription`}
                className="text-[13px] font-medium underline underline-offset-2"
              >
                {tMenus("upgradePlan")}
              </LinkTo>
            }
          >
            {t("freePlanLimitBanner", { max: maxAdsPerMenu })}
          </Alert>
        </div>
      )}

      {adAnalyticsDemo && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {showEmpty ? (
        <AdsEmptyState onAdd={canAddAd ? handleAddClick : undefined} />
      ) : (
        <>
          {ads.length > 0 && (
            <AdsStatsSection items={adSummaryMetrics} dir={textDir} />
          )}

          <div className="dashboard-ads-page min-w-0">
            <AdsCardGrid
              ads={ads}
              loading={loading}
              locale={locale}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              getTitle={getTitle}
              getContent={getContent}
              togglingId={togglingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          </div>
        </>
      )}

      {(showModal || editingAd) && menuId && (
        <AddAdvertisementModal
          menuId={menuId}
          ad={editingAd}
          onClose={closeModal}
          onRefresh={refreshList}
        />
      )}

      {deletingAd && (
        <DeleteAdvertisementConfirm
          ad={deletingAd}
          localeTitle={getTitle(deletingAd)}
          onClose={() => setDeletingAd(null)}
          onDeleted={refreshList}
        />
      )}
    </PageShell>
  );
}
