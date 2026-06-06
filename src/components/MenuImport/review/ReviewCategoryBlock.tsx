"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ImportCategory } from "@/types/menuImport";
import { importRefDomId } from "@/lib/menuImport/importRefDomId";
import ReviewItemRow from "./ReviewItemRow";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoTrashOutline,
  IoAddCircleOutline,
} from "react-icons/io5";

interface ReviewCategoryBlockProps {
  category: ImportCategory;
  currency: string;
  locale: string;
  scrollTargetRefId?: string | null;
  onUpdateCategory: (patch: Partial<ImportCategory>) => void;
  onUpdateItem: (
    itemId: string,
    patch: Partial<ImportCategory["items"][0]>,
  ) => void;
  onUpdateVariant: (
    itemId: string,
    variantId: string,
    patch: Partial<ImportCategory["items"][0]["variants"][0]>,
  ) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteCategory: () => void;
  onAddItem: () => void;
  onAddVariant: (itemId: string) => void;
  onRemoveVariant: (itemId: string, variantId: string) => void;
  onItemImage: (itemId: string, imageUrl: string | undefined) => void;
  onResolveDuplicate: (
    itemId: string,
    resolution: "skip" | "update_price",
    variantId?: string,
  ) => void;
}

export default function ReviewCategoryBlock({
  category,
  currency,
  locale,
  scrollTargetRefId,
  onUpdateCategory,
  onUpdateItem,
  onUpdateVariant,
  onDeleteItem,
  onDeleteCategory,
  onAddItem,
  onAddVariant,
  onRemoveVariant,
  onItemImage,
  onResolveDuplicate,
}: ReviewCategoryBlockProps) {
  const t = useTranslations("MenuImport");
  const uiLocale = useLocale();
  const [collapsed, setCollapsed] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const missingFieldClass =
    "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600";
  const normalFieldClass =
    "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50";
  const hasMissingName =
    category.flags.includes("missing_name_ar") ||
    category.flags.includes("missing_name_en") ||
    category.flags.includes("needs_review");

  useEffect(() => {
    if (!scrollTargetRefId) return;

    const matches =
      scrollTargetRefId === category.id ||
      category.items.some(
        (item) =>
          item.id === scrollTargetRefId ||
          item.variants.some((variant) => variant.id === scrollTargetRefId),
      );

    if (matches) setCollapsed(false);
  }, [scrollTargetRefId, category]);

  return (
    <>
      <section
        id={importRefDomId(category.id)}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden scroll-mt-24"
      >
        <div
          className={`flex items-start gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 ${hasMissingName ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="mt-2 text-slate-400 hover:text-slate-600 shrink-0"
          >
            {collapsed ? (
              <IoChevronDownOutline className="text-xl" />
            ) : (
              <IoChevronUpOutline className="text-xl" />
            )}
          </button>
          <div className="flex-1 min-w-0 space-y-2">
            {category.matchedCategoryId && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {t("categoryReusedExisting")}
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={category.nameAr}
              onChange={(e) => onUpdateCategory({ nameAr: e.target.value })}
              placeholder={t("nameAr")}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                !category.nameAr.trim() &&
                (category.flags.includes("missing_name_ar") ||
                  category.flags.includes("needs_review"))
                  ? missingFieldClass
                  : normalFieldClass
              }`}
              dir="rtl"
            />
            <input
              type="text"
              value={category.nameEn}
              onChange={(e) => onUpdateCategory({ nameEn: e.target.value })}
              placeholder={t("nameEn")}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                !category.nameEn.trim() &&
                (category.flags.includes("missing_name_en") ||
                  category.flags.includes("needs_review"))
                  ? missingFieldClass
                  : normalFieldClass
              }`}
              dir="ltr"
            />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
            title={t("deleteCategory")}
          >
            <IoTrashOutline className="text-lg" />
          </button>
        </div>

        {!collapsed && (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {category.items.map((item) => (
              <ReviewItemRow
                key={item.id}
                item={item}
                currency={currency}
                locale={locale}
                uiLocale={uiLocale}
                onUpdate={(patch) => onUpdateItem(item.id, patch)}
                onUpdateVariant={(variantId, patch) =>
                  onUpdateVariant(item.id, variantId, patch)
                }
                onDelete={() => onDeleteItem(item.id)}
                onAddVariant={() => onAddVariant(item.id)}
                onRemoveVariant={(variantId) =>
                  onRemoveVariant(item.id, variantId)
                }
                onImageChange={(url) => onItemImage(item.id, url)}
                onResolveDuplicate={(resolution, variantId) =>
                  onResolveDuplicate(item.id, resolution, variantId)
                }
              />
            ))}
            {category.items.length === 0 && (
              <p className="px-5 py-4 text-sm text-slate-400 text-center">
                {t("emptyCategory")}
              </p>
            )}
            <div className="px-5 py-3">
              <button
                type="button"
                onClick={onAddItem}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <IoAddCircleOutline className="text-base" />
                {t("addItem")}
              </button>
            </div>
          </div>
        )}
      </section>

      {confirmDelete && (
        <ConfirmationModal
          isOpen={confirmDelete}
          title={t("deleteCategoryConfirmTitle")}
          message={t("deleteCategoryConfirmMsg", {
            count: category.items.length,
          })}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          onConfirm={() => {
            onDeleteCategory();
            setConfirmDelete(false);
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
