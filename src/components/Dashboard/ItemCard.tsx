"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Item } from "@/types/Menu";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoTrashOutline,
  IoCameraOutline,
} from "react-icons/io5";

interface ItemCardProps {
  item: Item;
  name: string;
  categoryName: string | undefined;
  imageUrl: string;
  currency: string;
  locale: string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export default function ItemCard({
  item,
  name,
  categoryName,
  imageUrl,
  currency,
  locale,
  onEdit,
  onDelete,
}: ItemCardProps) {
  const t = useTranslations("Items");
  const isRTL = locale === "ar";
  const available = item.available ?? item.isAvailable ?? true;
  const hasDiscount =
    item.originalPrice != null &&
    item.originalPrice > 0 &&
    item.originalPrice !== item.price;
  const priceLabel = formatMenuPrice(item.price, currency, locale);
  const originalPriceLabel = hasDiscount
    ? formatMenuPrice(item.originalPrice, currency, locale)
    : null;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/95 dark:shadow-slate-950/20 dark:hover:shadow-slate-950/40 ${
        available
          ? "border-slate-200/90 hover:border-primary/25 dark:border-slate-700/80 dark:hover:border-primary/40"
          : "border-amber-200/80 bg-slate-50/40 hover:border-amber-300/60 dark:border-amber-900/40 dark:bg-amber-950/10 dark:hover:border-amber-800/50"
      }`}
    >
      <div className="dashboard-card-media relative aspect-4/3 overflow-hidden bg-linear-to-br from-slate-100 via-slate-50 to-primary/5 dark:from-slate-800 dark:via-slate-900 dark:to-primary/10">
        {imageUrl ? (
          <div className="absolute inset-0">
            <LoadImage
              src={imageUrl}
              alt={name}
              width={800}
              height={600}
              cover
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              wrapperClassName="dashboard-card-media__fill"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onEdit(item)}
            title={t("addImage")}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary dark:text-slate-500 dark:hover:text-primary"
          >
            <IoCameraOutline className="text-4xl opacity-70" aria-hidden />
            <span className="text-xs font-semibold">{t("addImage")}</span>
          </button>
        )}

        <div className={`absolute top-3 z-10 flex flex-col gap-1.5 ${isRTL ? "left-3" : "right-3"}`}>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
              available
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            <IoEllipseSharp className="text-[7px]" aria-hidden />
            {available ? t("available") : t("unavailable")}
          </span>
          {hasDiscount && item.discountPercent != null && (
            <span className="inline-flex rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              -{item.discountPercent}%
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-lg font-bold text-slate-900 dark:text-slate-50"
            dir={isRTL ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>
          {categoryName && (
            <p
              className="truncate text-sm font-medium text-slate-500 dark:text-slate-400"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {categoryName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-extrabold tabular-nums tracking-tight text-primary">
            {priceLabel}
          </span>
          {originalPriceLabel && (
            <span className="text-sm text-slate-400 line-through tabular-nums dark:text-slate-500">
              {originalPriceLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title={t("edit")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
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
