"use client";

import { useTranslations } from "next-intl";
import type { MenuStaffRole } from "@/types/Menu";
import RoleCard from "./RoleCard";
import { IoAddCircleOutline, IoShieldOutline } from "react-icons/io5";
import { Button, EmptyState } from "@/components/ui";

function RoleCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-24 bg-brand-soft" />
      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="dashboard-mobile-shimmer h-4 w-1/3 rounded bg-surface-2" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="dashboard-mobile-shimmer h-5 w-16 rounded-md bg-surface-2"
            />
          ))}
        </div>
        <div className="flex gap-2 border-t border-line pt-3">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-surface-2" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

interface RoleCardGridProps {
  roles: MenuStaffRole[];
  loading: boolean;
  locale: string;
  onEdit: (role: MenuStaffRole) => void;
  onDelete: (role: MenuStaffRole) => void;
  onDuplicate: (role: MenuStaffRole) => void;
  onAdd: () => void;
}

export default function RoleCardGrid({
  roles,
  loading,
  locale,
  onEdit,
  onDelete,
  onDuplicate,
  onAdd,
}: RoleCardGridProps) {
  const t = useTranslations("Roles");

  if (loading) {
    return (
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        icon={<IoShieldOutline aria-hidden />}
        action={
          <Button
            onClick={onAdd}
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {t("addRole")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          locale={locale}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
