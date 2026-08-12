"use client";

import { useTranslations } from "next-intl";
import { Item } from "@/types/Menu";
import { formatMenuPrice } from "@/lib/formatMenuPrice";
import { Badge, Button } from "@/components/ui";
import ItemMobileThumbnail from "./ItemMobileThumbnail";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";

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

/**
 * One dish, as a ticket row.
 *
 * This is not a card any more: it carries no border, radius or shadow of its
 * own because `ItemsMobileList` rules the rows against each other, and forty
 * separate pillows on a 375px screen is forty edges to read instead of one
 * list. The price is the reason the row exists, so it is the only thing set at
 * figure size, and the actions sit in a strip below a hairline rather than
 * floating in the padding beside the price they could be mistaken for.
 */
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
    <article className="dashboard-item-card flex flex-col">
      <div className="flex items-start gap-3 p-3">
        <ItemMobileThumbnail
          src={imageUrl}
          alt={name}
          uploadLabel={t("addImage")}
          onUploadClick={() => onEdit(item)}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {categoryName ? (
            <p className="ui-label truncate" title={categoryName}>
              {categoryName}
            </p>
          ) : null}

          <h3
            className="truncate text-sm leading-tight font-semibold text-fg"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="ui-figure text-[17px] text-fg" data-numeric>
              {priceLabel}
            </span>
            {originalPriceLabel ? (
              <span className="font-mono text-[12px] text-fg-subtle line-through tabular-nums">
                {originalPriceLabel}
              </span>
            ) : null}
            {hasDiscount && item.discountPercent != null ? (
              <span className="ui-label rounded-sm border border-danger-line bg-danger-soft px-1 text-danger-fg">
                -{item.discountPercent}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-3 py-1.5">
        <Badge tone={available ? "success" : "warning"} dot>
          {available ? t("available") : t("unavailable")}
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            onClick={() => onEdit(item)}
            startIcon={<IoCreateOutline />}
          >
            {t("edit")}
          </Button>
          <Button
            variant="dangerGhost"
            iconOnly
            onClick={() => onDelete(item)}
            aria-label={t("delete")}
            title={t("delete")}
          >
            <IoTrashOutline />
          </Button>
        </div>
      </div>
    </article>
  );
}
