"use client";

import { useTranslations } from "next-intl";
import { IoAddCircleOutline, IoMegaphoneOutline } from "react-icons/io5";

interface AdsEmptyStateProps {
  onAdd?: () => void;
}

export default function AdsEmptyState({ onAdd }: AdsEmptyStateProps) {
  const t = useTranslations("Advertisements.page");

  return (
    <div className="dashboard-ads-empty flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-600 dark:bg-slate-800/50 sm:py-16">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
        <IoMegaphoneOutline className="text-3xl text-primary" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
        {t("noAds")}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {t("noAdsDescription")}
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <IoAddCircleOutline className="text-lg" aria-hidden />
          {t("addFirstAd")}
        </button>
      )}
    </div>
  );
}
