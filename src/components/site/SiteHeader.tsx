"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
 * Public header.
 *
 * Four top-level destinations, three of which open a described panel rather
 * than a bare link list — a first-time visitor cannot tell "Staff App" from
 * "Owner App" by name alone, so the panel says what each one is. The header is
 * transparent over the hero and gains its surface on scroll, which is the one
 * piece of chrome the visitor sees on every page.
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

const triggerClass =
  "flex h-9 items-center gap-1 rounded-site-control px-3 text-site-sm font-medium " +
  "text-site-fg transition-colors duration-150 hover:bg-site-tint hover:text-site-ink";

/* -------------------------------------------------------------------------- */

function DesktopDropdown({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

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
        className={cn(
          triggerClass,
          (open || isActive) && "bg-site-tint text-site-ink",
        )}
      >
        {item.label}
        <FiChevronDown
          aria-hidden
          className={cn(
            "size-3.5 text-site-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className={cn(
            "absolute top-[calc(100%+8px)] z-50 w-[22rem] origin-top overflow-hidden",
            "rounded-site-card border border-site-line bg-site-bg p-2 shadow-site-lg",
            "motion-safe:animate-[s-reveal-soft_160ms_cubic-bezier(0.16,1,0.3,1)]",
            "start-0",
          )}
        >
          {item.children!.map((child) => (
            <SiteNavLink
              key={child.href}
              href={child.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="group flex items-start gap-3 rounded-site-control p-3 transition-colors hover:bg-site-tint"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-site-sm bg-site-brand-tint text-site-brand transition-colors group-hover:bg-site-brand group-hover:text-white">
                <child.icon className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-site-sm font-semibold text-site-ink">
                  {child.label}
                </span>
                <span className="mt-0.5 block text-site-xs text-site-muted">
                  {child.description}
                </span>
              </span>
            </SiteNavLink>
          ))}
        </div>
      ) : null}
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
        className="flex items-center justify-between rounded-site-control px-3 py-3.5 text-site-h4 font-semibold text-site-ink transition-colors hover:bg-site-tint"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <details className="group border-b border-site-line last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3.5 text-site-h4 font-semibold text-site-ink [&::-webkit-details-marker]:hidden">
        {item.label}
        <FiChevronDown
          aria-hidden
          className="size-4 text-site-muted transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pb-2">
        {item.children!.map((child) => (
          <SiteNavLink
            key={child.href}
            href={child.href}
            prefetch={false}
            onClick={onNavigate}
            className="flex items-start gap-3 rounded-site-control px-3 py-2.5 transition-colors hover:bg-site-tint"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-site-sm bg-site-brand-tint text-site-brand">
              <child.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-site-sm font-semibold text-site-ink">
                {child.label}
              </span>
              <span className="block text-site-xs text-site-muted">
                {child.description}
              </span>
            </span>
          </SiteNavLink>
        ))}
      </div>
    </details>
  );
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
  const [scrolled, setScrolled] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  /* A route change must never leave the panel covering the new page. Adjusted
     during render rather than in an effect, so the new page never paints once
     with the old panel still over it. */
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
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || open
            ? "border-b border-site-line bg-site-bg/85 backdrop-blur-xl"
            : "border-b border-transparent bg-site-bg/0",
        )}
      >
        <div className="mx-auto flex h-(--s-header-h) w-full max-w-(--s-max) items-center gap-3 px-(--s-gutter)">
          <SiteLogo />

          <nav
            aria-label={t("primaryNavigation")}
            className="hidden flex-1 items-center gap-0.5 ps-4 lg:flex"
          >
            {navItems.map((item) =>
              item.children ? (
                <DesktopDropdown
                  key={item.id}
                  item={item}
                  isActive={isItemActive(item)}
                />
              ) : (
                <Link
                  key={item.id}
                  href={item.href!}
                  prefetch={false}
                  aria-current={isItemActive(item) ? "page" : undefined}
                  className={cn(
                    triggerClass,
                    isItemActive(item) && "bg-site-tint text-site-ink",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            <HeaderSearch />
            <div className="hidden items-center gap-1 sm:flex">
              <SiteThemeToggle />
              <SiteLanguageToggle locale={locale} pathname={pathname} />
            </div>

            {isLoggedIn ? (
              <div className="ms-1">
                <UserDropDown />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
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
              className="flex size-10 items-center justify-center rounded-site-control text-site-ink transition-colors hover:bg-site-tint lg:hidden"
            >
              {open ? (
                <FiX className="size-5" aria-hidden />
              ) : (
                <FiMenu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Side drawer — kept outside the header so backdrop-filter on the bar
          cannot become its containing block. Slides in from the inline start
          (left in LTR, right in RTL). */}
      {open ? (
        <>
          <button
            type="button"
            aria-label={t("closeMenu")}
            className="fixed inset-0 z-[60] bg-site-ink/45 lg:hidden"
            onClick={close}
          />
          <div
            id="site-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t("primaryNavigation")}
            data-sheet-side="start"
            className="fixed inset-y-0 start-0 z-[70] flex w-[min(20.5rem,88vw)] flex-col bg-site-bg shadow-site-lg motion-safe:animate-[ui-slide-in-inline_280ms_cubic-bezier(0.16,1,0.3,1)] lg:hidden"
          >
            <div className="flex h-(--s-header-h) shrink-0 items-center justify-between gap-3 border-b border-site-line px-4">
              <SiteLogo onClick={close} />
              <button
                type="button"
                onClick={close}
                aria-label={t("closeMenu")}
                className="flex size-10 items-center justify-center rounded-site-control text-site-ink transition-colors hover:bg-site-tint"
              >
                <FiX className="size-5" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex min-h-full flex-col">
                <nav
                  aria-label={t("primaryNavigation")}
                  className="flex flex-col"
                >
                  {navItems.map((item) => (
                    <MobileSection
                      key={item.id}
                      item={item}
                      onNavigate={close}
                    />
                  ))}
                </nav>

                {!isLoggedIn ? (
                  <div className="mt-6 flex flex-col gap-2.5">
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
                ) : null}

                <div className="mt-auto flex items-center justify-center gap-2 border-t border-site-line pt-5 pb-2">
                  <HeaderSearch />
                  <SiteThemeToggle />
                  <SiteLanguageToggle locale={locale} pathname={pathname} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default SiteHeader;
