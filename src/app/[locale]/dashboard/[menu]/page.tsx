"use client";

import { useAppSelector } from "@/store/hooks";
import { redirect, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import LinkTo from "@/components/Global/LinkTo";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  IoListOutline,
  IoCheckmarkCircleOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoSettingsOutline,
  IoOpenOutline,
  IoReceiptOutline,
  IoTimeOutline,
  IoEyeOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import {
  MdOutlineFastfood,
  MdOutlineTableBar,
  MdPeopleOutline,
} from "react-icons/md";
import { FiSettings } from "react-icons/fi";
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

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 rounded-lg bg-slate-200 dark:bg-slate-600" />
        <div className="h-7 w-12 rounded-lg bg-slate-200 dark:bg-slate-600" />
      </div>
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-700/50 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-5 flex-1 max-w-[140px] rounded-lg bg-slate-200 dark:bg-slate-600" />
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>
      <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-slate-600" />
    </div>
  );
}

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
      limit: 5,
      includeProSources: Boolean(userData) && !isFreePlan,
    });

  // Orders live on the account page; link there pre-filtered to this menu.
  const accountOrdersHref = menu?.id
    ? `/dashboard/orders?menuId=${menu.id}`
    : "/dashboard/orders";

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

  const textDir = locale === "ar" ? "rtl" : "ltr";

  if (menuLoading || !menu) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse" />
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-2">
          <div className="h-6 w-40 rounded-lg bg-slate-200 dark:bg-slate-600 animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const menuName = locale === "ar" ? menu.nameAr : menu.nameEn;
  const isRTL = locale === "ar";
  const tabBase =
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-[0.98]";
  const tabActive = "bg-primary text-white shadow-md shadow-primary/25";
  const tabInactive =
    "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100 border border-transparent hover:border-slate-200 dark:hover:border-slate-500";
  const tabViewMenu =
    "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25 border border-emerald-400/30";

  const isEmptyMenu =
    (menu.categoriesCount ?? 0) === 0 && (menu.itemsCount ?? 0) === 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title + subtitle + tabs */}
      <header
        id="onboarding-overview-header"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 md:p-8"
      >
        <PageTitleWithHelp className="mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {menuName}
          </h1>
        </PageTitleWithHelp>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {t("fullMenuManagement")}
        </p>

        <nav
          id="onboarding-overview-nav"
          className={`flex flex-wrap gap-2 `}
          aria-label={t("fullMenuManagement")}
        >
          <LinkTo
            href={`/dashboard/${menuSlugOrId}`}
            className={`${tabBase} ${tabActive}`}
          >
            <FaChartLine className="text-lg shrink-0" />
            {t("overview")}
          </LinkTo>
          {can("analytics:view") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/analytics`}
              className={`${tabBase} ${tabInactive}`}
            >
              <IoStatsChartOutline className="text-lg shrink-0" />
              {t("analytics")}
            </LinkTo>
          )}
          {can("menu:categories") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/categories`}
              className={`${tabBase} ${tabInactive}`}
            >
              <IoListOutline className="text-lg shrink-0" />
              {t("categories")}
            </LinkTo>
          )}
          {can("menu:items") && (
            <LinkTo
              id="onboarding-nav-products"
              href={`/dashboard/${menuSlugOrId}/items`}
              className={`${tabBase} ${tabInactive}`}
            >
              <MdOutlineFastfood className="text-lg shrink-0" />
              {t("products")}
            </LinkTo>
          )}
          {can("menu:tables") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/table`}
              className={`${tabBase} ${tabInactive}`}
            >
              <MdOutlineTableBar className="text-lg shrink-0" />
              {t("tables")}
            </LinkTo>
          )}
          {can("orders:view") && (
            <LinkTo
              href={accountOrdersHref}
              className={`${tabBase} ${tabInactive}`}
            >
              <IoReceiptOutline className="text-lg shrink-0" />
              {t("tableOrders")}
            </LinkTo>
          )}
          {can("orders:view") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/history`}
              className={`${tabBase} ${tabInactive}`}
            >
              <IoTimeOutline className="text-lg shrink-0" />
              {t("activityLog")}
            </LinkTo>
          )}
          {can("staff:manage") && (
            <LinkTo
              href="/dashboard/staff"
              className={`${tabBase} ${tabInactive}`}
            >
              <MdPeopleOutline className="text-lg shrink-0" />
              {t("staff")}
            </LinkTo>
          )}
          {can("settings:manage") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/settings`}
              className={`${tabBase} ${tabInactive}`}
            >
              <FiSettings className="text-lg shrink-0" />
              {t("settings")}
            </LinkTo>
          )}
          <a
            href={menuLinkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`${tabBase} ${tabViewMenu}`}
          >
            <IoOpenOutline className="text-lg shrink-0" />
            {t("viewMenu")}
          </a>
        </nav>

        {can("menu:import") && (
          <div className="mt-6 flex flex-wrap gap-3">
            <MenuImportEntryButton menuId={menuSlugOrId} variant="secondary" />
          </div>
        )}
      </header>

      {isEmptyMenu && can("menu:import") && (
        <MenuImportEntryButton menuId={menuSlugOrId} variant="card" />
      )}

      {/* Stats cards */}
      <section
        id="onboarding-overview-stats"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Menu statistics"
        dir={textDir}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/10 dark:hover:border-primary/30 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <BiCategory className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t("categoriesCount")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {menu.categoriesCount ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoCheckmarkCircleOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t("activeItems")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {menu.activeItemsCount ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/10 dark:hover:border-primary/30 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoLinkOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t("totalItems")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {menu.itemsCount ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/30 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoEyeOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t("totalViews")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {menu.views ?? 0}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR code section */}
        <section
          id="onboarding-overview-qr"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 flex flex-col items-center justify-center"
          aria-labelledby="qr-title"
          dir={textDir}
        >
          <div className="flex items-center gap-2 mb-2 w-full">
            <BsQrCode className="text-primary text-xl shrink-0" aria-hidden />
            <h2
              id="qr-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {t("qrTitle")}
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
            {t("qrDescription")}
          </p>
          {menuQrUrl ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col items-center gap-1.5">
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 shadow-inner ring-1 ring-slate-100/50 dark:ring-slate-700/50">
                  <StyledQrCode
                    ref={menuQrRef}
                    value={menuQrUrl}
                    size={400}
                    displaySize={200}
                    centerLogoSrc={qrCenterLogoSrc}
                    className="rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-wide text-center max-w-[200px] leading-tight">
                  powered by ensmenu
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-primary/5 dark:bg-primary/10 px-4 py-2 w-full justify-center">
                <BsQrCode
                  className="text-primary text-base shrink-0"
                  aria-hidden
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t("scanCountLabel")}
                </span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {menu.qrScans ?? 0}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
              >
                <IoDownloadOutline className="text-lg" />
                {t("downloadAsImage")}
              </button>
            </div>
          ) : (
            <div className="w-[200px] h-[200px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
              <BsQrCode className="text-3xl" />
              <span>{t("qrUnavailable")}</span>
            </div>
          )}
        </section>

        {/* Quick action cards */}
        <div
          id="onboarding-overview-quick-actions"
          className="lg:col-span-2 space-y-4"
          role="list"
        >
          <a
            href={menuLinkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                {t("generalPreview")}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t("generalPreviewDescription")}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 group-hover:scale-105 transition-all duration-200">
              <IoLinkOutline className="text-xl" />
            </div>
          </a>
          {can("settings:manage") && (
            <LinkTo
              href={`/dashboard/${menuSlugOrId}/settings`}
              role="listitem"
              className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                  {t("menuSettings")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t("menuSettingsDescription")}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-200">
                <IoSettingsOutline className="text-xl" />
              </div>
            </LinkTo>
          )}
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/items`}
            role="listitem"
            className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                {t("menuItems")}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t("menuItemsDescription")}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 group-hover:scale-105 transition-all duration-200">
              <MdOutlineFastfood className="text-xl" />
            </div>
          </LinkTo>
        </div>
      </div>

      {/* Latest activity */}
      <section
        id="onboarding-overview-activity"
        className="mb-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 transition-all duration-200 hover:shadow-md"
        aria-labelledby="activity-title"
        dir={textDir}
      >
        <h2
          id="activity-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
        >
          {t("latestActivity")}
        </h2>
        <RecentActivityList
          entries={latestActivity}
          loading={activityLoading}
          menuSlugOrId={menuSlugOrId}
          isRTL={isRTL}
        />
      </section>
    </div>
  );
}
