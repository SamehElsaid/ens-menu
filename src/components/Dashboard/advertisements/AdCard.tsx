"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import { adRowMetrics } from "@/lib/adMetrics";
import { normalizeExternalUrl } from "@/lib/normalizeExternalUrl";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoImageOutline,
  IoLinkOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface AdCardProps {
  ad: Advertisement;
  locale: string;
  title: string;
  contentPreview?: string;
  togglingId?: number | null;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onToggleActive?: (ad: Advertisement) => void;
}

export default function AdCard({
  ad,
  locale,
  title,
  contentPreview,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: AdCardProps) {
  const t = useTranslations("Advertisements.page");
  const isRTL = locale === "ar";
  const metrics = adRowMetrics(ad);
  const isActive = Boolean(ad.isActive);
  const isToggling = togglingId != null && togglingId === ad.id;
  const imageSrc = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
  const link = ad.linkUrl?.trim()
    ? normalizeExternalUrl(ad.linkUrl.trim())
    : undefined;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-xl  dark:shadow-slate-950/20 ${
        isActive
          ? "border-line/90 hover:border-primary/25 dark:border-line/80 dark:hover:border-primary/40"
          : "border-amber-200/80 bg-slate-50/40 dark:border-amber-900/40 dark:bg-amber-950/10"
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
          <div className="flex h-full flex-col items-center justify-center gap-2 text-fg-subtle">
            <IoImageOutline className="text-4xl opacity-60" aria-hidden />
            <span className="text-xs font-medium">{t("columns.image")}</span>
          </div>
        )}
        <span
          className={`absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${
            isActive
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200"
          }`}
        >
          <IoEllipseSharp className="text-[7px]" aria-hidden />
          {isActive ? t("active") : t("paused")}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-lg font-bold text-fg"
            dir={isRTL ? "rtl" : "ltr"}
            title={title}
          >
            {title || "—"}
          </h3>
          {contentPreview && contentPreview !== "—" && (
            <p
              className="line-clamp-2 text-sm text-fg-muted"
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
          <div className="rounded-lg border border-sky-200/70 bg-sky-50/80 px-2 py-2 text-center dark:border-sky-800/40 dark:bg-sky-950/25">
            <p className="text-[10px] font-medium text-fg-muted">
              {t("columns.impressions")}
            </p>
            <p className="text-sm font-bold tabular-nums text-fg">
              {metrics.impressionCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200/70 bg-amber-50/80 px-2 py-2 text-center dark:border-amber-800/40 dark:bg-amber-950/25">
            <p className="text-[10px] font-medium text-fg-muted">
              {t("columns.clicks")}
            </p>
            <p className="text-sm font-bold tabular-nums text-fg">
              {metrics.clickCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-2 py-2 text-center dark:border-emerald-800/40 dark:bg-emerald-950/25">
            <p className="text-[10px] font-medium text-fg-muted">
              {t("columns.ctr")}
            </p>
            <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {metrics.ctr}%
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3 dark:border-line/80">
          {onToggleActive && (
            <button
              type="button"
              onClick={() => onToggleActive(ad)}
              disabled={isToggling}
              title={isActive ? t("pause") : t("activate")}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
                isActive
                  ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200"
              }`}
            >
              {isToggling ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isActive ? (
                <IoPauseOutline className="text-base" aria-hidden />
              ) : (
                <IoPlayOutline className="text-base" aria-hidden />
              )}
              {isActive ? t("pause") : t("activate")}
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(ad)}
              title={t("edit")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-slate-50 px-3 py-2.5 text-sm font-medium text-fg-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              <IoCreateOutline className="text-base" aria-hidden />
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => onDelete(ad)}
              title={t("delete")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 active:scale-[0.98] dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
            >
              <IoTrashOutline className="text-base" aria-hidden />
              {t("delete")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
