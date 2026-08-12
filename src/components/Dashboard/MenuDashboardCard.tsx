"use client";

import LoadImage from "@/components/ImageLoad";

import { menuDashboardPath } from "@/lib/menuDashboardPath";
import type { MenuGroupMeta } from "@/lib/menuDeliveryGroups";
import type { Menu } from "@/types/Menu";
import { cn } from "@/lib/cn";
import {
  Button,
  ButtonLink,
  Card,
  CardFooter,
  Menu as DropdownMenu,
  MenuItem,
  MenuSeparator,
} from "@/components/ui";
import {
  IoEyeOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoRestaurant,
  IoTrashOutline,
  IoGitNetworkOutline,
  IoRemoveCircleOutline,
  IoCopyOutline,
  IoEllipsisHorizontal,
} from "react-icons/io5";

export type MenuDashboardCardProps = {
  menu: Menu;
  menuName: string;
  description?: string;
  formatDate: (dateStr: string) => string;
  togglingId: number | null;
  menuPublicUrl: string;
  groupMeta: MenuGroupMeta;
  manageLinkId?: string;
  labels: {
    active: string;
    paused: string;
    pause: string;
    play: string;
    deleteMenu: string;
    copyMenu: string;
    createdAt: string;
    updatedAt: string;
    manage: string;
    preview: string;
    addToGroup?: string;
    removeFromGroup?: string;
  };
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onCopy?: (menu: Menu) => void;
  onAddToGroup?: (menu: Menu) => void;
  onRemoveFromGroup?: (menu: Menu) => void;
};

/**
 * One menu in the account's menu list.
 *
 * Manage and Preview are the two things an owner actually comes here to do, so
 * they are the only buttons on the card; pausing, copying, deleting and group
 * membership live behind the overflow menu rather than competing for the same
 * row.
 */
export default function MenuDashboardCard({
  menu,
  menuName,
  description,
  formatDate,
  togglingId,
  menuPublicUrl,
  groupMeta,
  manageLinkId,
  labels,
  onToggleActive,
  onDelete,
  onCopy,
  onAddToGroup,
  onRemoveFromGroup,
}: MenuDashboardCardProps) {
  const isToggling = togglingId === menu.id;

  return (
    <Card
      as="article"
      /* Flat, never raised. A menu in a list is a resting surface; a shadow on
         it claims it floats above the page, which is a promise the direction
         reserves for overlays. */
      variant="flat"
      className={cn(
        "flex h-full flex-col",
        !menu.isActive && "bg-surface-2/40",
        groupMeta.inGroup && "border-brand-line",
      )}
    >
      <div className="flex items-start gap-2.5">
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
            <IoRestaurant className="size-4 text-fg-subtle" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-fg">{menuName}</h3>
          {/* State as a ticket line rather than filled pills: a list of eight
              venues should be scanned for the one that is paused, and eight
              coloured pills make every card equally loud. The group chip now
              names the group instead of showing a bare icon nothing announced. */}
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
              {menu.isActive ? labels.active : labels.paused}
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
              size="sm"
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
            {menu.isActive ? labels.pause : labels.play}
          </MenuItem>
          {onCopy ? (
            <MenuItem icon={<IoCopyOutline />} onClick={() => onCopy(menu)}>
              {labels.copyMenu}
            </MenuItem>
          ) : null}
          {!groupMeta.inGroup && onAddToGroup && labels.addToGroup ? (
            <MenuItem
              icon={<IoGitNetworkOutline />}
              onClick={() => onAddToGroup(menu)}
            >
              {labels.addToGroup}
            </MenuItem>
          ) : null}
          {groupMeta.inGroup && onRemoveFromGroup && labels.removeFromGroup ? (
            <MenuItem
              icon={<IoRemoveCircleOutline />}
              onClick={() => onRemoveFromGroup(menu)}
            >
              {labels.removeFromGroup}
            </MenuItem>
          ) : null}
          <MenuSeparator />
          <MenuItem
            icon={<IoTrashOutline />}
            tone="danger"
            onClick={() => onDelete(menu)}
          >
            {labels.deleteMenu}
          </MenuItem>
        </DropdownMenu>
      </div>

      {description ? (
        <p className="mt-2 line-clamp-2 text-xs text-fg-muted">{description}</p>
      ) : null}

      {/* Two ruled rows: the label states what the value is, the value is set in
          mono. The previous version ran the caption and the value together in
          one grey line, so neither the date nor the address could be picked out
          of it at a glance. */}
      <dl className="mt-3 border-t border-line text-xs">
        <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5">
          <dt className="ui-label shrink-0 text-fg-subtle">
            {labels.updatedAt}
          </dt>
          <dd
            className="truncate font-mono text-[11px] text-fg-muted"
            data-numeric
          >
            {menu.updatedAt ? formatDate(menu.updatedAt) : "—"}
          </dd>
        </div>
        <div className="flex items-baseline gap-3 py-1.5">
          <dt className="sr-only">URL</dt>
          <dd
            className="min-w-0 truncate font-mono text-[11px] text-fg-muted"
            dir="ltr"
          >
            {menuPublicUrl.replace(/^\/\//, "")}
          </dd>
        </div>
      </dl>

      <div className="flex-1" />

      <CardFooter>
        <ButtonLink
          id={manageLinkId}
          href={menuDashboardPath(menu)}
          className="flex-1"
        >
          {labels.manage}
        </ButtonLink>
        <ButtonLink
          href={menuPublicUrl}
          external
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          startIcon={<IoEyeOutline className="size-3.5" />}
        >
          {labels.preview}
        </ButtonLink>
      </CardFooter>
    </Card>
  );
}
