"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Category } from "@/types/Menu";
import {
  IoCreateOutline,
  IoTrashOutline,
  IoImageOutline,
} from "react-icons/io5";
import { Badge, Button, Card } from "@/components/ui";

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
      <div className="dashboard-card-media relative aspect-[4/3] overflow-hidden bg-surface-2">
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

        <div className="absolute end-3 top-3 z-10">
          <Badge tone={active ? "success" : "warning"} variant="solid" dot>
            {active ? t("active") : t("inactive")}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3
          className="truncate text-sm font-semibold capitalize text-fg"
          dir={isRTL ? "rtl" : "ltr"}
          title={name}
        >
          {name}
        </h3>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-3">
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
            fullWidth
            onClick={() => onDelete(category)}
            startIcon={<IoTrashOutline />}
          >
            {t("delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
