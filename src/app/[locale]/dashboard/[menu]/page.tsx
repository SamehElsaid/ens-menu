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
  CardFooter,
  CardHeader,
  PageHeader,
  PageShell,
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
        <Skeleton className="h-[92px] w-full" rounded="lg" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Skeleton className="h-80 w-full lg:col-span-2" rounded="lg" />
          <Skeleton className="h-80 w-full" rounded="lg" />
        </div>
      </SkeletonRegion>
    );
  }

  const menuName = locale === "ar" ? menu.nameAr : menu.nameEn;
  const isEmptyMenu =
    (menu.categoriesCount ?? 0) === 0 && (menu.itemsCount ?? 0) === 0;

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp>
          <PageHeader
            eyebrow={t("overview")}
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
      }
    >
      {isEmptyMenu && can("menu:import") ? (
        <MenuImportEntryButton menuId={menuSlugOrId} variant="card" />
      ) : null}

      {/* Edge-sharing: four figures about one menu are one instrument panel,
          not four cards that happen to be adjacent. */}
      <section aria-label={t("overview")}>
        <StatGrid ruled>
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

      {/* Activity leads, the QR follows. What changed on the menu is the
          question this page is opened to answer; the QR is a tool that is used
          once and printed, and it was holding the start of the reading order. */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          as="section"
          aria-labelledby="activity-title"
          className="lg:col-span-2"
        >
          <CardHeader
            eyebrow={t("overview")}
            title={<span id="activity-title">{t("latestActivity")}</span>}
          />
          <div className="mt-3">
            <RecentActivityList
              entries={latestActivity}
              loading={activityLoading}
              menuSlugOrId={menuSlugOrId}
            />
          </div>
        </Card>

        <Card as="section" aria-labelledby="qr-title" className="flex flex-col">
          <CardHeader
            title={<span id="qr-title">{t("qrTitle")}</span>}
            description={t("qrDescription")}
          />

          {menuQrUrl ? (
            <div className="mt-3 flex flex-1 flex-col">
              {/* One pass of light down the code on mount, then stillness.
                  It is the same "light lands on a code" idea the marketing site
                  opens with, placed on the one element the owner is about to
                  print and put on a table — and it runs once, so it never
                  becomes wallpaper on a screen they open every shift. */}
              <div className="s-scan flex justify-center border border-line bg-white p-3">
                <StyledQrCode
                  ref={menuQrRef}
                  value={menuQrUrl}
                  size={400}
                  displaySize={168}
                  centerLogoSrc={qrCenterLogoSrc}
                />
              </div>

              {/* The address the code resolves to, in mono and forced LTR: an
                  operator checking a printed code needs to read the URL, and a
                  URL set in the UI face with Arabic bidi around it is a support
                  ticket waiting to happen. */}
              {menuLinkUrl ? (
                <p
                  dir="ltr"
                  className="mt-2 truncate border-b border-line py-2 text-center font-mono text-[11px] text-fg-muted"
                >
                  {menuLinkUrl.replace(/^https?:\/\//, "")}
                </p>
              ) : null}

              {/* A figure and its ticket label, on one ruled row — the same
                  pairing the stat rail above uses, so the scan count reads as a
                  metric rather than as a caption. */}
              <p className="mt-auto flex items-baseline justify-between gap-2 pt-3">
                <span className="ui-label text-fg-muted">
                  {t("scanCountLabel")}
                </span>
                <span className="ui-figure text-[17px] text-fg" data-numeric>
                  {menu.qrScans ?? 0}
                </span>
              </p>

              <CardFooter>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={handleDownloadQr}
                  startIcon={<IoDownloadOutline className="size-3.5" />}
                >
                  {t("downloadAsImage")}
                </Button>
              </CardFooter>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface-2/40 py-10 text-xs text-fg-subtle">
              <BsQrCode className="size-6" aria-hidden />
              <span>{t("qrUnavailable")}</span>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
