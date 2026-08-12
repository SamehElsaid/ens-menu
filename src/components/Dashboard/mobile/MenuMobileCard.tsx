"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";

import { Menu } from "@/types/Menu";
import type { MenuGroupMeta } from "@/lib/menuDeliveryGroups";
import { cn } from "@/lib/cn";
import {
  Button,
  ButtonLink,
  buttonClasses,
  Card,
  CardFooter,
  Menu as DropdownMenu,
  MenuItem,
  MenuSeparator,
} from "@/components/ui";
import {
  IoEllipsisHorizontal,
  IoEyeOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoRestaurant,
  IoSettingsOutline,
  IoTrashOutline,
  IoGitNetworkOutline,
  IoRemoveCircleOutline,
  IoCopyOutline,
} from "react-icons/io5";

export type MenuMobileCardProps = {
  menu: Menu;
  menuName: string;
  description?: string;
  locale: string;
  formatDate: (dateStr: string) => string;
  isFirst: boolean;
  togglingId: number | null;
  menuPublicUrl: string;
  dashboardPath: string;
  groupMeta: MenuGroupMeta;
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onCopy?: (menu: Menu) => void;
  onAddToGroup?: (menu: Menu) => void;
  onRemoveFromGroup?: (menu: Menu) => void;
};

/**
 * One menu, phone width.
 *
 * The previous version put five competing controls on the card: three coloured
 * icon squares in the header and up to two full-width group buttons above the
 * footer, so pausing and deleting a venue were as prominent as opening it. It
 * now matches `MenuDashboardCard` — Manage and Preview are the card's two
 * actions, everything rarer sits behind the overflow menu, and the dates and
 * public URL are ruled ticket rows instead of a four-cell grid of captions.
 */
export default function MenuMobileCard({
  menu,
  menuName,
  description,
  locale,
  formatDate,
  isFirst,
  togglingId,
  menuPublicUrl,
  dashboardPath,
  groupMeta,
  onToggleActive,
  onDelete,
  onCopy,
  onAddToGroup,
  onRemoveFromGroup,
}: MenuMobileCardProps) {
  const t = useTranslations("Menus");
  const isToggling = togglingId === menu.id;

  const metadata = [
    menu.createdAt
      ? {
          id: "created",
          label: t("menuCard.createdAt"),
          value: formatDate(menu.createdAt),
        }
      : null,
    menu.updatedAt
      ? {
          id: "updated",
          label: t("menuCard.updatedAt"),
          value: formatDate(menu.updatedAt),
        }
      : null,
  ].filter((row): row is { id: string; label: string; value: string } =>
    Boolean(row),
  );

  return (
    <Card
      as="article"
      padded="md"
      className={cn(
        "dashboard-menu-card flex flex-col",
        !menu.isActive && "bg-surface-2/40",
        groupMeta.inGroup && "border-brand-line",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface-2">
          {menu.logo ? (
            <LoadImage
              src={menu.logo}
              alt=""
              className="size-full object-cover"
              width={44}
              height={44}
            />
          ) : (
            <IoRestaurant className="size-4.5 text-fg-subtle" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm font-semibold text-fg"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={menuName}
          >
            {menuName}
          </h3>
          {/* State as a ticket line, not a filled pill: a phone shows three
              venues at a time and the one that is paused has to be findable
              without every card shouting. */}
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="ui-label inline-flex shrink-0 items-center gap-1.5 text-fg-muted">
              <span
                aria-hidden
                className={
                  menu.isActive
                    ? "size-1.5 rounded-full bg-success"
                    : "size-1.5 rounded-full bg-warning"
                }
              />
              {menu.isActive ? t("menuCard.active") : t("menuCard.paused")}
            </span>
            {groupMeta.inGroup && groupMeta.groupName ? (
              <span className="ui-label inline-flex min-w-0 items-center gap-1 rounded-sm border border-brand-line px-1.5 py-px text-brand-soft-fg">
                <IoGitNetworkOutline className="shrink-0" aria-hidden />
                <span className="truncate">{groupMeta.groupName}</span>
              </span>
            ) : null}
          </div>
        </div>

        <DropdownMenu
          label={menuName}
          trigger={(props) => (
            <Button
              {...props}
              type="button"
              variant="ghost"
              iconOnly
              aria-label={menuName}
            >
              <IoEllipsisHorizontal className="size-4" />
            </Button>
          )}
        >
          <MenuItem
            icon={menu.isActive ? <IoPauseOutline /> : <IoPlayOutline />}
            onClick={() => onToggleActive(menu)}
            disabled={isToggling}
          >
            {menu.isActive ? t("menuCard.pause") : t("menuCard.play")}
          </MenuItem>
          {onCopy ? (
            <MenuItem icon={<IoCopyOutline />} onClick={() => onCopy(menu)}>
              {t("menuCard.copyMenu")}
            </MenuItem>
          ) : null}
          {!groupMeta.inGroup && onAddToGroup ? (
            <MenuItem
              icon={<IoGitNetworkOutline />}
              onClick={() => onAddToGroup(menu)}
            >
              {t("menuCard.addToGroup")}
            </MenuItem>
          ) : null}
          {groupMeta.inGroup && onRemoveFromGroup ? (
            <MenuItem
              icon={<IoRemoveCircleOutline />}
              onClick={() => onRemoveFromGroup(menu)}
            >
              {t("menuCard.removeFromGroup")}
            </MenuItem>
          ) : null}
          <MenuSeparator />
          <MenuItem
            icon={<IoTrashOutline />}
            tone="danger"
            onClick={() => onDelete(menu)}
          >
            {t("deleteMenu")}
          </MenuItem>
        </DropdownMenu>
      </div>

      {description ? (
        <p className="mt-2 line-clamp-2 text-xs text-fg-muted">{description}</p>
      ) : null}

      <dl className="mt-3 border-t border-line text-xs">
        {metadata.map((row) => (
          <div
            key={row.id}
            className="flex items-baseline justify-between gap-3 border-b border-line py-1.5"
          >
            <dt className="ui-label shrink-0">{row.label}</dt>
            <dd
              className="truncate font-mono text-[11px] text-fg-muted"
              data-numeric
            >
              {row.value}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 py-1.5">
          <dt className="ui-label shrink-0">{t("menuCard.slug")}</dt>
          <dd
            className="min-w-0 truncate font-mono text-[11px] text-fg-muted"
            dir="ltr"
            title={menuPublicUrl}
          >
            {menuPublicUrl.replace(/^\/\//, "")}
          </dd>
        </div>
      </dl>

      <div className="flex-1" />

      <CardFooter>
        {/* `LinkTo` rather than `ButtonLink`: it normalises the dashboard path
            and keeps the same-route refresh behaviour the menu list relies on. */}
        <LinkTo
          id={isFirst ? "onboarding-manage-menu" : undefined}
          href={dashboardPath}
          className={buttonClasses({ className: "flex-1" })}
        >
          <IoSettingsOutline className="size-3.5" aria-hidden />
          {t("menuCard.manage")}
        </LinkTo>
        <ButtonLink
          href={menuPublicUrl}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          startIcon={<IoEyeOutline className="size-3.5" />}
        >
          {t("menuCard.preview")}
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
