"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MenuTable } from "@/types/Menu";
import TableCard from "./TableCard";
import TablesEmptyState from "./TablesEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import { Card, Skeleton, SkeletonRegion } from "@/components/ui";

/** Shared by both branches so the grid does not reflow when the data lands. */
const tablesGridClass =
  "dashboard-tables-grid grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

/** Mirrors `TableCard`: title and status row, the QR plate, then the actions
 *  behind their rule. */
function TableCardSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-28" rounded="sm" />
        <Skeleton className="h-4 w-14" rounded="full" />
      </div>
      <div className="my-4 flex flex-1 flex-col items-center justify-center gap-2">
        <Skeleton className="size-28" rounded="sm" />
        <Skeleton className="h-3 w-32" rounded="sm" />
      </div>
      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
        <Skeleton className="h-8 w-full" rounded="sm" />
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-8" rounded="sm" />
          ))}
        </div>
      </div>
    </Card>
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
  const t = useTranslations("auth");
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
      <SkeletonRegion label={t("loading")} className={tablesGridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <TableCardSkeleton key={i} />
        ))}
      </SkeletonRegion>
    );
  }

  if (tables.length === 0) {
    return <TablesEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="dashboard-tables-grid-wrap min-w-0">
      <div className={tablesGridClass}>
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
