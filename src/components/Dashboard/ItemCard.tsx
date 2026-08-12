"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Item } from "@/types/Menu";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import {
  getItemDisplayPrice,
  getItemSizes,
  itemHasSizes,
} from "@/lib/itemSizes";
import { getItemVariants, itemHasVariants } from "@/lib/itemVariants";
import {
  IoCreateOutline,
  IoTrashOutline,
  IoCameraOutline,
} from "react-icons/io5";
import { Button, Card, CardFooter } from "@/components/ui";

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
  const sizes = getItemSizes(item);
  const variants = getItemVariants(item);
  const hasMultipleSizes = itemHasSizes(item);
  const hasAddOns = itemHasVariants(item);
  const displayPrice = getItemDisplayPrice(item);
  const priceLabel = formatMenuPrice(displayPrice, currency, locale);
  const originalPriceLabel = hasDiscount
    ? formatMenuPrice(item.originalPrice, currency, locale)
    : null;

  return (
    <Card
      as="article"
      padded="none"
      interactive
      className="flex h-full flex-col overflow-hidden"
    >
      <div className="dashboard-card-media relative aspect-4/3 overflow-hidden border-b border-line bg-surface-2">
        {imageUrl ? (
          <div className="absolute inset-0">
            <LoadImage
              src={imageUrl}
              alt={name}
              width={800}
              height={600}
              cover
              className="h-full w-full object-cover"
              wrapperClassName="dashboard-card-media__fill"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-fg-subtle transition-colors hover:text-fg"
          >
            <IoCameraOutline className="text-3xl" aria-hidden />
            <span className="text-xs font-medium">{t("addImage")}</span>
          </button>
        )}

        {/* Only the discount stays on the photograph, because it is a fact
            about the price rather than about the row, and it is corner-anchored
            rather than floated so it reads as a stamp on the plate. */}
        {hasDiscount && item.discountPercent != null ? (
          <span className="absolute start-0 top-0 z-10 bg-danger px-1.5 py-0.5 font-mono text-[11px] font-semibold text-on-status tabular-nums">
            -{item.discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Availability moved off the image and onto a ticket row. A grid of
            twelve dishes is scanned down a column, and a badge floating over
            photographs of different brightness lands at a different height and
            a different contrast in every card. */}
        <div className="flex items-center justify-between gap-2">
          <span className="ui-label inline-flex shrink-0 items-center gap-1.5 text-fg-muted">
            <span
              aria-hidden
              className={
                available
                  ? "size-1.5 rounded-full bg-success"
                  : "size-1.5 rounded-full bg-warning"
              }
            />
            {available ? t("available") : t("unavailable")}
          </span>
          {categoryName ? (
            <span
              className="ui-label min-w-0 truncate text-fg-subtle"
              dir={isRTL ? "rtl" : "ltr"}
              title={categoryName}
            >
              {categoryName}
            </span>
          ) : null}
        </div>

        <h3
          className="mt-2.5 truncate text-sm font-semibold text-fg"
          dir={isRTL ? "rtl" : "ltr"}
          title={name}
        >
          {name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="ui-figure text-[17px] text-fg" data-numeric>
            {hasMultipleSizes
              ? `${locale === "ar" ? "من " : "From "}${priceLabel}`
              : priceLabel}
          </span>
          {originalPriceLabel && (
            <span className="font-mono text-[12px] tabular-nums text-fg-subtle line-through">
              {originalPriceLabel}
            </span>
          )}
        </div>

        {hasMultipleSizes || hasAddOns ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {hasMultipleSizes ? (
              <span className="ui-label rounded-sm border border-line px-1.5 py-px text-fg-muted">
                {t("sizesCount", { count: sizes.length })}
              </span>
            ) : null}
            {hasAddOns ? (
              <span className="ui-label rounded-sm border border-line px-1.5 py-px text-fg-muted">
                {t("addOnsCount", { count: variants.length })}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1" />

        {/* Edit is the action; delete is the exception. Two equal full-width
            buttons made destroying a dish as inviting as editing one. */}
        <CardFooter>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onEdit(item)}
            startIcon={<IoCreateOutline />}
          >
            {t("edit")}
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            onClick={() => onDelete(item)}
            aria-label={t("delete")}
            title={t("delete")}
          >
            <IoTrashOutline />
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
