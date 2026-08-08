"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiCheck, FiPlus, FiSearch } from "react-icons/fi";
import { HiOutlineSelector } from "react-icons/hi";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  localizedMenuName,
  useDashboardMenus,
  type DashboardMenu,
} from "@/hooks/useDashboardMenus";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import { cn } from "@/lib/cn";
import { focusRing, Skeleton } from "@/components/ui";
import LoadImage from "../ImageLoad";

/**
 * The trailing path inside a menu — `items`, `settings/design`, and so on.
 *
 * Switching menus keeps the operator where they already are instead of
 * returning them to the menu list, so comparing the same screen across two
 * branches is one click rather than four.
 */
function subRouteOf(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/[^/]+\/?(.*)$/);
  return match?.[1] ?? "";
}

function MenuAvatar({
  menu,
  name,
  size = 20,
}: {
  menu: Pick<DashboardMenu, "logo">;
  name: string;
  size?: number;
}) {
  if (menu.logo) {
    return (
      <LoadImage
        src={menu.logo}
        alt=""
        className="shrink-0 rounded-[5px] object-cover"
        width={size}
        height={size}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-[5px] bg-brand-soft text-[10px] font-semibold text-brand-soft-fg"
      style={{ width: size, height: size }}
    >
      {name.charAt(0)}
    </span>
  );
}

export function MenuSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const { menu: activeMenu } = useAppSelector((state) => state.menuData);
  const { menus, loading } = useDashboardMenus();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const activeRef = getMenuDashboardRef(activeMenu);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) =>
      localizedMenuName(m, locale).toLowerCase().includes(q),
    );
  }, [menus, query, locale]);

  const activeName = activeMenu
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

  function goTo(menu: DashboardMenu) {
    const ref = getMenuDashboardRef(menu);
    if (!ref) return;
    const sub = subRouteOf(pathname);
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(sub ? `/dashboard/${ref}/${sub}` : `/dashboard/${ref}`);
  }

  if (!activeMenu) {
    return (
      <div className="flex h-12 items-center gap-2 px-3">
        <Skeleton className="size-5" rounded="md" />
        <Skeleton className="h-3 flex-1" rounded="full" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          window.setTimeout(() => searchRef.current?.focus(), 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("switchMenu")}
        className={cn(
          "flex h-12 w-full items-center gap-2 px-3 text-start",
          "row-settle hover:bg-surface-2",
          focusRing,
        )}
      >
        <MenuAvatar
          menu={{ logo: activeMenu.logo ?? null }}
          name={activeName}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-fg">
            {activeName}
          </span>
        </span>
        <HiOutlineSelector
          className="size-4 shrink-0 text-fg-subtle"
          aria-hidden
        />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="listbox"
            aria-label={t("switchMenu")}
            className={cn(
              "absolute inset-x-2 top-[calc(100%-4px)] z-50 overflow-hidden rounded-xl",
              "border border-line bg-raised shadow-lg",
              "motion-safe:animate-[ui-pop-in_140ms_cubic-bezier(0.16,1,0.3,1)]",
            )}
          >
            <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
              <FiSearch className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder={t("searchMenus")}
                aria-label={t("searchMenus")}
                className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-1 [scrollbar-width:thin]">
              {loading ? (
                <div className="space-y-1 p-1">
                  <Skeleton className="h-7" rounded="md" />
                  <Skeleton className="h-7" rounded="md" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-fg-subtle">
                  {t("noMenusFound")}
                </p>
              ) : (
                filtered.map((m) => {
                  const name = localizedMenuName(m, locale);
                  const isActive = getMenuDashboardRef(m) === activeRef;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => goTo(m)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start",
                        "row-settle",
                        isActive
                          ? "bg-surface-3 text-fg"
                          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                        focusRing,
                      )}
                    >
                      <MenuAvatar menu={m} name={name} size={18} />
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {name}
                      </span>
                      {isActive ? (
                        <FiCheck
                          className="size-3.5 shrink-0 text-brand"
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
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                  router.push("/dashboard");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start",
                  "row-settle text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg",
                  focusRing,
                )}
              >
                <FiPlus className="size-3.5 shrink-0" aria-hidden />
                {t("myMenus")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default MenuSwitcher;
