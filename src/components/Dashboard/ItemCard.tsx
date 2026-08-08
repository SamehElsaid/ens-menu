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
import { Badge, Button, Card } from "@/components/ui";

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
      <div className="dashboard-card-media relative aspect-4/3 overflow-hidden bg-surface-2">
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
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-fg-subtle transition-colors hover:text-brand"
          >
            <IoCameraOutline className="text-3xl" aria-hidden />
            <span className="text-xs font-medium">{t("addImage")}</span>
          </button>
        )}

        <div className="absolute end-3 top-3 z-10 flex flex-col items-end gap-1.5">
          <Badge tone={available ? "success" : "warning"} variant="solid" dot>
            {available ? t("available") : t("unavailable")}
          </Badge>
          {hasDiscount && item.discountPercent != null && (
            <Badge tone="danger" variant="solid">
              -{item.discountPercent}%
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3
            className="truncate text-sm font-semibold text-fg"
            dir={isRTL ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>
          {categoryName && (
            <p
              className="mt-0.5 truncate text-[13px] text-fg-muted"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {categoryName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base font-semibold tabular-nums text-fg">
            {hasMultipleSizes
              ? `${locale === "ar" ? "من " : "From "}${priceLabel}`
              : priceLabel}
          </span>
          {originalPriceLabel && (
            <span className="text-[13px] tabular-nums text-fg-subtle line-through">
              {originalPriceLabel}
            </span>
          )}
          {hasMultipleSizes ? (
            <span className="text-[13px] text-fg-muted">
              {t("sizesCount", { count: sizes.length })}
            </span>
          ) : null}
          {hasAddOns ? (
            <span className="text-[13px] text-fg-muted">
              {t("addOnsCount", { count: variants.length })}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-3">
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
            fullWidth
            onClick={() => onDelete(item)}
            startIcon={<IoTrashOutline />}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
