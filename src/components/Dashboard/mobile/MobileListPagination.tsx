"use client";

import { useTranslations } from "next-intl";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

interface MobileListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  locale: string;
}

export default function MobileListPagination({
  page,
  totalPages,
  onPageChange,
  locale,
}: MobileListPaginationProps) {
  const t = useTranslations("DataTable");
  const isRTL = locale === "ar";

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination")}
      className={cn(
        "dashboard-mobile-pagination mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-3",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <span className="text-sm font-medium text-fg-muted">
        {t("page")} {page} {t("pageOf")} {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          aria-label={t("prev")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FiChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand-soft-fg">
          {page}
        </span>
        <Button
          variant="secondary"
          size="sm"
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
