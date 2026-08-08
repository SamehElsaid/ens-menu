"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuStaff } from "@/types/Menu";
import StaffCard from "./StaffCard";
import StaffEmptyState from "./StaffEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

const PAGE_SIZE = 12;

function StaffCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-28 bg-primary/5 dark:bg-primary/10" />
      <div className="space-y-3 px-4 pb-4 -mt-2">
        <div className="rounded-lg border border-line p-3 dark:border-line">
          <div className="dashboard-mobile-shimmer mx-auto h-6 w-2/3 rounded-md bg-surface-3" />
          <div className="dashboard-mobile-shimmer mt-2.5 h-9 w-full rounded-lg bg-surface-3" />
        </div>
        <div className="flex gap-2 border-t border-line pt-3 dark:border-line">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
        </div>
        <div className="dashboard-mobile-shimmer h-10 w-full rounded-lg bg-surface-3" />
      </div>
    </div>
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [staffList.length]);

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
