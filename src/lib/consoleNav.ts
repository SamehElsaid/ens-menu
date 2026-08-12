import {
  accountNavSections,
  adminNavSections,
  venueNavSections,
  type NavItem,
  type NavSection,
} from "@/components/Dashboard/data";

/**
 * Console navigation resolver — CONSOLE-REDESIGN.md §2, §3.
 *
 * One module answers three questions that used to be answered in three places
 * and disagreed with each other: what does the rail show, what does the
 * breadcrumb trail say, and what can the command palette reach. They all read
 * the same section data through here, so a route added to `data.ts` appears in
 * all three without further edits.
 */

export type ConsoleScope = "venue" | "account" | "admin";

/** Section id → translation key in the `Dashboard` namespace. */
export const SECTION_LABEL: Record<string, string> = {
  venueOverview: "navSectionOverview",
  venueMenu: "navSectionMenu",
  venueSettings: "navSectionSettings",
  venueActivity: "navSectionActivity",
  /* The account zone carries its own heading, so its single group has none. */
  accountMain: "",
  adminOverview: "navSectionOverview",
  adminCustomers: "navSectionCustomers",
  adminRevenue: "navSectionRevenue",
  adminContent: "navSectionContent",
  adminPlatform: "navSectionPlatform",
};

export const SCOPE_LABEL: Record<ConsoleScope, string> = {
  venue: "commandScopeVenue",
  account: "commandScopeAccount",
  admin: "commandScopeAdmin",
};

export function sectionsForScope(scope: ConsoleScope): NavSection[] {
  if (scope === "admin") return adminNavSections;
  if (scope === "account") return accountNavSections;
  return venueNavSections;
}

/**
 * Build the href for a nav item.
 *
 * `venueRef` is the menu's uuid (or numeric id) as it appears in the URL. A
 * venue item without a ref has nowhere to point, so callers must treat the
 * venue zone as unavailable rather than linking into `/dashboard/null/...`.
 */
export function navItemHref(
  scope: ConsoleScope,
  link: string,
  venueRef?: string | null,
): string | null {
  if (scope === "admin") return link ? `/admin/${link}` : "/admin";
  if (scope === "account") return link ? `/dashboard/${link}` : "/dashboard";
  if (!venueRef) return null;
  return link ? `/dashboard/${venueRef}/${link}` : `/dashboard/${venueRef}`;
}

/**
 * Is this item the current page?
 *
 * Prefix matching is what lets `/settings/design/{tempSlug}` keep Design lit;
 * `exactMatch` is what stops the settings root claiming its own children.
 */
export function isNavItemActive(
  pathname: string,
  href: string,
  exactMatch?: boolean,
): boolean {
  if (pathname === href || pathname === `${href}/`) return true;
  if (exactMatch) return false;
  return pathname.startsWith(`${href}/`);
}

export type ConsoleDestination = {
  id: string;
  scope: ConsoleScope;
  sectionId: string;
  sectionLabel: string;
  item: NavItem;
  href: string;
};

/**
 * Flatten every destination the signed-in user can reach, for the command
 * palette. Filtering is the caller's job — it holds the permission hooks — but
 * ordering is fixed here so the palette's list order matches the rail's.
 */
export function collectDestinations(
  scopes: ConsoleScope[],
  venueRef?: string | null,
): ConsoleDestination[] {
  const out: ConsoleDestination[] = [];

  for (const scope of scopes) {
    for (const section of sectionsForScope(scope)) {
      const sectionLabel = SECTION_LABEL[section.id] ?? "";
      for (const item of section.items) {
        if (item.comingSoon) continue;
        const href = navItemHref(scope, item.link ?? "", venueRef);
        if (!href) continue;
        out.push({
          id: `${scope}:${item.key ?? item.label}`,
          scope,
          sectionId: section.id,
          sectionLabel,
          item,
          href,
        });
      }
    }
  }

  return out;
}

/** Route segments that sit directly under `/dashboard` and are not menu refs. */
export const ACCOUNT_SEGMENTS = new Set(
  accountNavSections
    .flatMap((section) => section.items)
    .map((item) => item.link ?? "")
    .filter(Boolean),
);

export type ConsoleCrumb = {
  /** Pre-translated label. */
  label: string;
  href?: string;
};

/**
 * Resolve the breadcrumb trail for a console route.
 *
 * The trail is structural: root, then the group the page belongs to, then the
 * page. The group is deliberately not a link — it names a region of the rail,
 * not a page — which is honest about the fact that `Revenue` has no URL.
 *
 * `leaf` lets a detail page contribute its own final crumb (a customer's name,
 * say) without this module needing to know how to fetch one.
 */
export function resolveConsoleTrail(options: {
  pathname: string;
  scope: ConsoleScope;
  venueRef?: string | null;
  venueName?: string;
  leaf?: string;
  t: (key: string) => string;
}): ConsoleCrumb[] {
  const { pathname, scope, venueRef, venueName, leaf, t } = options;
  const crumbs: ConsoleCrumb[] = [];

  if (scope === "admin") {
    crumbs.push({ label: t("navAdminConsole"), href: "/admin" });
  } else if (scope === "venue" && venueRef) {
    crumbs.push({ label: t("myMenus"), href: "/dashboard" });
    crumbs.push({
      label: venueName || t("navZoneVenue"),
      href: `/dashboard/${venueRef}`,
    });
  } else {
    crumbs.push({ label: t("myMenus"), href: "/dashboard" });
  }

  const match = matchDestination(pathname, scope, venueRef);

  if (match) {
    const sectionLabel = SECTION_LABEL[match.sectionId];
    const isRoot = (match.item.link ?? "") === "";

    // The root of a scope is already named by the first crumb; repeating it as
    // "Admin console › Overview › Overview" adds a level and no information.
    if (!isRoot) {
      if (sectionLabel) crumbs.push({ label: t(sectionLabel) });
      crumbs.push({
        label: t(match.item.label),
        href: leaf ? match.href : undefined,
      });
    }
  }

  if (leaf) crumbs.push({ label: leaf });

  return crumbs;
}

/** The deepest nav item whose href prefixes `pathname`. */
export function matchDestination(
  pathname: string,
  scope: ConsoleScope,
  venueRef?: string | null,
): ConsoleDestination | null {
  let best: ConsoleDestination | null = null;

  for (const destination of collectDestinations([scope], venueRef)) {
    const { href, item } = destination;
    if (!isNavItemActive(pathname, href, item.exactMatch)) continue;
    if (!best || href.length > best.href.length) best = destination;
  }

  return best;
}
