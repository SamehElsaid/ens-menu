"use client";

import { useTranslations } from "next-intl";
import { IoStarOutline } from "react-icons/io5";

type RatingsEmptyStateProps = {
  isSearch?: boolean;
};

export default function RatingsEmptyState({
  isSearch = false,
}: RatingsEmptyStateProps) {
  const t = useTranslations("Ratings");

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800/50 sm:py-16">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/15 dark:bg-amber-500/15 dark:ring-amber-500/25">
        <IoStarOutline className="text-3xl text-amber-500" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
        {isSearch ? t("emptySearchTitle") : t("emptyTitle")}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {isSearch ? t("emptySearchDescription") : t("emptyDescription")}
      </p>
    </div>
  );
}
