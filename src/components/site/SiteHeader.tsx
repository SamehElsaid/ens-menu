"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { SiteNavLink } from "./SiteNavLink";
import {
  FiBookOpen,
  FiChevronDown,
  FiDownload,
  FiHelpCircle,
  FiInfo,
  FiMail,
  FiMenu,
  FiSmartphone,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/cn";
import UserDropDown from "@/components/UserDropDown";
import HeaderSearch from "@/components/Global/HeaderSearch";
import SiteLogo from "./SiteLogo";
import { SiteLanguageToggle, SiteThemeToggle } from "./SiteToggles";
import { SiteButtonLink } from "./Button";

/**
 * Public header — floating inset navigation.
 *
 * Designed to belong beside the approved Dashboard chrome without becoming
 * another Admin toolbar: frosted elevated pill, brand used only for active /
 * CTA / focus, centered destinations, and a rounded mobile sheet with the
 * primary action pinned above the safe area.
 *
 * Elevation deepens on scroll (shadow + opacity) rather than flipping colour,
 * so the bar never fights a hero running underneath it.
 */

type NavChild = {
  label: string;
  description: string;
  href: string;
  icon: IconType;
};

type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavChild[];
};

function useNavItems(): NavItem[] {
  const t = useTranslations("header");

  return [
    {
      id: "product",
      label: t("product"),
      children: [
        {
          label: t("ownerApp"),
          description: t("descOwnerApp"),
          href: "/ens_owner_app_owner",
          icon: FiDownload,
        },
        {
          label: t("androidApp"),
          description: t("descStaffApp"),
          href: "/mobile-app",
          icon: FiSmartphone,
        },
      ],
    },
    { id: "pricing", label: t("pricingPage"), href: "/pricing" },
    {
      id: "resources",
      label: t("resources"),
      children: [
        {
          label: t("knowledgeBase"),
          description: t("descKnowledge"),
          href: "/knowledge-base",
          icon: FiBookOpen,
        },
        {
          label: t("faq"),
          description: t("descFaq"),
          href: "/faq",
          icon: FiHelpCircle,
        },
      ],
    },
    {
      id: "company",
      label: t("company"),
      children: [
        {
          label: t("about"),
          description: t("descAbout"),
          href: "/about",
          icon: FiInfo,
        },
        {
          label: t("contact"),
          description: t("descContact"),
          href: "/contact",
          icon: FiMail,
        },
      ],
    },
  ];
}

const triggerBase =
  "relative flex h-8 items-center gap-1 rounded-full px-3 text-site-sm font-medium " +
  "transition-[color,background-color,box-shadow] duration-(--dur-settle) ease-(--ease-settle) " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-brand/35 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg";

const triggerIdle =
  "text-site-fg hover:bg-site-tint hover:text-site-ink";
const triggerActive =
  "bg-site-brand-tint text-site-brand-deep shadow-[inset_0_0_0_1px_var(--s-brand-line)]";

function triggerClass(active: boolean) {
  return cn(triggerBase, active ? triggerActive : triggerIdle);
}

/* -------------------------------------------------------------------------- */

function PanelRow({
  child,
  onNavigate,
}: {
  child: NavChild;
  onNavigate: () => void;
}) {
  return (
    <SiteNavLink
      href={child.href}
      prefetch={false}
      onClick={onNavigate}
      className={cn(
        "group flex items-start gap-3 rounded-site-control px-3 py-3",
        "transition-colors duration-(--dur-settle) ease-(--ease-settle)",
        "hover:bg-site-brand-tint",
        "focus-visible:outline-none focus-visible:bg-site-brand-tint",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-site-brand/30",
      )}
    >
      <span
        className={cn(
          "mt-px flex size-9 shrink-0 items-center justify-center rounded-site-control",
          "border border-site-line bg-site-ground text-site-muted",
          "transition-[background-color,border-color,color,box-shadow] duration-(--dur-settle)",
          "group-hover:border-transparent group-hover:bg-site-brand group-hover:text-white",
          "group-hover:shadow-site-brand",
        )}
      >
        <child.icon className="size-[17px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-site-sm font-semibold text-site-ink transition-colors group-hover:text-site-brand-deep">
          {child.label}
        </span>
        <span className="mt-0.5 block text-site-xs leading-relaxed text-site-muted">
          {child.description}
        </span>
      </span>
    </SiteNavLink>
  );
}

function DesktopDropdown({
  item,
  isActive,
  align = "start",
}: {
  item: NavItem;
  isActive: boolean;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Stable id — `useId()` can diverge across App Router SSR/client trees and
     trip a hydration warning on `aria-controls` even when the markup matches. */
  const panelId = `site-nav-${item.id}`;
  const childCount = item.children?.length ?? 0;

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass(open || isActive)}
      >
        {item.label}
        <FiChevronDown
          aria-hidden
          className={cn(
            "size-3.5 text-site-muted transition-transform duration-(--dur-pop) ease-(--ease-enter)",
            open && "rotate-180 text-site-brand-deep",
          )}
        />
      </button>

      <div
        id={panelId}
        data-open={open ? "true" : undefined}
        inert={open ? undefined : true}
        aria-hidden={open ? undefined : true}
        className={cn(
          "s-presence-panel absolute top-full z-50 mt-3 origin-top flex-col",
          "rounded-site-lg border border-site-line bg-site-bg p-2 shadow-site-lg",
          align === "end" ? "end-0" : "start-0",
          childCount >= 2 ? "w-[min(32rem,calc(100vw-2rem))]" : "w-88",
        )}
      >
        <div
          className={cn(
            "grid gap-1",
            childCount >= 2 ? "sm:grid-cols-2" : "grid-cols-1",
          )}
        >
          {item.children!.map((child) => (
            <PanelRow
              key={child.href}
              child={child}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function MobileSection({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        prefetch={false}
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-between rounded-site-control px-3 py-3",
          "text-site-h4 font-semibold text-site-ink",
          "transition-colors duration-(--dur-settle) hover:bg-site-brand-tint hover:text-site-brand-deep",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <details className="group">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between rounded-site-control px-3 py-3",
          "text-site-h4 font-semibold text-site-ink",
          "[&::-webkit-details-marker]:hidden",
          "transition-colors duration-(--dur-settle) hover:bg-site-tint",
        )}
      >
        {item.label}
        <FiChevronDown
          aria-hidden
          className="size-4 text-site-muted transition-transform duration-(--dur-settle) ease-(--ease-settle) group-open:rotate-180 group-open:text-site-brand-deep"
        />
      </summary>
      <div className="flex flex-col gap-1 px-1 pb-2">
        {item.children!.map((child) => (
          <PanelRow key={child.href} child={child} onNavigate={onNavigate} />
        ))}
      </div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */

function useHeaderElevated() {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      setElevated(window.scrollY > 10);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return elevated;
}

/* -------------------------------------------------------------------------- */

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("header");
  const tHeader = useTranslations("Landing.header");
  const isLoggedIn = useAppSelector((state) => state.auth.loading === "yes");

  const navItems = useNavItems();
  const [open, setOpen] = useState(false);
  const elevated = useHeaderElevated();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* A route change must never leave the panel covering the new page. */
  const [panelPathname, setPanelPathname] = useState(pathname);
  if (panelPathname !== pathname) {
    setPanelPathname(pathname);
    setOpen(false);
  }

  const isItemActive = (item: NavItem) => {
    const paths = item.href
      ? [item.href]
      : (item.children ?? []).map((c) => c.href);
    return paths.some(
      (href) =>
        href.startsWith("/") && !href.includes("#") && pathname === href,
    );
  };

  return (
    <>
      <header className="s-site-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full max-w-(--s-max) px-(--s-gutter) pt-(--s-header-inset)">
          <div
            data-elevated={elevated ? "true" : undefined}
            className="s-site-nav relative flex h-(--s-header-bar) items-center gap-2 px-2.5 sm:px-3"
          >
            {/* Brand accent — hairline, matching ConsoleHeader language. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-site-brand/50 to-transparent"
            />

            <div className="relative z-10 flex shrink-0 items-center pe-1">
              <SiteLogo />
            </div>

            <nav
              aria-label={t("primaryNavigation")}
              className="absolute inset-y-0 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-0.5 lg:flex"
            >
              {navItems.map((item, index) =>
                item.children ? (
                  <DesktopDropdown
                    key={item.id}
                    item={item}
                    isActive={isItemActive(item)}
                    align={index >= navItems.length - 2 ? "end" : "start"}
                  />
                ) : (
                  <Link
                    key={item.id}
                    href={item.href!}
                    prefetch={false}
                    aria-current={isItemActive(item) ? "page" : undefined}
                    className={triggerClass(isItemActive(item))}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="relative z-10 ms-auto flex items-center gap-0.5">
              <div className="hidden items-center sm:flex">
                <HeaderSearch />
                <SiteThemeToggle />
                <SiteLanguageToggle locale={locale} pathname={pathname} />
              </div>

              {isLoggedIn ? (
                <div className="ms-1 flex items-center">
                  <UserDropDown />
                </div>
              ) : (
                <div className="ms-1 flex items-center gap-1.5">
                  <SiteButtonLink
                    href="/auth/login"
                    variant="ghost"
                    size="sm"
                    prefetch={false}
                    className="hidden sm:inline-flex"
                  >
                    {tHeader("signIn")}
                  </SiteButtonLink>
                  <SiteButtonLink
                    href="/auth/register"
                    variant="primary"
                    size="sm"
                    prefetch={false}
                  >
                    {tHeader("startNow")}
                  </SiteButtonLink>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="site-mobile-nav"
                aria-label={open ? t("closeMenu") : t("openMenu")}
                className={cn(
                  "ms-0.5 flex size-10 items-center justify-center rounded-full text-site-ink lg:hidden",
                  "transition-colors duration-(--dur-settle) hover:bg-site-brand-tint hover:text-site-brand-deep",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-brand/35",
                )}
              >
                {open ? (
                  <FiX className="size-5" aria-hidden />
                ) : (
                  <FiMenu className="size-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <button
        type="button"
        aria-label={t("closeMenu")}
        data-open={open ? "true" : undefined}
        tabIndex={open ? 0 : -1}
        className="s-presence-scrim fixed inset-0 z-60 bg-site-ink-bg/55 backdrop-blur-sm lg:hidden"
        onClick={close}
      />

      <div
        id="site-mobile-nav"
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-label={t("primaryNavigation")}
        data-sheet-side="start"
        data-open={open ? "true" : undefined}
        inert={open ? undefined : true}
        aria-hidden={open ? undefined : true}
        className={cn(
          "s-presence-drawer s-site-mobile-sheet fixed z-70 flex-col lg:hidden",
          "inset-y-3 start-3 w-[min(21rem,calc(100vw-1.5rem))]",
        )}
      >
        <div className="flex h-(--s-header-bar) shrink-0 items-center justify-between gap-3 border-b border-site-line/80 px-3">
          <SiteLogo onClick={close} />
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-site-ink",
              "transition-colors duration-(--dur-settle) hover:bg-site-brand-tint hover:text-site-brand-deep",
            )}
          >
            <FiX className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <nav aria-label={t("primaryNavigation")} className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <MobileSection key={item.id} item={item} onNavigate={close} />
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-center gap-1 rounded-site-control bg-site-tint/80 px-2 py-2">
            <HeaderSearch />
            <SiteThemeToggle />
            <SiteLanguageToggle locale={locale} pathname={pathname} />
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="shrink-0 border-t border-site-line/80 bg-site-bg/80 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col gap-2">
              <SiteButtonLink
                href="/auth/register"
                size="lg"
                block
                prefetch={false}
                onClick={close}
              >
                {tHeader("startNow")}
              </SiteButtonLink>
              <SiteButtonLink
                href="/auth/login"
                variant="secondary"
                size="lg"
                block
                prefetch={false}
                onClick={close}
              >
                {tHeader("signIn")}
              </SiteButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default SiteHeader;
