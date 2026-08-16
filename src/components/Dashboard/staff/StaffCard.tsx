"use client";

import { useTranslations } from "next-intl";
import { MenuStaff } from "@/types/Menu";
import { getStaffInitials } from "@/lib/staffDisplay";
import {
  IoCreateOutline,
  IoMailOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Badge, Button, Card } from "@/components/ui";

interface StaffCardProps {
  staff: MenuStaff;
  locale: string;
  togglingId: number | null;
  /** Names of the menus this staff member is granted. */
  menuNames?: string[];
  onEdit: (staff: MenuStaff) => void;
  onToggleActive: (staff: MenuStaff) => void;
  onDelete: (staff: MenuStaff) => void;
}

export default function StaffCard({
  staff,
  locale,
  menuNames,
  onEdit,
  onDelete,
}: StaffCardProps) {
  const t = useTranslations("Staff");
  const active = staff.isActive;
  const isRTL = locale === "ar";
  const initials = getStaffInitials(staff.name);
  const email = staff.email?.trim() || t("emptyCell");

  const roleLabel = staff.roleName?.trim() || staff.role?.trim() || t("noRole");

  const hasRole = Boolean(staff.roleName?.trim() || staff.role?.trim());

  return (
    <Card
      as="article"
      interactive
      className="dashboard-staff-card flex h-full flex-col"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-semibold text-brand-soft-fg"
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm font-semibold text-fg"
            dir={isRTL ? "rtl" : "ltr"}
            title={staff.name}
          >
            {staff.name}
          </h3>
          <p
            className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] text-fg-muted"
            title={email}
          >
            <IoMailOutline className="shrink-0" aria-hidden />
            <span className="min-w-0 truncate" dir="ltr">
              {email}
            </span>
          </p>
        </div>
        <Badge tone={active ? "success" : "warning"} dot>
          {active ? t("active") : t("inactive")}
        </Badge>
      </div>

      <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
        <Badge tone={hasRole ? "brand" : "neutral"}>{roleLabel}</Badge>
        {menuNames?.map((name) => (
          <Badge key={name} tone="neutral" className="max-w-full truncate">
            {name}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onEdit(staff)}
            startIcon={<IoCreateOutline />}
          >
            {t("edit")}
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            fullWidth
            onClick={() => onDelete(staff)}
            startIcon={<IoTrashOutline />}
          >
            {t("delete")}
          </Button>
        </div>

        {/* <Button
          variant="secondary"
          size="sm"
          fullWidth
          loading={isToggling}
          onClick={() => onToggleActive(staff)}
          startIcon={active ? <IoPauseOutline /> : <IoPlayOutline />}
        >
          {active ? t("disable") : t("enable")}
        </Button> */}
      </div>
    </Card>
  );
}
