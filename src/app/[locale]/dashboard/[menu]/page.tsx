"use client";

import { useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  IoCheckmarkCircleOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoOpenOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { BsQrCode } from "react-icons/bs";
import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { shouldShowAiImportOnboarding } from "@/lib/aiImportOnboarding";
import {
  StyledQrCode,
  type StyledQrCodeHandle,
} from "@/components/Global/StyledQrCode";
import { useAuthorization } from "@/hooks/useAuthorization";
import { isFreePlanUser } from "@/lib/subscription";
import {
  publicMenuLinkUrl,
  publicMenuQrUrl,
  resolvePublicMenuSlug,
} from "@/lib/publicMenuUrl";
import { resolveMenuItemImageSrc } from "@/components/menuItemImage";
import MenuImportEntryButton from "@/components/MenuImport/MenuImportEntryButton";
import RecentActivityList from "@/components/Dashboard/activity/RecentActivityList";
import { useMenuActivityLog } from "@/hooks/useMenuActivityLog";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  PageHeader,
  Skeleton,
  SkeletonRegion,
  StatCard,
  StatGrid,
} from "@/components/ui";

export default function DashboardMenuPage() {
  const { menu, loading: menuLoading } = useAppSelector(
    (state) => state.menuData,
  );

  const locale = useLocale();
  const t = useTranslations("menuOverview");
  const params = useParams();
  const router = useRouter();
  const menuSlugOrId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const { can } = useAuthorization();
  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);

  const { entries: latestActivity, loading: activityLoading } =
    useMenuActivityLog(menuSlugOrId, {
      limit: 6,
      includeProSources: Boolean(userData) && !isFreePlan,
    });

  const publicSlug = resolvePublicMenuSlug(menu?.slug, menu?.id);
  const menuLinkUrl = publicSlug ? publicMenuLinkUrl(publicSlug) : "";
  const menuQrUrl = publicSlug ? publicMenuQrUrl(publicSlug) : "";
  const menuQrRef = useRef<StyledQrCodeHandle>(null);
  const qrCenterLogoSrc = isFreePlan
    ? null
    : menu?.logo?.trim()
      ? resolveMenuItemImageSrc(menu.logo)
      : undefined;

  const isAuthHydrating = !userData && Boolean(Cookies.get("sub"));

  useEffect(() => {
    if (!menuSlugOrId || isAuthHydrating) return;
    if (!shouldShowAiImportOnboarding(userData)) return;
    router.replace(`/dashboard/${menuSlugOrId}/import`);
  }, [menuSlugOrId, router, userData, isAuthHydrating]);

  const handleDownloadQr = () => {
    if (!menuQrUrl) return;
    void menuQrRef.current?.download(`menu-qr-${menu?.slug ?? "menu"}.png`);
  };

  if (menuLoading || !menu) {
    return (
      <SkeletonRegion label={t("overview")} className="space-y-4">
        <Skeleton className="h-9 w-64" rounded="md" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[88px] w-full" rounded="lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Skeleton className="h-80 w-full" rounded="lg" />
          <Skeleton className="h-80 w-full lg:col-span-2" rounded="lg" />
        </div>
      </SkeletonRegion>
    );
  }

  const menuName = locale === "ar" ? menu.nameAr : menu.nameEn;
  const isRTL = locale === "ar";
  const isEmptyMenu =
    (menu.categoriesCount ?? 0) === 0 && (menu.itemsCount ?? 0) === 0;

  return (
    <div className="space-y-4">
      <PageTitleWithHelp>
        <PageHeader
          title={menuName}
          description={t("fullMenuManagement")}
          actions={
            <>
              {can("menu:import") ? (
                <MenuImportEntryButton
                  menuId={menuSlugOrId}
                  variant="secondary"
                />
              ) : null}
              {menuLinkUrl ? (
                <ButtonLink
                  href={menuLinkUrl}
                  external
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="md"
                  startIcon={<IoOpenOutline className="size-3.5" />}
                >
                  {t("viewMenu")}
                </ButtonLink>
              ) : null}
            </>
          }
        />
      </PageTitleWithHelp>

      {isEmptyMenu && can("menu:import") ? (
        <MenuImportEntryButton menuId={menuSlugOrId} variant="card" />
      ) : null}

      <section aria-label={t("overview")}>
        <StatGrid>
          <StatCard
            label={t("categoriesCount")}
            value={menu.categoriesCount ?? 0}
            icon={<BiCategory />}
          />
          <StatCard
            label={t("activeItems")}
            value={menu.activeItemsCount ?? 0}
            icon={<IoCheckmarkCircleOutline />}
          />
          <StatCard
            label={t("totalItems")}
            value={menu.itemsCount ?? 0}
            icon={<IoLinkOutline />}
          />
          <StatCard
            label={t("totalViews")}
            value={menu.views ?? 0}
            icon={<IoEyeOutline />}
          />
        </StatGrid>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card as="section" aria-labelledby="qr-title" className="flex flex-col">
          <CardHeader
            title={<span id="qr-title">{t("qrTitle")}</span>}
            description={t("qrDescription")}
          />

          {menuQrUrl ? (
            <div className="mt-3 flex flex-1 flex-col items-center gap-3">
              <div className="rounded-lg border border-line bg-white p-2">
                <StyledQrCode
                  ref={menuQrRef}
                  value={menuQrUrl}
                  size={400}
                  displaySize={168}
                  centerLogoSrc={qrCenterLogoSrc}
                  className="rounded"
                />
              </div>

              <p className="flex w-full items-baseline justify-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-xs text-fg-muted">
                {t("scanCountLabel")}
                <span
                  className="text-sm font-semibold tabular-nums text-fg"
                  data-numeric
                >
                  {menu.qrScans ?? 0}
                </span>
              </p>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleDownloadQr}
                startIcon={<IoDownloadOutline className="size-3.5" />}
              >
                {t("downloadAsImage")}
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface-2/40 py-10 text-xs text-fg-subtle">
              <BsQrCode className="size-6" aria-hidden />
              <span>{t("qrUnavailable")}</span>
            </div>
          )}
        </Card>

        <Card
          as="section"
          aria-labelledby="activity-title"
          className="lg:col-span-2"
        >
          <CardHeader
            title={<span id="activity-title">{t("latestActivity")}</span>}
          />
          <div className="mt-3">
            <RecentActivityList
              entries={latestActivity}
              loading={activityLoading}
              menuSlugOrId={menuSlugOrId}
              isRTL={isRTL}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
