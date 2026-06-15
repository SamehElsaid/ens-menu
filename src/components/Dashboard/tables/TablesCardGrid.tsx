"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuTable } from "@/types/Menu";
import TableCard from "./TableCard";
import TablesEmptyState from "./TablesEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

function TableCardSkeleton() {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="dashboard-mobile-shimmer h-5 w-28 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-5 w-14 rounded-full bg-slate-100 dark:bg-slate-700/60" />
      </div>
      <div className="dashboard-mobile-shimmer mx-auto mb-4 size-24 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      <div className="dashboard-mobile-shimmer mb-2 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-700/60" />
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="dashboard-mobile-shimmer h-9 rounded-xl bg-slate-100 dark:bg-slate-700/60"
          />
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

interface TablesCardGridProps {
  tables: MenuTable[];
  loading: boolean;
  locale: string;
  menuSlug: string | undefined | null;
  qrCenterLogoSrc: string | null | undefined;
  onEdit: (table: MenuTable) => void;
  onDelete: (table: MenuTable) => void;
  onAdd: () => void;
}

export default function TablesCardGrid({
  tables,
  loading,
  locale,
  menuSlug,
  qrCenterLogoSrc,
  onEdit,
  onDelete,
  onAdd,
}: TablesCardGridProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [tables.length]);

  const totalPages = Math.max(1, Math.ceil(tables.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageTables = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return tables.slice(start, start + PAGE_SIZE);
  }, [tables, safePage]);

  if (loading) {
    return (
      <div className="dashboard-tables-grid grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tables.length === 0) {
    return <TablesEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="dashboard-tables-grid-wrap min-w-0">
      <div className="dashboard-tables-grid grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {pageTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            menuSlug={menuSlug}
            qrCenterLogoSrc={qrCenterLogoSrc}
            locale={locale}
            onEdit={onEdit}
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
