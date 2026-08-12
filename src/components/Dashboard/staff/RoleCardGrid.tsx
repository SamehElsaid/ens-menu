"use client";

import { useTranslations } from "next-intl";
import type { MenuStaffRole } from "@/types/Menu";
import RoleCard from "./RoleCard";
import { IoAddCircleOutline, IoShieldOutline } from "react-icons/io5";
import {
  Button,
  Card,
  EmptyState,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui";

const GRID_CLASS =
  "grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6";

function RoleCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-1.5 h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="mt-3">
        <Skeleton className="mb-1.5 h-3 w-24" />
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-1.5 border-t border-line pt-2.5">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </Card>
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
      <SkeletonRegion label={t("loading")} className={GRID_CLASS}>
        {Array.from({ length: 3 }).map((_, i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </SkeletonRegion>
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
    <div className={GRID_CLASS}>
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
