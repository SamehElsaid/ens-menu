"use client";

import { useTranslations } from "next-intl";
import { IoAddCircleOutline, IoPeopleOutline } from "react-icons/io5";
import { Button, EmptyState } from "@/components/ui";

interface StaffEmptyStateProps {
  onAdd: () => void;
}

export default function StaffEmptyState({ onAdd }: StaffEmptyStateProps) {
  const t = useTranslations("Staff");

  return (
    <EmptyState
      className="dashboard-staff-empty"
      icon={<IoPeopleOutline aria-hidden />}
      title={t("noStaff")}
      description={t("noStaffDescription")}
      action={
        <Button onClick={onAdd} startIcon={<IoAddCircleOutline />}>
          {t("addFirstStaff")}
        </Button>
      }
    />
  );
}
