"use client";

import { useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui";

interface MobileListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Kept for callers; direction now comes from the document. */
  locale?: string;
}

/**
 * Pager for the stacked collections.
 *
 * The position is read as one ticket line — `PAGE 2 OF 7` with both numbers in
 * mono — instead of the old sentence plus a separate filled chip repeating the
 * page it had just named.
 */
export default function MobileListPagination({
  page,
  totalPages,
  onPageChange,
}: MobileListPaginationProps) {
  const t = useTranslations("DataTable");

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination")}
      className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2"
    >
      <p className="ui-label flex items-center gap-1.5">
        {t("page")}
        <span className="ui-figure text-[13px] text-fg" data-numeric>
          {page}
        </span>
        {t("pageOf")}
        <span className="ui-figure text-[13px] text-fg-muted" data-numeric>
          {totalPages}
        </span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          iconOnly
          aria-label={t("prev")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FiChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant="secondary"
          iconOnly
          aria-label={t("next")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <FiChevronRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  );
}
