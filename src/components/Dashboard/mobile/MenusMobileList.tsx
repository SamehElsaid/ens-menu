"use client";

import { Menu } from "@/types/Menu";
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
}: MenusMobileListProps) {
  return (
    <div className="dashboard-mobile-list dashboard-menus-mobile-list flex flex-col gap-3 pb-2 md:hidden">
      {menus.map((menu, index) => (
        <MenuMobileCard
          key={menu.id}
          menu={menu}
          menuName={getMenuName(menu)}
          description={getMenuDescription(menu) || undefined}
          locale={locale}
          formatDate={formatDate}
          isFirst={index === 0}
          togglingId={togglingId}
          menuPublicUrl={getMenuPublicUrl(menu)}
          dashboardPath={getDashboardPath(menu)}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
