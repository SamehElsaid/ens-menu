"use client";

import { useTranslations } from "next-intl";
import { Category } from "@/types/Menu";
import { Badge, Button } from "@/components/ui";
import ItemMobileThumbnail from "./ItemMobileThumbnail";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";

interface CategoryMobileCardProps {
  category: Category;
  name: string;
  imageUrl: string;
  locale: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/**
 * One category, as a ticket row.
 *
 * Same shape as `ItemMobileCard` on purpose — the two lists sit one tap apart
 * in the sidebar, so a category row that looked like a different kind of object
 * would cost the reader a second look. A category has no price, so the name
 * carries the row and the state moves down into the action strip.
 */
export default function CategoryMobileCard({
  category,
  name,
  imageUrl,
  locale,
  onEdit,
  onDelete,
}: CategoryMobileCardProps) {
  const t = useTranslations("Categories");
  const active = category.isActive;

  return (
    <article className="dashboard-item-card flex flex-col">
      <div className="flex items-center gap-3 p-3">
        <ItemMobileThumbnail
          src={imageUrl}
          alt={name}
          uploadLabel={t("addModal.uploadImage")}
          onUploadClick={() => onEdit(category)}
        />

        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm leading-tight font-semibold text-fg capitalize"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-3 py-1.5">
        <Badge tone={active ? "success" : "warning"} dot>
          {active ? t("active") : t("inactive")}
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            onClick={() => onEdit(category)}
            startIcon={<IoCreateOutline />}
          >
            {t("edit")}
          </Button>
          <Button
            variant="dangerGhost"
            iconOnly
            onClick={() => onDelete(category)}
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
