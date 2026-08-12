"use client";

import { useLayoutEffect, useRef } from "react";
import { FiChevronsLeft, FiChevronsRight, FiMenu } from "react-icons/fi";
import UserDropDown from "../UserDropDown";
import { Logo } from "../Global/Logo";
import LanguageToggle from "../Global/LanguageTogle";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import DarkModeToggle from "../Global/DarkModeToggle";
import NotificationBell from "@/components/Dashboard/NotificationBell";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveConsoleTrail, type ConsoleScope } from "@/lib/consoleNav";
import ConsoleBreadcrumbs from "./ConsoleBreadcrumbs";
import CommandTrigger from "./CommandTrigger";
import { useConsolePageMeta } from "./ConsoleChromeContext";
import { cn } from "@/lib/cn";

/**
 * Console chrome — two-level sticky header.
 *
 * Utility row: navigation triggers, ancestry trail, command palette, account
 * tools. Context row: the page title (and optional description / actions)
 * owned by the current route via `PageHeader` → `ConsoleChromeContext`.
 *
 * Keeping both rows in one sticky element means the shell answers "where am I"
 * and "what can I do here" without a second header competing inside the page.
 * The rail and this bar share `bg-surface` + `border-line` so they read as one
 * Admin frame rather than a floating toolbar parked on content.
 */
export function ConsoleHeader({
  setIsMenuOpen,
  onToggleRail,
  railCollapsed,
  scope,
  venueRef,
  isAdmin,
  hideSidebar,
  hasSidebar,
  onOpenCommand,
}: {
  setIsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onToggleRail: () => void;
  railCollapsed: boolean;
  scope: ConsoleScope;
  venueRef: string | null;
  isAdmin?: boolean;
  hideSidebar?: boolean;
  hasSidebar?: boolean;
  onOpenCommand: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const menu = useAppSelector((state) => state.menuData.menu);
  const pageMeta = useConsolePageMeta();
  const headerRef = useRef<HTMLElement>(null);

  const showNav = (venueRef || isAdmin || hasSidebar) && !hideSidebar;

  const venueName =
    !isAdmin && menu
      ? ((locale === "ar" ? menu.nameAr : menu.nameEn) ?? undefined)
      : undefined;

  const crumbs = resolveConsoleTrail({
    pathname,
    scope,
    venueRef,
    venueName,
    t,
  });

  const fallbackTitle =
    crumbs.length > 0 ? crumbs[crumbs.length - 1]?.label : null;
  const title = pageMeta?.title ?? fallbackTitle;
  const description = pageMeta?.description;
  const actions = pageMeta?.actions;
  const meta = pageMeta?.meta;
  const eyebrow = pageMeta?.eyebrow;
  const titleId = pageMeta?.anchorId;

  /* Gated shells (suspended / incomplete profile) keep a minimal utility bar
     with the logo — a page-context row would invent a destination that is not
     actually available. */
  const hasContext =
    !hideSidebar &&
    (Boolean(title) ||
      Boolean(description) ||
      Boolean(actions) ||
      Boolean(meta));

  /* Sticky toolbars and table headers offset by `--console-header-h`. Measuring
     the live bar keeps those offsets honest when the context row wraps or
     collapses on narrow viewports. */
  useLayoutEffect(() => {
    const node = headerRef.current;
    const shell = node?.closest(".console-shell") as HTMLElement | null;
    if (!node || !shell) return;

    const sync = () => {
      shell.style.setProperty(
        "--console-header-h",
        `${Math.ceil(node.getBoundingClientRect().height)}px`,
      );
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [hasContext, title, description, actions]);

  return (
    <header
      ref={headerRef}
      className="dashboard-header console-header relative z-30 border-b border-line bg-surface"
    >
      {/* Brand accent — a single hairline, not a purple bar fill. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/55 to-transparent"
      />

      <div className="console-header__util">
        <div className="console-header__leading">
          {showNav ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
                className="-ms-1 lg:hidden"
                aria-label={tCommon("openMenu")}
              >
                <FiMenu className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={onToggleRail}
                className="-ms-1 hidden lg:inline-flex"
                aria-label={railCollapsed ? t("railExpand") : t("railCollapse")}
                aria-pressed={railCollapsed}
              >
                {railCollapsed ? (
                  <FiChevronsRight className="size-4 rtl:hidden" />
                ) : (
                  <FiChevronsLeft className="size-4 rtl:hidden" />
                )}
                {railCollapsed ? (
                  <FiChevronsLeft className="hidden size-4 rtl:block" />
                ) : (
                  <FiChevronsRight className="hidden size-4 rtl:block" />
                )}
              </Button>
            </>
          ) : null}

          {hideSidebar ? (
            <Logo size="header" className="dashboard-header__logo max-h-8" />
          ) : (
            <>
              <ScopeMark scope={scope} venueName={venueName} />
              <div className="hidden min-w-0 md:block">
                <ConsoleBreadcrumbs
                  crumbs={crumbs}
                  label={tCommon("breadcrumb")}
                  mode="ancestry"
                />
              </div>
            </>
          )}
        </div>

        {/*
          On small screens this end cluster keeps search + utilities together.
          From `md` up, `display: contents` lets center/trailing become the
          middle and end columns of the three-column utility grid.
        */}
        <div className="console-header__end">
          <div className="console-header__center">
            <CommandTrigger onOpen={onOpenCommand} />
          </div>

          <div className="console-header__trailing">
            <div className="console-header__tools">
              <NotificationBell segment={venueRef} />
              <div className="hidden sm:contents">
                <DarkModeToggle />
                <LanguageToggle locale={locale} pathname={pathname} />
              </div>
            </div>
            <div className="console-header__divider" aria-hidden />
            <UserDropDown />
          </div>
        </div>
      </div>

      {hasContext ? (
        <div className="console-header__context">
          <div className="console-header__identity min-w-0">
            {eyebrow ? (
              <p className="ui-eyebrow mb-1 text-brand-soft-fg">{eyebrow}</p>
            ) : null}

            {/* Mobile: ancestry collapses; the title is the location signal. */}
            {!hideSidebar ? (
              <div className="mb-1 sm:hidden">
                <ConsoleBreadcrumbs
                  crumbs={crumbs}
                  label={tCommon("breadcrumb")}
                  mode="ancestry"
                />
              </div>
            ) : null}

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {title ? (
                <h1
                  id={titleId}
                  className="console-header__title truncate"
                >
                  {title}
                </h1>
              ) : null}
              {meta}
            </div>

            {description ? (
              <p className="console-header__description mt-1 hidden max-w-2xl md:block">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="console-header__actions">{actions}</div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function ScopeMark({
  scope,
  venueName,
}: {
  scope: ConsoleScope;
  venueName?: string;
}) {
  const t = useTranslations("Dashboard");

  let label: string;
  if (scope === "admin") label = t("navAdminConsole");
  else if (scope === "venue") label = venueName || t("navZoneVenue");
  else label = t("navZoneAccount");

  return (
    <span
      className={cn(
        "inline-flex max-w-40 shrink-0 items-center gap-1.5 truncate rounded-md",
        "bg-brand-soft px-2 py-1 text-[11px] font-semibold tracking-[-0.01em] text-brand-soft-fg",
        "lg:max-w-56",
      )}
      title={label}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_18%,transparent)]"
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

export default ConsoleHeader;
