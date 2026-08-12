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
 * Three things it commits to:
 *
 * 1. **It is always there, at one weight.** No transparent-over-hero state that
 *    fades in on scroll: the one piece of chrome present on every page never
 *    changes appearance under the visitor, and no scroll listener is needed to
 *    keep that promise. A translucent ground with a blur is enough to separate
 *    it from content moving underneath.
 * 2. **"Where I am" and "where the pointer is" look different.** The current
 *    section is a brand-tinted pill with brand type; hover is a neutral tint.
 *    Two different colours, so the two states are never mistaken for each other.
 * 3. **The mobile panel is a full-height sheet with the action pinned to the
 *    bottom**, above the safe area, so the primary CTA is under the thumb
 *    rather than at the end of a scroll.
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

/**
 * Nav triggers are pills that sit inside the bar rather than spanning its full
 * height. Centred controls with air around them read as software; edge-to-edge
 * dividers read as a toolbar, and this bar carries only six things.
 */
const triggerBase =
  "relative flex h-9 items-center gap-1 rounded-full px-3.5 text-site-sm font-medium " +
  "transition-colors duration-(--dur-settle)";

/* Two complete states rather than a base plus overrides: `cn` is a plain join,
   so two competing `bg-*` utilities on one element would be resolved by
   stylesheet order instead of by intent. */
const triggerIdle = "text-site-fg hover:bg-site-tint hover:text-site-ink";
const triggerActive = "bg-site-brand-tint text-site-brand-deep";

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
      className="group flex items-start gap-3.5 rounded-site-control px-3 py-3 transition-colors hover:bg-site-brand-tint"
    >
      {/* The icon sits in a medallion that lights up on hover: it is the only
          coloured thing in the row, so it reads as the row being the target
          rather than as decoration beside the label. */}
      <span className="mt-px flex size-9 shrink-0 items-center justify-center rounded-site-control border border-site-line bg-site-ground text-site-muted transition-colors group-hover:border-transparent group-hover:bg-site-brand group-hover:text-white">
        <child.icon className="size-[17px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-site-sm font-semibold text-site-ink transition-colors group-hover:text-site-brand-deep">
          {child.label}
        </span>
        <span className="mt-1 block text-site-xs leading-relaxed text-site-muted">
          {child.description}
        </span>
      </span>
    </SiteNavLink>
  );
}

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
      className="relative h-full"
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
            open && "rotate-180",
          )}
        />
      </button>

      {/* Kept mounted so `data-open` can drive a real exit (M3). `inert` while
          closed keeps the panel out of the tab order during and after the fade. */}
      <div
        id={panelId}
        data-open={open ? "true" : undefined}
        inert={open ? undefined : true}
        aria-hidden={open ? undefined : true}
        className={cn(
          "s-presence-panel absolute top-full z-50 mt-2 w-[24rem] origin-top flex-col gap-1",
          "rounded-site-lg border border-site-line bg-site-bg p-2 shadow-site-lg",
          "start-0",
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
        className="flex items-center justify-between border-b border-site-line px-4 py-4 text-site-h4 font-semibold text-site-ink transition-colors hover:bg-site-tint"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <details className="group border-b border-site-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-site-h4 font-semibold text-site-ink [&::-webkit-details-marker]:hidden">
        {item.label}
        <FiChevronDown
          aria-hidden
          className="size-4 text-site-muted transition-transform duration-(--dur-settle) ease-(--ease-settle) group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-1 px-2 pb-3">
        {item.children!.map((child) => (
          <PanelRow key={child.href} child={child} onNavigate={onNavigate} />
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-site-line/70 bg-site-ground/85 backdrop-blur-xl">
        <div className="mx-auto flex h-(--s-header-h) w-full max-w-(--s-max) items-center gap-2 px-(--s-gutter)">
          <div className="flex shrink-0 items-center pe-2">
            <SiteLogo />
          </div>

          <nav
            aria-label={t("primaryNavigation")}
            className="hidden flex-1 items-center gap-1 lg:flex"
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
                  className={triggerClass(isItemActive(item))}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            <div className="flex items-center">
              <HeaderSearch />
              <div className="hidden items-center sm:flex">
                <SiteThemeToggle />
                <SiteLanguageToggle locale={locale} pathname={pathname} />
              </div>
            </div>

            {isLoggedIn ? (
              <div className="ms-2 flex items-center">
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
              className="ms-1 flex size-10 items-center justify-center rounded-full text-site-ink transition-colors hover:bg-site-tint lg:hidden"
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

      {/* Side drawer — outside the header so backdrop-filter cannot become its
          containing block. Kept mounted for a real exit (M4); `inert` while
          closed. Hidden from `lg` up via the same class that gated the old
          unmount, so desktop never pays for the drawer visually. */}
      <button
        type="button"
        aria-label={t("closeMenu")}
        data-open={open ? "true" : undefined}
        tabIndex={open ? 0 : -1}
        className="s-presence-scrim fixed inset-0 z-[60] bg-site-ink-bg/55 backdrop-blur-sm lg:hidden"
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
        className="s-presence-drawer fixed inset-y-0 start-0 z-[70] w-[min(21rem,90vw)] flex-col bg-site-ground shadow-site-lg lg:hidden"
      >
        <div className="flex h-(--s-header-h) shrink-0 items-center justify-between gap-3 border-b border-site-line px-4">
          <SiteLogo onClick={close} />
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="flex size-10 items-center justify-center rounded-full text-site-ink transition-colors hover:bg-site-tint"
          >
            <FiX className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <nav
            aria-label={t("primaryNavigation")}
            className="flex flex-col"
          >
            {navItems.map((item) => (
              <MobileSection key={item.id} item={item} onNavigate={close} />
            ))}
          </nav>

          <div className="flex items-center justify-center gap-1 px-4 py-5">
            <HeaderSearch />
            <SiteThemeToggle />
            <SiteLanguageToggle locale={locale} pathname={pathname} />
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="shrink-0 border-t border-site-line bg-site-bg px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
