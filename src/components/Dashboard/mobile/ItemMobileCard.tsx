"use client";

import { useTranslations } from "next-intl";
import { Item } from "@/types/Menu";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import ItemMobileThumbnail from "./ItemMobileThumbnail";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoTrashOutline,
} from "react-icons/io5";

interface ItemMobileCardProps {
  item: Item;
  name: string;
  categoryName: string | undefined;
  imageUrl: string;
  currency: string;
  locale: string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export default function ItemMobileCard({
  item,
  name,
  categoryName,
  imageUrl,
  currency,
  locale,
  onEdit,
  onDelete,
}: ItemMobileCardProps) {
  const t = useTranslations("Items");
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
    <article className="dashboard-item-card group flex gap-3 rounded-lg border border-line/90 bg-white p-3 shadow-[0_1px_8px_rgba(15,23,42,0.06)] transition-all duration-200 active:scale-[0.99] dark:border-line/80 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)]">
      <ItemMobileThumbnail
        src={imageUrl}
        alt={name}
        uploadLabel={t("addImage")}
        onUploadClick={() => onEdit(item)}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-[15px] font-bold leading-tight text-fg"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>

          {categoryName && (
            <p className="truncate text-xs font-medium text-fg-muted">
              {categoryName}
            </p>
          )}

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
            <span className="text-lg font-extrabold tabular-nums tracking-tight text-primary dark:text-primary">
              {priceLabel}
            </span>
            {originalPriceLabel && (
              <span className="text-xs text-fg-subtle line-through tabular-nums dark:text-fg-subtle">
                {originalPriceLabel}
              </span>
            )}
            {hasDiscount && item.discountPercent != null && (
              <span className="rounded-md bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/35 dark:text-red-300">
                -{item.discountPercent}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              available
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
            }`}
          >
            <IoEllipseSharp
              className={`text-[6px] ${available ? "text-emerald-500" : "text-amber-500"}`}
            />
            {available ? t("available") : t("unavailable")}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={t("edit")}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-slate-50 text-fg-muted transition-colors active:scale-95"
            >
              <IoCreateOutline className="text-[17px]" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={t("delete")}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 transition-colors active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              <IoTrashOutline className="text-[17px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
