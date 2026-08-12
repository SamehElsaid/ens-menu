"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Category } from "@/types/Menu";
import {
  IoCreateOutline,
  IoTrashOutline,
  IoImageOutline,
} from "react-icons/io5";
import { Button, Card, CardFooter } from "@/components/ui";

interface CategoryCardProps {
  category: Category;
  name: string;
  imageUrl: string;
  locale: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({
  category,
  name,
  imageUrl,
  locale,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const t = useTranslations("Categories");
  const active = category.isActive;
  const isRTL = locale === "ar";

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
          <div className="flex h-full flex-col items-center justify-center gap-2 text-fg-subtle">
            <IoImageOutline className="text-3xl" aria-hidden />
            <span className="text-xs font-medium">
              {t("addModal.uploadImage")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* State on a ticket row rather than floated over the photograph — see
            `ItemCard`: a grid is scanned down a column, and the column has to be
            at the same height in every card. */}
        <span className="ui-label inline-flex items-center gap-1.5 text-fg-muted">
          <span
            aria-hidden
            className={
              active
                ? "size-1.5 rounded-full bg-success"
                : "size-1.5 rounded-full bg-warning"
            }
          />
          {active ? t("active") : t("inactive")}
        </span>

        <h3
          className="mt-2.5 truncate text-sm font-semibold text-fg capitalize"
          dir={isRTL ? "rtl" : "ltr"}
          title={name}
        >
          {name}
        </h3>

        <div className="flex-1" />

        <CardFooter>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => onEdit(category)}
            startIcon={<IoCreateOutline />}
          >
            {t("edit")}
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            onClick={() => onDelete(category)}
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
