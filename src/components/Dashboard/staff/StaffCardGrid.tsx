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
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-28 bg-primary/5 dark:bg-primary/10" />
      <div className="space-y-3 px-4 pb-4 -mt-2">
        <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
          <div className="dashboard-mobile-shimmer mx-auto h-6 w-2/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer mt-2.5 h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-700/60" />
        </div>
        <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
        </div>
        <div className="dashboard-mobile-shimmer h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      </div>
    </div>
  );
}

interface StaffCardGridProps {
  staffList: MenuStaff[];
  loading: boolean;
  locale: string;
  togglingId: number | null;
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
