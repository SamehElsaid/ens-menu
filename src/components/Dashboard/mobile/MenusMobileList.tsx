"use client";

import { useMemo } from "react";
import { Menu } from "@/types/Menu";
import MenuDeliveryGroupPanel from "@/components/Dashboard/MenuDeliveryGroupPanel";
import {
  buildMenuDisplayGroups,
  resolveMenuGroupMeta,
  type MenuGroupSummary,
} from "@/lib/menuDeliveryGroups";
import MenuMobileCard from "./MenuMobileCard";

type MenusMobileListProps = {
  menus: Menu[];
  locale: string;
  getMenuName: (menu: Menu) => string;
  getMenuDescription: (menu: Menu) => string | undefined;
  formatDate: (dateStr: string) => string;
  togglingId: number | null;
  getMenuPublicUrl: (menu: Menu) => string;
  getDashboardPath: (menu: Menu) => string;
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onCopy?: (menu: Menu) => void;
  onAddToGroup?: (menu: Menu) => void;
  onRemoveFromGroup?: (menu: Menu) => void;
  onManageGroup?: (group: MenuGroupSummary) => void;
};

export default function MenusMobileList({
  menus,
  locale,
  getMenuName,
  getMenuDescription,
  formatDate,
  togglingId,
  getMenuPublicUrl,
  getDashboardPath,
  onToggleActive,
  onDelete,
  onCopy,
  onAddToGroup,
  onRemoveFromGroup,
  onManageGroup,
}: MenusMobileListProps) {
  const groups = useMemo(() => buildMenuDisplayGroups(menus), [menus]);

  const firstManageMenuId = useMemo(() => {
    for (const group of groups) {
      if (group.type === "group") return group.menus[0]?.id ?? null;
      return group.menu.id;
    }
    return null;
  }, [groups]);

  return (
    <div className="dashboard-mobile-list dashboard-menus-mobile-list flex flex-col gap-3 pb-2 md:hidden">
      {groups.map((group) => {
        if (group.type === "group") {
          return (
            <MenuDeliveryGroupPanel
              key={`mobile-group-${group.groupId}`}
              groupName={group.groupName}
              memberCount={group.menus.length}
              layout="mobile"
              onManageGroup={() =>
                onManageGroup?.({
                  id: group.groupId,
                  name: group.groupName,
                  menuIds: group.menus.map((m) => m.id),
                })
              }
              menuCards={group.menus.map((menu) => (
                <MenuMobileCard
                  key={menu.id}
                  menu={menu}
                  menuName={getMenuName(menu)}
                  description={getMenuDescription(menu) || undefined}
                  locale={locale}
                  formatDate={formatDate}
                  isFirst={menu.id === firstManageMenuId}
                  togglingId={togglingId}
                  menuPublicUrl={getMenuPublicUrl(menu)}
                  dashboardPath={getDashboardPath(menu)}
                  groupMeta={resolveMenuGroupMeta(menu)}
                  isNested
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                  onCopy={onCopy}
                  onAddToGroup={onAddToGroup}
                  onRemoveFromGroup={onRemoveFromGroup}
                />
              ))}
            />
          );
        }

        const menu = group.menu;
        return (
          <MenuMobileCard
            key={menu.id}
            menu={menu}
            menuName={getMenuName(menu)}
            description={getMenuDescription(menu) || undefined}
            locale={locale}
            formatDate={formatDate}
            isFirst={menu.id === firstManageMenuId}
            togglingId={togglingId}
            menuPublicUrl={getMenuPublicUrl(menu)}
            dashboardPath={getDashboardPath(menu)}
            groupMeta={resolveMenuGroupMeta(menu)}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
            onCopy={onCopy}
            onAddToGroup={onAddToGroup}
            onRemoveFromGroup={onRemoveFromGroup}
          />
        );
      })}
    </div>
  );
}
