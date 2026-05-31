"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  loading = false,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("common");
  const isRTL = useLocale() === "ar";

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("paginationInfo", {
          from: (page - 1) * limit + 1,
          to: Math.min(page * limit, total),
          total,
        })}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <IoChevronBackOutline className={`${isRTL ? "rotate-180" : ""}`} />
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              disabled={loading}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed ${
                page === p
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <IoChevronForwardOutline className={`${isRTL ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
