"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoOpenOutline, IoStorefrontOutline } from "react-icons/io5";
import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  Badge,
  ButtonLink,
  EmptyState,
  LoadingBlock,
  buttonClasses,
} from "@/components/ui";
import {
  useDashboardMenus,
  localizedMenuName,
} from "@/hooks/useDashboardMenus";
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import { useAuthorization } from "@/hooks/useAuthorization";

/** Staff-app roles that never open the menu dashboard. Both locales, since the
 * API returns the role name translated. */
const ROLES_WITHOUT_MENU_DASHBOARD = new Set([
  "ويتر",
  "محضر طعام",
  "ديلفري",
  "waiter",
  "food preparer",
  "delivery",
]);

/**
 * `/dashboard` for a staff member: the menus they hold a grant for. Creating,
 * deleting and grouping menus stay owner-only, so none of that is offered here.
 *
 * A staff member is granted a handful of menus and only ever does one of two
 * things with each — open it or preview it. So this is a ruled ledger rather
 * than a card grid: one row per grant, the public link set in mono beside the
 * name, and the two actions as a trailing button group. The previous version
 * gave every row two full-width filled bars, which made a list of five menus
 * ten equally loud buttons and no scannable column of names.
 */
export default function StaffMenusList() {
  const t = useTranslations("Menus");
  const locale = useLocale();
  const { roleName } = useAuthorization();
  const { menus, loading } = useDashboardMenus();

  const canManageMenu = !ROLES_WITHOUT_MENU_DASHBOARD.has(
    (roleName ?? "").trim().toLowerCase(),
  );

  if (loading) {
    return <LoadingBlock label={t("loading")} className="min-h-[40vh]" />;
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 pb-6">
      <PageTitleWithHelp
        className="menus-page-header"
        title={t("title")}
        description={t("assignedMenusSubtitle")}
      />

      {menus.length === 0 ? (
        <EmptyState
          icon={<IoStorefrontOutline />}
          title={t("noMenus")}
          description={t("noAssignedMenus")}
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {menus.map((menu) => {
            const name = localizedMenuName(menu, locale);
            const publicUrl = publicMenuLinkUrl(
              resolvePublicMenuSlug(menu.slug, menu.id),
            );
            return (
              <li
                key={menu.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-3 py-2.5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface-2">
                  {menu.logo ? (
                    <LoadImage
                      src={menu.logo}
                      alt=""
                      className="size-full object-contain"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <IoStorefrontOutline
                      className="size-4 text-fg-subtle"
                      aria-hidden
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[13px] font-semibold text-fg">
                    {name}
                  </h2>
                  {publicUrl ? (
                    <p
                      className="ui-figure mt-0.5 truncate text-[11px] text-fg-muted"
                      dir="ltr"
                    >
                      {publicUrl.replace(/^\/\//, "")}
                    </p>
                  ) : null}
                </div>

                <Badge tone={menu.isActive ? "success" : "warning"} dot>
                  {menu.isActive
                    ? t("menuCard.active")
                    : t("menuCard.inactive")}
                </Badge>

                <div className="flex shrink-0 items-center gap-1.5">
                  {canManageMenu && (
                    /* `LinkTo` rather than `ButtonLink`: this href is built from
                       the raw uuid/id and needs the locale-aware normalisation
                       that wrapper does. */
                    <LinkTo
                      href={`/dashboard/${menu.uuid || menu.id}`}
                      className={buttonClasses({ size: "sm" })}
                    >
                      {t("menuCard.manage")}
                    </LinkTo>
                  )}
                  {publicUrl && (
                    <ButtonLink
                      href={publicUrl}
                      external
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      size="sm"
                      startIcon={<IoOpenOutline className="size-3.5" />}
                    >
                      {t("menuCard.preview")}
                    </ButtonLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
