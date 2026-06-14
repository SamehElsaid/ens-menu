"use client";

import { useTranslations } from "next-intl";
import { Category } from "@/types/Menu";
import ItemMobileThumbnail from "./ItemMobileThumbnail";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoTrashOutline,
} from "react-icons/io5";

interface CategoryMobileCardProps {
  category: Category;
  name: string;
  imageUrl: string;
  locale: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

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
    <article className="dashboard-item-card flex gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_8px_rgba(15,23,42,0.06)] transition-all duration-200 active:scale-[0.99] dark:border-slate-700/80 dark:bg-slate-800/95 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)]">
      <ItemMobileThumbnail
        src={imageUrl}
        alt={name}
        uploadLabel={t("addModal.uploadImage")}
        onUploadClick={() => onEdit(category)}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <div className="min-w-0">
          <h3
            className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-slate-50"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={name}
          >
            {name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
            }`}
          >
            <IoEllipseSharp
              className={`text-[6px] ${active ? "text-emerald-500" : "text-amber-500"}`}
            />
            {active ? t("active") : t("inactive")}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(category)}
              aria-label={t("edit")}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors active:scale-95 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200"
            >
              <IoCreateOutline className="text-[17px]" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              aria-label={t("delete")}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-red-200/80 bg-red-50 text-red-600 transition-colors active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              <IoTrashOutline className="text-[17px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
