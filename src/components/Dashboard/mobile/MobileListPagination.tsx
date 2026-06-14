"use client";

import { useTranslations } from "next-intl";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

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
    <div
      className="dashboard-mobile-pagination mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-800/80"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {t("page")} {page} {t("pageOf")} {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("prev")}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <IoChevronBack className="text-xl rtl:rotate-180" />
        </button>
        <span className="inline-flex min-w-10 items-center justify-center rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary dark:bg-primary/20">
          {page}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("next")}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <IoChevronForward className="text-xl rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
