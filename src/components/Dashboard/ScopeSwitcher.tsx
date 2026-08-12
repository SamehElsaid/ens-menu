"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheck, FiSearch } from "react-icons/fi";
import { HiOutlineSelector } from "react-icons/hi";
import { IoGridOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  localizedMenuName,
  useDashboardMenus,
  type DashboardMenu,
} from "@/hooks/useDashboardMenus";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import { ACCOUNT_SEGMENTS, type ConsoleScope } from "@/lib/consoleNav";
import { cn } from "@/lib/cn";
import { focusRing, Skeleton, Tooltip } from "@/components/ui";
import LoadImage from "../ImageLoad";

/** Searching a list only helps past the point where scanning it stops working. */
const SEARCH_THRESHOLD = 7;

/**
 * The trailing path inside a menu — `items`, `settings/design`, and so on.
 *
 * Switching menus keeps the operator where they already are instead of
 * returning them to the menu list, so comparing the same screen across two
 * branches is one click rather than four. Account routes are excluded: there is
 * no `/dashboard/{menu}/orders` to land on.
 */
function venueSubRoute(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/([^/]+)\/?(.*)$/);
  if (!match) return "";
  if (ACCOUNT_SEGMENTS.has(match[1])) return "";
  return match[2] ?? "";
}

function VenueAvatar({
  logo,
  name,
  size = 22,
}: {
  logo?: string | null;
  name: string;
  size?: number;
}) {
  if (logo) {
    return (
      <LoadImage
        src={logo}
        alt=""
        className="shrink-0 rounded-md object-cover"
        width={size}
        height={size}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md bg-brand-soft text-[10px] font-semibold uppercase text-brand-soft-fg"
      style={{ width: size, height: size }}
    >
      {name.trim().charAt(0) || "•"}
    </span>
  );
}

/**
 * Heads the rail and answers "what am I operating on" — CONSOLE-REDESIGN.md §2.
 *
 * The old `MenuSwitcher` only existed inside a menu, so the account and admin
 * shells had no scope indicator at all and no way into a menu. This control is
 * present in every scope and can reach every other one, which is what turns
 * three separate sidebars into one frame.
 */
export function ScopeSwitcher({
  scope,
  collapsed = false,
  isAdmin = false,
  canReachAdmin = false,
  onNavigate,
}: {
  scope: ConsoleScope;
  collapsed?: boolean;
  isAdmin?: boolean;
  canReachAdmin?: boolean;
  onNavigate?: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const activeMenu = useAppSelector((state) => state.menuData.menu);
  const { menus, loading } = useDashboardMenus();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeRef = getMenuDashboardRef(activeMenu);
  const showSearch = menus.length >= SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) =>
      localizedMenuName(m, locale).toLowerCase().includes(q),
    );
  }, [menus, query, locale]);

  const activeName =
    scope === "venue" && activeMenu
      ? localizedMenuName(
          {
            nameAr: activeMenu.nameAr ?? null,
            nameEn: activeMenu.nameEn ?? null,
            slug: activeMenu.slug ?? null,
            id: activeMenu.id,
          },
          locale,
        )
      : "";

  useEffect(() => {
    if (!open) return;
    if (showSearch) window.setTimeout(() => searchRef.current?.focus(), 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, showSearch]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function goToVenue(menu: DashboardMenu) {
    const ref = getMenuDashboardRef(menu);
    if (!ref) return;
    const sub = venueSubRoute(pathname);
    close();
    onNavigate?.();
    router.push(sub ? `/dashboard/${ref}/${sub}` : `/dashboard/${ref}`);
  }

  function goTo(href: string) {
    close();
    onNavigate?.();
    router.push(href);
  }

  /* Identity of the current scope. Admin is deliberately a different glyph and
     not a venue avatar — mistaking the back office for a venue is the one
     confusion this control exists to prevent. */
  const identity = isAdmin
    ? {
        avatar: (
          <span
            aria-hidden
            className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-fg text-surface"
          >
            <IoShieldCheckmarkOutline className="size-3.5" />
          </span>
        ),
        title: t("navAdminConsole"),
      }
    : scope === "venue" && activeMenu
      ? {
          avatar: <VenueAvatar logo={activeMenu.logo} name={activeName} />,
          title: activeName,
        }
      : {
          avatar: (
            <span
              aria-hidden
              className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-surface-3 text-fg-muted"
            >
              <IoGridOutline className="size-3.5" />
            </span>
          ),
          title: t("navAllVenues"),
        };

  if (scope === "venue" && !activeMenu && !isAdmin) {
    return (
      <div className="flex h-12 items-center gap-2 px-3">
        <Skeleton className="size-[22px]" rounded="md" />
        {!collapsed ? <Skeleton className="h-3 flex-1" rounded="full" /> : null}
      </div>
    );
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => (open ? close() : setOpen(true))}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={t("switchMenu")}
      className={cn(
        "flex h-12 w-full items-center gap-2 text-start row-settle hover:bg-surface-2",
        collapsed ? "justify-center px-0" : "px-3",
        focusRing,
      )}
    >
      {identity.avatar}
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg">
            {identity.title}
          </span>
          <HiOutlineSelector
            className="size-4 shrink-0 text-fg-subtle"
            aria-hidden
          />
        </>
      ) : null}
    </button>
  );

  return (
    <div className="relative">
      {collapsed ? (
        <Tooltip content={identity.title} side="end" className="w-full">
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden />
          <div
            ref={popoverRef}
            role="menu"
            aria-label={t("switchMenu")}
            className={cn(
              "absolute top-[calc(100%-2px)] z-50 overflow-hidden rounded-xl",
              "border border-line bg-raised shadow-xl",
              collapsed ? "start-2 w-64" : "inset-x-2",
              "motion-safe:animate-[ui-pop-in_var(--dur-pop)_var(--ease-enter)]",
            )}
          >
            {showSearch ? (
              <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
                <FiSearch
                  className="size-3.5 shrink-0 text-fg-subtle"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchMenus")}
                  aria-label={t("searchMenus")}
                  className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
                />
              </div>
            ) : null}

            <div className="max-h-[17rem] overflow-y-auto p-1 [scrollbar-width:thin]">
              <p className="ui-label px-2 pb-1 pt-1.5 text-fg-subtle">
                {t("commandGroupVenues")}
              </p>
              {loading ? (
                <div className="space-y-1 p-1">
                  <Skeleton className="h-8" rounded="md" />
                  <Skeleton className="h-8" rounded="md" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-fg-subtle">
                  {t("noMenusFound")}
                </p>
              ) : (
                filtered.map((m) => {
                  const name = localizedMenuName(m, locale);
                  const isActive =
                    !isAdmin && getMenuDashboardRef(m) === activeRef;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isActive}
                      onClick={() => goToVenue(m)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start row-settle",
                        isActive
                          ? "bg-brand-soft font-semibold text-brand-soft-fg"
                          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                        focusRing,
                      )}
                    >
                      <VenueAvatar logo={m.logo} name={name} size={20} />
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {name}
                      </span>
                      {isActive ? (
                        <FiCheck
                          className="size-3.5 shrink-0 text-brand-soft-fg"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-line p-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => goTo("/dashboard")}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start row-settle",
                  "text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg",
                  focusRing,
                )}
              >
                <IoGridOutline className="size-4 shrink-0" aria-hidden />
                {t("navAllVenues")}
              </button>

              {canReachAdmin ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => goTo("/admin")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start row-settle",
                    "text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg",
                    focusRing,
                  )}
                >
                  <IoShieldCheckmarkOutline
                    className="size-4 shrink-0"
                    aria-hidden
                  />
                  {t("navAdminConsole")}
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default ScopeSwitcher;
