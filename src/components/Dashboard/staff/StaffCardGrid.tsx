"use client";

import { useMemo, useState } from "react";
import { MenuStaff } from "@/types/Menu";
import { Card, Skeleton } from "@/components/ui";
import StaffCard from "./StaffCard";
import StaffEmptyState from "./StaffEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

const PAGE_SIZE = 12;

/** Mirrors `StaffCard`'s real geometry — avatar tile, two text lines, chip row,
 *  ruled action footer — so the list does not reflow when data lands. */
function StaffCardSkeleton() {
  return (
    <Card aria-hidden>
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0" rounded="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="mt-3 mb-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-4 w-20" rounded="full" />
        <Skeleton className="h-4 w-16" rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
        <Skeleton className="h-8" rounded="lg" />
        <Skeleton className="h-8" rounded="lg" />
      </div>
    </Card>
  );
}

interface StaffCardGridProps {
  staffList: MenuStaff[];
  loading: boolean;
  locale: string;
  togglingId: number | null;
  /** Menu id to display name, used to label each member's grants. */
  menuNameById?: Record<number, string>;
  onEdit: (staff: MenuStaff) => void;
  onToggleActive: (staff: MenuStaff) => void;
  onDelete: (staff: MenuStaff) => void;
  onAdd: () => void;
}

export default function StaffCardGrid({
  staffList,
  loading,
  locale,
  togglingId,
  menuNameById,
  onEdit,
  onToggleActive,
  onDelete,
  onAdd,
}: StaffCardGridProps) {
  const [pagination, setPagination] = useState({
    page: 1,
    itemCount: staffList.length,
  });
  if (pagination.itemCount !== staffList.length) {
    setPagination({ page: 1, itemCount: staffList.length });
  }
  const page = pagination.page;
  const setPage = (nextPage: number) =>
    setPagination({ page: nextPage, itemCount: staffList.length });

  const totalPages = Math.max(1, Math.ceil(staffList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageStaff = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return staffList.slice(start, start + PAGE_SIZE);
  }, [staffList, safePage]);

  if (loading) {
    return (
      <div className="dashboard-staff-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {Array.from({ length: 6 }).map((_, i) => (
          <StaffCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (staffList.length === 0) {
    return <StaffEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="dashboard-staff-grid-wrap min-w-0">
      <div className="dashboard-staff-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {pageStaff.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            locale={locale}
            togglingId={togglingId}
            menuNames={(staff.menuIds ?? [])
              .map((id) => menuNameById?.[id])
              .filter((name): name is string => Boolean(name))}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <MobileListPagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          locale={locale}
        />
      )}
    </div>
  );
}
