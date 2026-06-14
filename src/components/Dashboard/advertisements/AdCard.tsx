"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import { adRowMetrics } from "@/lib/adMetrics";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoImageOutline,
  IoLinkOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface AdCardProps {
  ad: Advertisement;
  locale: string;
  title: string;
  contentPreview?: string;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
}

export default function AdCard({
  ad,
  locale,
  title,
  contentPreview,
  onEdit,
  onDelete,
}: AdCardProps) {
  const t = useTranslations("Advertisements.page");
  const isRTL = locale === "ar";
  const metrics = adRowMetrics(ad);
  const imageSrc = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
  const showStatus = ad.isActive !== undefined;
  const active = ad.isActive !== false;
  const link = ad.linkUrl?.trim();

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/95 dark:shadow-slate-950/20 dark:hover:shadow-slate-950/40 ${
        !showStatus || active
          ? "border-slate-200/90 hover:border-primary/25 dark:border-slate-700/80 dark:hover:border-primary/40"
          : "border-amber-200/80 bg-slate-50/40 hover:border-amber-300/60 dark:border-amber-900/40 dark:bg-amber-950/10 dark:hover:border-amber-800/50"
      }`}
    >
      <div className="dashboard-card-media relative aspect-video overflow-hidden bg-linear-to-br from-slate-100 via-slate-50 to-primary/5 dark:from-slate-800 dark:via-slate-900 dark:to-primary/10">
        {imageSrc ? (
          <div className="absolute inset-0">
            <LoadImage
              src={imageSrc}
              alt={title}
              width={800}
              height={450}
              cover
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              wrapperClassName="dashboard-card-media__fill"
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
            <IoImageOutline className="text-4xl opacity-60" aria-hidden />
            <span className="text-xs font-medium">{t("columns.image")}</span>
          </div>
        )}

        {showStatus && (
          <div className={`absolute top-3 z-10 ${isRTL ? "left-3" : "right-3"}`}>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
                active
                  ? "bg-emerald-500/90 text-white"
                  : "bg-amber-500/90 text-white"
              }`}
            >
              <IoEllipseSharp className="text-[7px]" aria-hidden />
              {active ? t("active") : t("inactive")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-lg font-bold text-slate-900 dark:text-slate-50"
            dir={isRTL ? "rtl" : "ltr"}
            title={title}
          >
            {title || "—"}
          </h3>
          {contentPreview && contentPreview !== "—" && (
            <p
              className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {contentPreview}
            </p>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate text-xs font-medium text-primary hover:underline"
              dir="ltr"
              title={link}
            >
              <IoLinkOutline className="shrink-0 text-sm" aria-hidden />
              <span className="truncate">
                {link.length > 32 ? `${link.slice(0, 29)}...` : link}
              </span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-2 py-2 text-center dark:border-sky-800/40 dark:bg-sky-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.impressions")}
            </p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {metrics.impressionCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-2 py-2 text-center dark:border-amber-800/40 dark:bg-amber-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.clicks")}
            </p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {metrics.clickCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-2 py-2 text-center dark:border-emerald-800/40 dark:bg-emerald-950/25">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {t("columns.ctr")}
            </p>
            <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {metrics.ctr}%
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onEdit(ad)}
            title={t("edit")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(ad)}
            title={t("delete")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 active:scale-[0.98] dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
          >
            <IoTrashOutline className="text-base" aria-hidden />
            {t("delete")}
          </button>
        </div>
      </div>
    </article>
  );
}
