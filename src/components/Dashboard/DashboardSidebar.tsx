"use client";
import { usePathname } from "@/i18n/navigation";
import { CLOSE_NAV_OVERLAYS_EVENT } from "@/lib/safeNavigation";
import { isFreePlanUser } from "@/lib/subscription";
import { useCallback, useEffect, useState } from "react";
import LinkTo from "../Global/LinkTo";
import { adminNavSections, cashierNavSections, navSections } from "./data";
import { useDashboardSession } from "@/hooks/useDashboardSession";
import Drawer from "../Global/Drawer";
import { useLocale, useTranslations } from "next-intl";
import LoadImage from "../ImageLoad";
import { useAppSelector } from "@/store/hooks";
import Logo from "../Global/Logo";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { usePendingOrdersCount } from "@/hooks/usePendingOrdersCount";
import type { AdminPermissionKey } from "@/types/AdminPermission";
import type { NavItem, NavSection } from "./data";
import ProUpgradeModal from "./ProUpgradeModal";
import { FaCrown } from "react-icons/fa";
import { IoOpenOutline } from "react-icons/io5";
import {
  publicMenuLinkUrl,
  resolvePublicMenuSlug,
} from "@/lib/publicMenuUrl";

const ITEM =
  "flex w-full min-h-10 items-center gap-3 overflow-visible rounded-md px-3 py-1.5 text-[13px] font-normal leading-[1.45] transition-colors duration-150";

function itemClass(
  active: boolean,
  opts: { comingSoon?: boolean; locked?: boolean } = {},
) {
  if (opts.comingSoon) {
    return `${ITEM} cursor-default text-slate-400 dark:text-slate-500`;
  }
  if (opts.locked) {
    return `${ITEM} cursor-pointer text-slate-500 hover:bg-slate-50/80 dark:text-slate-500 dark:hover:bg-white/[0.03]`;
  }
  if (active) {
    return `${ITEM} bg-slate-100/90 text-slate-900 dark:bg-white/[0.06] dark:text-slate-100`;
  }
  return `${ITEM} text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]`;
}

const INLINE_BADGE =
  "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-semibold leading-tight";

function inlineBadgeClass(
  variant: "new" | "beta" | "soon" | "pro",
): string {
  if (variant === "new") {
    return `${INLINE_BADGE} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/30`;
  }
  if (variant === "beta") {
    return `${INLINE_BADGE} bg-amber-50 text-amber-700 ring-1 ring-amber-200/50 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/30`;
  }
  if (variant === "pro") {
    return `${INLINE_BADGE} uppercase tracking-wide bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 ring-1 ring-amber-200/55 dark:from-amber-950/50 dark:to-orange-950/30 dark:text-amber-300 dark:ring-amber-800/35`;
  }
  return `${INLINE_BADGE} bg-slate-100 text-slate-500 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700/50`;
}

type SidebarNavItemProps = {
  item: NavItem;
  active: boolean;
  href: string;
  locked: boolean;
  t: ReturnType<typeof useTranslations<"Dashboard">>;
  resolveItemBadge: (item: NavItem) => string | undefined;
  onNavigate: () => void;
  onLockedClick: (featureKey: string) => void;
};

function SidebarNavItem({
  item,
  active,
  href,
  locked,
  t,
  resolveItemBadge,
  onNavigate,
  onLockedClick,
}: SidebarNavItemProps) {
  const itemKey = item.key ?? item.label;
  const iconTone = item.comingSoon
    ? "text-slate-400 dark:text-slate-500"
    : locked
      ? "text-slate-400 dark:text-slate-500"
      : active
        ? "text-slate-700 dark:text-slate-200"
        : "text-slate-500 dark:text-slate-500";

  const countBadge = !locked ? resolveItemBadge(item) : undefined;
  const trailingBadges =
    item.badges?.length || locked || countBadge ? (
      <span className="flex shrink-0 items-center gap-1.5">
        {item.badges?.map((badge) => (
          <span
            key={badge.label}
            className={inlineBadgeClass(badge.variant)}
          >
            {t(badge.label)}
          </span>
        ))}
        {locked && (
          <>
            <span className={inlineBadgeClass("pro")}>{t("badgePro")}</span>
            <FaCrown
              className="size-3 shrink-0 text-amber-500/80 dark:text-amber-400/70"
              aria-hidden
            />
          </>
        )}
        {countBadge && (
          <span className="inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight tabular-nums bg-amber-50 text-amber-800 ring-1 ring-amber-200/50 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/35">
            {countBadge}
          </span>
        )}
      </span>
    ) : null;

  const labelContent = (
    <>
      <item.icon
        className={`size-[18px] shrink-0 ${iconTone}`}
        aria-hidden
      />
      <span
        className={`flex-1 text-start whitespace-normal break-words ${locked ? "text-slate-500" : ""}`}
      >
        {t(item.label)}
      </span>
      {trailingBadges}
    </>
  );

  if (item.comingSoon) {
    return (
      <div key={itemKey} aria-disabled className={itemClass(false, { comingSoon: true })}>
        {labelContent}
      </div>
    );
  }

  if (locked) {
    return (
      <button
        type="button"
        key={itemKey}
        onClick={() => onLockedClick(item.key ?? item.label)}
        className={itemClass(false, { locked: true })}
      >
        {labelContent}
      </button>
    );
  }

  return (
    <LinkTo
      href={href}
      key={itemKey}
      id={
        item.key === "items"
          ? "onboarding-sidebar-items"
          : item.key === "settings"
            ? "onboarding-sidebar-settings"
            : item.navId
      }
      onClick={onNavigate}
      className={itemClass(active)}
    >
      {labelContent}
    </LinkTo>
  );
}

function clusterItems(items: NavItem[]): { subgroup?: string; items: NavItem[] }[] {
  const clusters: { subgroup?: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = clusters[clusters.length - 1];
    if (last && last.subgroup === item.subgroup) {
      last.items.push(item);
    } else {
      clusters.push({ subgroup: item.subgroup, items: [item] });
    }
  }
  return clusters;
}

function NavGroup({
  section,
  showDivider,
  isItemActive,
  itemHref,
  isItemLocked,
  t,
  resolveItemBadge,
  onNavigate,
  onLockedClick,
}: {
  section: NavSection;
  showDivider: boolean;
  isItemActive: (item: NavItem) => boolean;
  itemHref: (link: string) => string;
  isItemLocked: (item: NavItem) => boolean;
  t: ReturnType<typeof useTranslations<"Dashboard">>;
  resolveItemBadge: (item: NavItem) => string | undefined;
  onNavigate: () => void;
  onLockedClick: (featureKey: string) => void;
}) {
  const clusters = clusterItems(section.items);

  return (
    <div
      className={
        showDivider
          ? "border-t border-slate-100/90 pt-2 dark:border-slate-800/70"
          : ""
      }
    >
      <div className="flex flex-col gap-1">
        {clusters.map((cluster, ci) => {
          const isCluster = Boolean(cluster.subgroup);
          const inner = (
            <div className={`flex flex-col ${isCluster ? "gap-px" : "gap-0.5"}`}>
              {cluster.items.map((item) => (
                <SidebarNavItem
                  key={item.key ?? item.label}
                  item={item}
                  active={!item.comingSoon && isItemActive(item)}
                  locked={isItemLocked(item)}
                  href={itemHref(item.link ?? "")}
                  t={t}
                  resolveItemBadge={resolveItemBadge}
                  onNavigate={onNavigate}
                  onLockedClick={onLockedClick}
                />
              ))}
            </div>
          );

          if (!isCluster) {
            return <div key={`c-${ci}`}>{inner}</div>;
          }

          return (
            <div
              key={`c-${cluster.subgroup}`}
              className="rounded-lg bg-slate-50/70 p-0.5 ring-1 ring-inset ring-slate-100 dark:bg-white/[0.02] dark:ring-slate-800/80"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardSidebar({
  isMenuOpen,
  segment,
  setIsMenuOpen,
  isAdmin = false,
}: {
  isMenuOpen: boolean;
  segment: string | null;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const session = useDashboardSession();
  const { has: hasAdminPermission } = useAdminPermissions();
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan =
    !isAdmin && (!userData || isFreePlanUser(userData));
  const canFetchProData = Boolean(userData) && !isFreePlan && !isAdmin;

  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    featureKey?: string;
  }>({ open: false });

  const canShowAdminItem = (item: NavItem) => {
    const key = item.key || item.link || "";
    if (!key || key === "overview" || key === "personal") return true;
    return hasAdminPermission(key as AdminPermissionKey);
  };

  const navSectionsData = isAdmin
    ? adminNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter(canShowAdminItem),
        }))
        .filter((section) => section.items.length > 0)
    : session?.role === "staff" && session?.staffJobRole === "cashier"
      ? cashierNavSections
      : navSections;

  const { menu, loading } = useAppSelector((state) => state.menuData);
  const pendingOrdersCount = usePendingOrdersCount(segment, canFetchProData);
  const publicMenuUrl = !isAdmin
    ? publicMenuLinkUrl(resolvePublicMenuSlug(menu?.slug, menu?.id))
    : "";

  const resolveItemBadge = (item: NavItem): string | undefined => {
    if (item.dynamicBadge === "pendingOrders" && pendingOrdersCount > 0) {
      return String(pendingOrdersCount);
    }
    return item.badge;
  };

  const isItemLocked = useCallback(
    (item: NavItem) => Boolean(item.proFeature && isFreePlan),
    [isFreePlan],
  );

  const handleLockedClick = useCallback((featureKey: string) => {
    setUpgradeModal({ open: true, featureKey });
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  useEffect(() => {
    const closeDrawer = () => setIsMenuOpen(false);
    window.addEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeDrawer);
    return () =>
      window.removeEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeDrawer);
  }, [setIsMenuOpen]);

  const itemHref = (link: string) =>
    isAdmin ? `/admin/${link}` : `/dashboard/${segment}/${link}`;

  const subscriptionHref = segment
    ? `/dashboard/${segment}/subscription`
    : "/dashboard/subscription";

  const isItemActive = (item: NavItem) => {
    if (isItemLocked(item)) return false;
    const link = item.link ?? "";
    if (link === "") {
      if (isAdmin) return pathname === "/admin";
      return (
        pathname === `/dashboard/${segment}` ||
        pathname === `/dashboard/${segment}/`
      );
    }
    const href = itemHref(link);
    if (item.exactMatch) {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarSections = (hidden = false) => (
    <aside
      className={`${
        hidden ? "hidden w-[288px]" : "w-full"
      } flex h-dvh flex-col overflow-x-visible border-e border-slate-100 bg-white fixed top-0 start-0 dark:border-slate-800/80 dark:bg-[#0d1117]/95 lg:flex`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {isAdmin ? (
        <div className="flex h-[64px] shrink-0 items-center justify-center border-b border-slate-100 dark:border-slate-800/80">
          <Logo size="small" />
        </div>
      ) : (
        <LinkTo
          href="/"
          className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800/80"
        >
          {loading || !menu ? (
            <div className="flex w-full items-center gap-3">
              <div className="size-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 flex-1 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <>
              {menu.logo ? (
                <LoadImage
                  src={menu.logo}
                  alt={
                    locale === "ar" ? (menu.nameAr ?? "") : (menu.nameEn ?? "")
                  }
                  className="size-10 rounded-xl"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-base font-semibold text-violet-600 dark:text-violet-400">
                  {locale === "ar"
                    ? (menu.nameAr?.charAt(0) ?? "")
                    : (menu.nameEn?.charAt(0) ?? "")}
                </span>
              )}
              <p className="flex-1 text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
                {locale === "ar" ? menu.nameAr : menu.nameEn}
              </p>
            </>
          )}
        </LinkTo>
      )}

      {!isAdmin && publicMenuUrl && (
        <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800/80">
          <a
            href={publicMenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-md shadow-emerald-500/25 transition-colors hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 active:scale-[0.98] dark:shadow-emerald-900/30"
          >
            <IoOpenOutline className="size-[18px] shrink-0" aria-hidden />
            {t("viewMenu")}
          </a>
        </div>
      )}

      <nav className="flex-1 space-y-2 overflow-x-visible overflow-y-auto px-3 py-2.5 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navSectionsData.map((section, index) => (
          <NavGroup
            key={section.id}
            section={section}
            showDivider={index > 0}
            isItemActive={isItemActive}
            isItemLocked={isItemLocked}
            itemHref={itemHref}
            t={t}
            resolveItemBadge={resolveItemBadge}
            onNavigate={() => setIsMenuOpen(false)}
            onLockedClick={handleLockedClick}
          />
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {sidebarSections(true)}
      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title={t("drawerMenuTitle")}
        right={locale === "ar"}
      >
        {sidebarSections()}
      </Drawer>
      <ProUpgradeModal
        open={upgradeModal.open}
        featureKey={upgradeModal.featureKey}
        subscriptionHref={subscriptionHref}
        onClose={() => setUpgradeModal({ open: false })}
      />
    </>
  );
}
