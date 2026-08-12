"use client";

import { useTranslations } from "next-intl";
import {
  IoGitNetworkOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import type { ReactNode } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

type MenuDeliveryGroupPanelProps = {
  groupName: string;
  memberCount: number;
  menuCards: ReactNode;
  layout?: "desktop" | "mobile";
  onManageGroup?: () => void;
};

export default function MenuDeliveryGroupPanel({
  groupName,
  memberCount,
  menuCards,
  layout = "desktop",
  onManageGroup,
}: MenuDeliveryGroupPanelProps) {
  const t = useTranslations("Menus.menuCard");
  const isMobile = layout === "mobile";

  return (
    <Card
      as="section"
      padded="none"
      className={cn(
        "overflow-hidden",
        isMobile ? "col-span-full" : "col-span-full xl:col-span-2",
      )}
      aria-label={groupName}
    >
      {/* The panel's identity is its label and its rule, not a coloured band:
          a tinted header on a container of menu cards competes with the cards
          it is meant to be holding. */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="ui-label flex items-center gap-1.5">
            <IoGitNetworkOutline className="size-3.5" aria-hidden />
            {t("menuGroupTitle")}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-[-0.02em] text-fg">
              {groupName}
            </h3>
            <Badge
              tone="neutral"
              icon={<IoPeopleOutline aria-hidden />}
              className="tabular-nums"
            >
              {t("groupMemberCount", { count: memberCount })}
            </Badge>
          </div>
        </div>
        {onManageGroup && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onManageGroup}
            startIcon={<IoSettingsOutline className="text-base" />}
          >
            {t("manageGroup")}
          </Button>
        )}
      </header>

      <div
        className={cn(
          "bg-surface",
          isMobile
            ? "flex flex-col gap-3 p-3"
            : "grid gap-4 p-4 md:grid-cols-2 md:p-5",
        )}
      >
        {menuCards}
      </div>
    </Card>
  );
}
