"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoOpenOutline, IoStorefrontOutline } from "react-icons/io5";
import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
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
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 sm:min-h-[60vh]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="font-medium text-fg-subtle">{t("loading")}</p>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/5">
          <IoStorefrontOutline className="text-6xl text-primary" />
        </div>
        <p className="max-w-md text-center text-fg-subtle">
          {t("noAssignedMenus")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="menus-page-header mb-5 text-start sm:mb-8">
        <PageTitleWithHelp>
          <h1 className="text-xl font-bold text-fg sm:text-3xl">
            {t("title")}
          </h1>
        </PageTitleWithHelp>
        <p className="mt-0.5 text-sm text-fg-subtle sm:mt-1 dark:text-fg-subtle">
          {t("assignedMenusSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {menus.map((menu) => {
          const name = localizedMenuName(menu, locale);
          const publicUrl = publicMenuLinkUrl(
            resolvePublicMenuSlug(menu.slug, menu.id),
          );
          return (
            <article
              key={menu.id}
              className="flex flex-col gap-4 rounded-lg border border-line bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-line/80"
            >
              <div className="flex items-center gap-3">
                {menu.logo ? (
                  <LoadImage
                    src={menu.logo}
                    alt={name}
                    className="size-12 rounded-lg"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                    {name.charAt(0)}
                  </span>
                )}
                <h2 className="min-w-0 flex-1 truncate text-base font-bold text-fg">
                  {name}
                </h2>
              </div>

              <div className="mt-auto flex items-center gap-2">
                {canManageMenu && (
                  <LinkTo
                    href={`/dashboard/${menu.uuid || menu.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    {t("menuCard.manage")}
                  </LinkTo>
                )}
                {publicUrl && (
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-fg-muted transition-colors hover:bg-slate-50   dark:hover:bg-slate-700/50 ${
                      canManageMenu ? "" : "flex-1"
                    }`}
                  >
                    <IoOpenOutline className="text-base" aria-hidden />
                    {t("menuCard.preview")}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
