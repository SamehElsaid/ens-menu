"use client";

import { useTranslations } from "next-intl";
import { IoSearchOutline, IoStarOutline } from "react-icons/io5";

type RatingsEmptyStateProps = {
  isSearch?: boolean;
};

export default function RatingsEmptyState({
  isSearch = false,
}: RatingsEmptyStateProps) {
  const t = useTranslations("Ratings");
  const Icon = isSearch ? IoSearchOutline : IoStarOutline;

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-amber-200/80 bg-white px-6 py-14 text-center shadow-sm dark:border-amber-900/40 dark:bg-slate-800/50 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-orange-500/5"
        aria-hidden
      />
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 shadow-inner ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:ring-amber-500/30">
        <Icon className="text-3xl text-amber-500" aria-hidden />
      </div>
      <h2 className="relative text-lg font-bold text-slate-900 dark:text-slate-50">
        {isSearch ? t("emptySearchTitle") : t("emptyTitle")}
      </h2>
      <p className="relative mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {isSearch ? t("emptySearchDescription") : t("emptyDescription")}
      </p>
    </div>
  );
}
