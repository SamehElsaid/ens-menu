"use client";

import { usePathname } from "@/i18n/navigation";
import { CLOSE_NAV_OVERLAYS_EVENT } from "@/lib/safeNavigation";
import { isFreePlanUser } from "@/lib/subscription";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import LinkTo from "../Global/LinkTo";
import { accountNavSections, type NavItem, type NavSection } from "./data";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
import type { AdminPermissionKey } from "@/types/AdminPermission";
import ProUpgradeModal from "./ProUpgradeModal";
import ScopeSwitcher from "./ScopeSwitcher";
import { FiLock } from "react-icons/fi";
import { IoOpenOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Sheet, Tooltip, focusRing } from "@/components/ui";
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import {
  SECTION_LABEL,
  isNavItemActive,
  navItemHref,
  sectionsForScope,
  type ConsoleScope,
} from "@/lib/consoleNav";

/**
 * The rail — CONSOLE-REDESIGN.md §2.
 *
 * One frame, two zones. The venue zone fills in when a menu is selected; the
 * account zone is always present. Nothing swaps identity underneath the
 * operator, which is what the three previous rails did every time someone
 * crossed between `/dashboard/orders` and `/dashboard/{menu}/items`.
 */

const ROW = cn(
  "group/nav relative flex w-full items-center rounded-lg",
  "min-h-9 sm:min-h-8",
  "text-[13px] font-medium leading-tight row-settle",
  focusRing,
);

function rowClass(
  active: boolean,
  collapsed: boolean,
  opts: { locked?: boolean } = {},
) {
  const geometry = collapsed
    ? "justify-center px-0 gap-0"
    : "gap-2.5 ps-2.5 pe-1.5";

  if (opts.locked) {
    return cn(
      ROW,
      geometry,
      "text-fg-subtle hover:bg-surface-2 hover:text-fg-muted",
    );
  }
  if (active) {
    /* Fill, weight, glyph tint, the inline-start bar and `aria-current` all
       carry the state. The bar is the one that survives collapse, where the
       label and most of the fill are gone. */
    return cn(ROW, geometry, "bg-brand-soft font-semibold text-brand-soft-fg");
  }
  return cn(ROW, geometry, "text-fg-muted hover:bg-surface-2 hover:text-fg");
}

const INLINE_BADGE =
  "ui-label inline-flex shrink-0 items-center rounded-full border px-1.5 py-px";

function inlineBadgeClass(variant: "new" | "beta" | "soon"): string {
  if (variant === "new")
    return cn(INLINE_BADGE, "border-success-line text-success-fg");
  if (variant === "beta")
    return cn(INLINE_BADGE, "border-info-line text-info-fg");
  return cn(INLINE_BADGE, "border-line text-fg-subtle");
}

type RowProps = {
  item: NavItem;
  active: boolean;
  href: string | null;
  locked: boolean;
  collapsed: boolean;
  label: string;
  badgeLabels: Array<{ text: string; variant: "new" | "beta" | "soon" }>;
  countBadge?: string;
  proLabel: string;
  onNavigate: () => void;
  onLockedClick: (featureKey: string) => void;
};

function NavRow({
  item,
  active,
  href,
  locked,
  collapsed,
  label,
  badgeLabels,
  countBadge,
  proLabel,
  onNavigate,
  onLockedClick,
}: RowProps) {
  const body = (
    <>
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1 start-0 w-[3px] rounded-e-full bg-brand"
        />
      ) : null}

      <item.icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-brand-soft-fg" : "text-fg-subtle",
        )}
        aria-hidden
      />

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-start">{label}</span>
          {badgeLabels.map((badge) => (
            <span key={badge.text} className={inlineBadgeClass(badge.variant)}>
              {badge.text}
            </span>
          ))}
          {locked ? (
            <FiLock className="size-3 shrink-0 text-fg-subtle" aria-hidden />
          ) : null}
          {/* A count is a live figure, so it takes the solid brand: it is the
              one thing in the rail that changes while someone is looking. */}
          {countBadge ? (
            <span className="inline-flex min-w-[1.125rem] shrink-0 items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] leading-[1.125rem] font-semibold tabular-nums text-on-brand">
              {countBadge}
            </span>
          ) : null}
        </>
      ) : countBadge ? (
        /* Collapsed, a count becomes a dot on the glyph — the number itself
           would not fit legibly at 60px, and its presence is the signal. */
        <span
          aria-hidden
          className="absolute end-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-surface"
        />
      ) : null}
    </>
  );

  /* Collapsed rows lose their visible label, so the accessible name has to come
     from somewhere else. The tooltip restores it visually; `aria-label`
     restores it for screen readers and never depends on hover. */
  const a11yLabel = collapsed
    ? [label, locked ? proLabel : null, countBadge].filter(Boolean).join(", ")
    : undefined;

  const inner: ReactNode =
    locked || !href ? (
      <button
        type="button"
        onClick={() => onLockedClick(item.key ?? item.label)}
        aria-label={a11yLabel}
        data-console-nav-row
        className={rowClass(false, collapsed, { locked: true })}
      >
        {body}
      </button>
    ) : (
      <LinkTo
        href={href}
        id={
          item.key === "items"
            ? "onboarding-sidebar-items"
            : item.key === "settings"
              ? "onboarding-sidebar-settings"
              : item.navId
        }
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={a11yLabel}
        data-console-nav-row
        className={rowClass(active, collapsed)}
      >
        {body}
      </LinkTo>
    );

  if (!collapsed) return inner;

  return (
    <Tooltip content={label} side="end" className="w-full">
      {inner}
    </Tooltip>
  );
}

export function ConsoleSidebar({
  isMenuOpen,
  setIsMenuOpen,
  collapsed,
  venueRef,
  scope,
  isAdmin = false,
  canReachAdmin = false,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  collapsed: boolean;
  venueRef: string | null;
  scope: ConsoleScope;
  isAdmin?: boolean;
  canReachAdmin?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("common");
  const { isStaff, can } = useAuthorization();
  const { has: hasAdminPermission } = useAdminPermissions();
  const userData = useAppSelector((s) => s.auth.data);
  const menu = useAppSelector((s) => s.menuData.menu);
  const isFreePlan = !isAdmin && (!userData || isFreePlanUser(userData));

  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    featureKey?: string;
  }>({ open: false });

  const {
    unseenTableCount: pendingOrdersCount,
    unseenDeliveryCount: pendingDeliveryOrdersCount,
  } = usePendingOrders();

  const publicMenuUrl =
    scope === "venue" && !isAdmin
      ? publicMenuLinkUrl(resolvePublicMenuSlug(menu?.slug, menu?.id))
      : "";

  /**
   * Permission filters.
   *
   * The admin map used to check the nav `key` directly, which silently hid
   * `domain-transfers`, `vouchers` and `metadata` from restricted admins because
   * those keys are not permissions. Routes are guarded by `canAccessAdminPath`,
   * so the rail now asks the same question the guard does.
   */
  const ADMIN_KEY_TO_PERMISSION: Record<string, AdminPermissionKey> = {
    broadcast: "users",
    "domain-transfers": "users",
    vouchers: "promo",
    "administrators-log": "administrators",
  };

  const canShowAdminItem = useCallback(
    (item: NavItem) => {
      const key = item.key || item.link || "";
      if (!key || key === "overview" || key === "personal") return true;
      if (key === "metadata") return true;
      const permission =
        ADMIN_KEY_TO_PERMISSION[key] ?? (key as AdminPermissionKey);
      return hasAdminPermission(permission);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasAdminPermission],
  );

  const canShowStaffItem = useCallback(
    (item: NavItem) => {
      if (!isStaff) return true;
      if (item.ownerOnly) return false;
      if (!item.permission) return true;
      return can(item.permission);
    },
    [isStaff, can],
  );

  const filterSections = useCallback(
    (sections: NavSection[], forAdmin: boolean) =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            forAdmin ? canShowAdminItem : canShowStaffItem,
          ),
        }))
        .filter((section) => section.items.length > 0),
    [canShowAdminItem, canShowStaffItem],
  );

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

  /**
   * Arrow-key roving inside the rail.
   *
   * Links are natively focusable, so Tab already works and is left alone. This
   * adds the vertical traversal people expect from a list of this length —
   * without it, reaching the account zone from the top of a venue rail is
   * seventeen Tab presses.
   */
  const onNavKeyDown = useCallback((event: React.KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    /* Scoped to the nav that received the event rather than a ref, so the rail
       and the drawer each rove their own rows when both are mounted. */
    const rows = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "[data-console-nav-row]",
      ),
    );
    if (rows.length === 0) return;

    const current = rows.indexOf(document.activeElement as HTMLElement);
    let next = current;

    if (event.key === "ArrowDown") next = current < 0 ? 0 : current + 1;
    if (event.key === "ArrowUp")
      next = current < 0 ? rows.length - 1 : current - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = rows.length - 1;

    if (next < 0 || next >= rows.length) return;
    event.preventDefault();
    rows[next].focus();
  }, []);

  function renderSections(
    sections: NavSection[],
    zoneScope: ConsoleScope,
    collapsed: boolean,
  ) {
    return sections.map((section) => {
      const labelKey = SECTION_LABEL[section.id];
      return (
        <div key={section.id} className="mt-4 first:mt-0">
          {labelKey && !collapsed ? (
            <p className="ui-label mb-1 px-2.5 text-fg-subtle">{t(labelKey)}</p>
          ) : null}
          {/* Collapsed, group headings cannot be shown, so a hairline keeps the
              grouping legible rather than letting the rail become one run of
              seventeen glyphs. */}
          {labelKey && collapsed ? (
            <div className="mx-3 mb-1.5 border-t border-line" aria-hidden />
          ) : null}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const href = navItemHref(zoneScope, item.link ?? "", venueRef);
              const locked = isItemLocked(item);
              const active =
                !locked && href
                  ? isNavItemActive(pathname, href, item.exactMatch)
                  : false;
              const count =
                item.dynamicBadge === "pendingOrders" && pendingOrdersCount > 0
                  ? String(pendingOrdersCount)
                  : item.dynamicBadge === "pendingDeliveryOrders" &&
                      pendingDeliveryOrdersCount > 0
                    ? String(pendingDeliveryOrdersCount)
                    : item.badge;

              return (
                <NavRow
                  key={item.key ?? item.label}
                  item={item}
                  active={active}
                  href={href}
                  locked={locked}
                  collapsed={collapsed}
                  label={t(item.label)}
                  badgeLabels={(item.badges ?? []).map((b) => ({
                    text: t(b.label),
                    variant: b.variant,
                  }))}
                  countBadge={locked ? undefined : count}
                  proLabel={t("badgePro")}
                  onNavigate={() => setIsMenuOpen(false)}
                  onLockedClick={handleLockedClick}
                />
              );
            })}
          </div>
        </div>
      );
    });
  }

  const zoneHeading = (label: string) => (
    <p className="ui-label px-2.5 pb-1.5 text-fg-subtle">{label}</p>
  );

  /**
   * Rendered twice: once collapsed-aware for the desktop rail, once always
   * expanded for the mobile drawer. A drawer has the full width of the screen to
   * play with, so collapsing it would be throwing away space to no purpose.
   */
  function body(collapsed: boolean) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-surface">
        <div className="shrink-0 border-b border-line">
          <ScopeSwitcher
            scope={scope}
            collapsed={collapsed}
            isAdmin={isAdmin}
            canReachAdmin={canReachAdmin}
            onNavigate={() => setIsMenuOpen(false)}
          />
        </div>

        <nav
          onKeyDown={onNavKeyDown}
          aria-label={t("drawerMenuTitle")}
          className="min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]"
        >
          {isAdmin ? (
            renderSections(
              filterSections(sectionsForScope("admin"), true),
              "admin",
              collapsed,
            )
          ) : (
            <>
              {scope === "venue" && venueRef ? (
                <div className="mb-4">
                  {!collapsed ? zoneHeading(t("navZoneVenue")) : null}
                  {renderSections(
                    filterSections(sectionsForScope("venue"), false),
                    "venue",
                    collapsed,
                  )}
                </div>
              ) : null}

              {/* The account zone is never conditional. Orders and staff span
                  every menu, so they must not vanish when a menu opens. */}
              <div
                className={
                  scope === "venue" && venueRef
                    ? "border-t border-line pt-4"
                    : undefined
                }
              >
                {!collapsed ? zoneHeading(t("navZoneAccount")) : null}
                {renderSections(
                  filterSections(accountNavSections, false),
                  "account",
                  collapsed,
                )}
              </div>
            </>
          )}
        </nav>

        {publicMenuUrl ? (
          <div className="shrink-0 border-t border-line p-2">
            <Tooltip
              content={t("viewMenu")}
              side="end"
              disabled={!collapsed}
              className="w-full"
            >
              <a
                href={publicMenuUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={collapsed ? t("viewMenu") : undefined}
                className={cn(
                  "flex min-h-9 w-full items-center rounded-lg sm:min-h-8",
                  collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                  "text-[13px] font-medium text-fg-muted row-settle hover:bg-brand-soft hover:text-brand-soft-fg",
                  focusRing,
                )}
              >
                <IoOpenOutline className="size-4 shrink-0" aria-hidden />
                {!collapsed ? (
                  <span className="flex-1 text-start">{t("viewMenu")}</span>
                ) : null}
              </a>
            </Tooltip>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <aside className="console-rail fixed inset-y-0 start-0 z-30 hidden border-e border-line bg-surface lg:block">
        {body(collapsed)}
      </aside>

      {/* The drawer matches the expanded rail rather than being 48px wider,
          which is what the old 240/288 pairing looked like on rotation. */}
      <Sheet
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="start"
        size="md"
        bare
        closeLabel={tCommon("close")}
        className="lg:hidden"
      >
        {body(false)}
      </Sheet>

      <ProUpgradeModal
        open={upgradeModal.open}
        featureKey={upgradeModal.featureKey}
        subscriptionHref={
          venueRef
            ? `/dashboard/${venueRef}/subscription`
            : "/dashboard/subscription"
        }
        onClose={() => setUpgradeModal({ open: false })}
      />
    </>
  );
}

export default ConsoleSidebar;
