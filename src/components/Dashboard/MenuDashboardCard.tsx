"use client";

import LoadImage from "@/components/ImageLoad";

import { menuDashboardPath } from "@/lib/menuDashboardPath";
import type { MenuGroupMeta } from "@/lib/menuDeliveryGroups";
import type { Menu } from "@/types/Menu";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
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
  isNested?: boolean;
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
  isNested = false,
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
      variant={isNested ? "flat" : "raised"}
      className={cn(
        "flex h-full flex-col",
        !menu.isActive && "bg-surface-2/40",
        groupMeta.inGroup && "border-brand-line",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-surface-2">
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
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge tone={menu.isActive ? "success" : "warning"} dot>
              {menu.isActive ? labels.active : labels.paused}
            </Badge>
            {groupMeta.inGroup ? (
              <Badge tone="brand">
                <IoGitNetworkOutline aria-hidden />
              </Badge>
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

      <dl className="mt-2.5 space-y-0.5 text-xs text-fg-subtle">
        <div className="flex gap-1.5">
          <dt className="shrink-0">{labels.updatedAt}</dt>
          <dd className="truncate" data-numeric>
            {menu.updatedAt ? formatDate(menu.updatedAt) : "—"}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="sr-only">URL</dt>
          <dd className="truncate font-mono" dir="ltr">
            {menuPublicUrl.replace(/^\/\//, "")}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-1.5 pt-3">
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
          className="flex-1"
          startIcon={<IoEyeOutline className="size-3.5" />}
        >
          {labels.preview}
        </ButtonLink>
      </div>
    </Card>
  );
}
