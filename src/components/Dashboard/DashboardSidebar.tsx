"use client";
import { usePathname } from "@/i18n/navigation";
import { CLOSE_NAV_OVERLAYS_EVENT } from "@/lib/safeNavigation";
import { isFreePlanUser } from "@/lib/subscription";
import { useCallback, useEffect, useState } from "react";
import LinkTo from "../Global/LinkTo";
import { accountNavSections, adminNavSections, navSections } from "./data";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import Logo from "../Global/Logo";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
import type { AdminPermissionKey } from "@/types/AdminPermission";
import type { NavItem, NavSection } from "./data";
import ProUpgradeModal from "./ProUpgradeModal";
import MenuSwitcher from "./MenuSwitcher";
import { FiLock } from "react-icons/fi";
import { IoOpenOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Sheet, focusRing } from "@/components/ui";
import {
  publicMenuLinkUrl,
  resolvePublicMenuSlug,
} from "@/lib/publicMenuUrl";

/** Sidebar rail width. `Layout` offsets the main column by the same value. */
export const SIDEBAR_WIDTH = 240;

/**
 * Nav rows are 28px on the rail and 36px in the mobile sheet, where they are
 * touched rather than pointed at.
 */
const ITEM = cn(
  "group/nav relative flex w-full items-center gap-2 rounded-md ps-2 pe-1.5",
  "min-h-9 sm:min-h-7",
  "text-[13px] font-medium leading-tight row-settle",
  focusRing,
);

function itemClass(
  active: boolean,
  opts: { comingSoon?: boolean; locked?: boolean } = {},
) {
  if (opts.comingSoon) {
    return cn(ITEM, "cursor-default text-fg-subtle");
  }
  if (opts.locked) {
    return cn(ITEM, "text-fg-subtle hover:bg-surface-2 hover:text-fg-muted");
  }
  if (active) {
    // Fill, weight, icon tint and `aria-current` all carry the state, so it
    // survives both a monochrome screen and a screen reader.
    return cn(ITEM, "bg-surface-3 font-semibold text-fg");
  }
  return cn(ITEM, "text-fg-muted hover:bg-surface-2 hover:text-fg");
}

const INLINE_BADGE =
  "inline-flex shrink-0 items-center rounded px-1 py-px text-[9px] font-semibold leading-[1.4] uppercase tracking-[0.04em]";

function inlineBadgeClass(variant: "new" | "beta" | "soon"): string {
  if (variant === "new") {
    return cn(INLINE_BADGE, "bg-success-soft text-success-fg");
  }
  if (variant === "beta") {
    return cn(INLINE_BADGE, "bg-info-soft text-info-fg");
  }
  return cn(INLINE_BADGE, "bg-surface-3 text-fg-subtle");
}

/** Section id → label key. A rail of eighteen rows needs headings to be scanned. */
const SECTION_LABEL: Record<string, string> = {
  overview: "navSectionOverview",
  account: "navSectionAccount",
  import: "navSectionImport",
  menu: "navSectionMenu",
  settings: "navSectionSettings",
  activity: "navSectionActivity",
  accountOverview: "navSectionOverview",
  accountOperations: "navSectionOperations",
  accountSettings: "navSectionAccount",
  admin: "navSectionAdmin",
};

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
  const countBadge = !locked ? resolveItemBadge(item) : undefined;

  const labelContent = (
    <>
      <item.icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-brand" : "text-fg-subtle",
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-start">
        {t(item.label)}
      </span>
      {item.badges?.map((badge) => (
        <span key={badge.label} className={inlineBadgeClass(badge.variant)}>
          {t(badge.label)}
        </span>
      ))}
      {locked ? (
        <FiLock
          className="size-3 shrink-0 text-fg-subtle"
          aria-label={t("badgePro")}
        />
      ) : null}
      {countBadge ? (
        <span className="inline-flex min-w-4 shrink-0 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 tabular-nums text-on-brand">
          {countBadge}
        </span>
      ) : null}
    </>
  );

  if (item.comingSoon) {
    return (
      <div
        key={itemKey}
        aria-disabled
        className={itemClass(false, { comingSoon: true })}
      >
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
      aria-current={active ? "page" : undefined}
      className={itemClass(active)}
    >
      {labelContent}
    </LinkTo>
  );
}

function NavGroup({
  section,
  isItemActive,
  itemHref,
  isItemLocked,
  t,
  resolveItemBadge,
  onNavigate,
  onLockedClick,
}: {
  section: NavSection;
  isItemActive: (item: NavItem) => boolean;
  itemHref: (link: string) => string;
  isItemLocked: (item: NavItem) => boolean;
  t: ReturnType<typeof useTranslations<"Dashboard">>;
  resolveItemBadge: (item: NavItem) => string | undefined;
  onNavigate: () => void;
  onLockedClick: (featureKey: string) => void;
}) {
  const labelKey = SECTION_LABEL[section.id];

  return (
    <div className="mb-3 last:mb-0">
      {labelKey ? (
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-subtle">
          {t(labelKey)}
        </p>
      ) : null}
      <div className="flex flex-col gap-px">
        {section.items.map((item) => (
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
    </div>
  );
}

/** `account` renders the /dashboard sidebar; `menu` the /dashboard/:menu one. */
export type SidebarVariant = "account" | "menu";

export function DashboardSidebar({
  isMenuOpen,
  segment,
  setIsMenuOpen,
  isAdmin = false,
  variant = "menu",
}: {
  isMenuOpen: boolean;
  segment: string | null;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  isAdmin?: boolean;
  variant?: SidebarVariant;
}) {
  const isAccountVariant = variant === "account" && !isAdmin;
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("common");
  const { isStaff, can } = useAuthorization();
  const { has: hasAdminPermission } = useAdminPermissions();
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = !isAdmin && (!userData || isFreePlanUser(userData));

  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    featureKey?: string;
  }>({ open: false });

  const canShowAdminItem = (item: NavItem) => {
    const key = item.key || item.link || "";
    if (!key || key === "overview" || key === "personal") return true;
    const permissionKey =
      key === "broadcast" ? "users" : (key as AdminPermissionKey);
    return hasAdminPermission(permissionKey);
  };

  const canShowStaffItem = (item: NavItem) => {
    if (!isStaff) return true; // owner
    if (item.ownerOnly) return false;
    if (!item.permission) return true;
    return can(item.permission);
  };

  const navSectionsData = isAdmin
    ? adminNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter(canShowAdminItem),
        }))
        .filter((section) => section.items.length > 0)
    : (isAccountVariant ? accountNavSections : navSections)
        .map((section) => ({
          ...section,
          items: section.items.filter(canShowStaffItem),
        }))
        .filter((section) => section.items.length > 0);

  const { menu } = useAppSelector((state) => state.menuData);
  const {
    unseenTableCount: pendingOrdersCount,
    unseenDeliveryCount: pendingDeliveryOrdersCount,
  } = usePendingOrders();
  const publicMenuUrl = !isAdmin
    ? publicMenuLinkUrl(resolvePublicMenuSlug(menu?.slug, menu?.id))
    : "";

  const resolveItemBadge = (item: NavItem): string | undefined => {
    if (item.dynamicBadge === "pendingOrders" && pendingOrdersCount > 0) {
      return String(pendingOrdersCount);
    }
    if (
      item.dynamicBadge === "pendingDeliveryOrders" &&
      pendingDeliveryOrdersCount > 0
    ) {
      return String(pendingDeliveryOrdersCount);
    }
    return item.badge;
  };

  const isItemLocked = useCallback(
    (item: NavItem) => Boolean(item.proFeature && isFreePlan),
    [isFreePlan],
  );

  const handleLockedClick = useCallback(
    (featureKey: string) => {
      setUpgradeModal({ open: true, featureKey });
      setIsMenuOpen(false);
    },
    [setIsMenuOpen],
  );

  useEffect(() => {
    const closeDrawer = () => setIsMenuOpen(false);
    window.addEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeDrawer);
    return () =>
      window.removeEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeDrawer);
  }, [setIsMenuOpen]);

  const itemHref = (link: string) => {
    if (isAdmin) return `/admin/${link}`;
    if (isAccountVariant) return link ? `/dashboard/${link}` : "/dashboard";
    return `/dashboard/${segment}/${link}`;
  };

  const subscriptionHref = "/dashboard/subscription";

  const isItemActive = (item: NavItem) => {
    if (isItemLocked(item)) return false;
    const link = item.link ?? "";
    if (link === "") {
      if (isAdmin) return pathname === "/admin";
      if (isAccountVariant) {
        return pathname === "/dashboard" || pathname === "/dashboard/";
      }
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

  /** Position-free so it can be dropped into the fixed rail or the mobile sheet. */
  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {isAdmin || isAccountVariant ? (
        <div className="flex h-12 shrink-0 items-center border-b border-line px-3">
          <Logo size="header" />
        </div>
      ) : (
        <div className="shrink-0 border-b border-line">
          <MenuSwitcher onNavigate={() => setIsMenuOpen(false)} />
        </div>
      )}

      <nav
        aria-label={t("drawerMenuTitle")}
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]"
      >
        {navSectionsData.map((section) => (
          <NavGroup
            key={section.id}
            section={section}
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

      {!isAdmin && !isAccountVariant && publicMenuUrl ? (
        <div className="shrink-0 border-t border-line p-2">
          <a
            href={publicMenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex min-h-9 w-full items-center gap-2 rounded-md px-2 sm:min-h-7",
              "text-[13px] font-medium text-fg-muted row-settle hover:bg-surface-2 hover:text-fg",
              focusRing,
            )}
          >
            <IoOpenOutline className="size-4 shrink-0 text-fg-subtle" aria-hidden />
            <span className="flex-1 text-start">{t("viewMenu")}</span>
          </a>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <aside
        className="fixed inset-y-0 start-0 z-30 hidden border-e border-line bg-surface lg:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebarContent}
      </aside>

      <Sheet
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="start"
        size="sm"
        bare
        closeLabel={tCommon("close")}
        className="lg:hidden"
      >
        {sidebarContent}
      </Sheet>

      <ProUpgradeModal
        open={upgradeModal.open}
        featureKey={upgradeModal.featureKey}
        subscriptionHref={subscriptionHref}
        onClose={() => setUpgradeModal({ open: false })}
      />
    </>
  );
}
