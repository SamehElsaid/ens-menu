"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import type { ImportCategory } from "@/types/menuImport";
import type { PexelsPhoto } from "@/types/pexels";
import LoadImage from "@/components/ImageLoad";
import {
  getCategoryPexelsSearchQuery,
  getPexelsPhotoUrl,
  uploadImportItemImageFile,
} from "@/lib/menuImport/pexelsImportImage";
import { importRefDomId } from "@/lib/menuImport/importRefDomId";
import ReviewItemRow from "./ReviewItemRow";
import PexelsImagePickerModal from "./PexelsImagePickerModal";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoTrashOutline,
  IoAddCircleOutline,
  IoImageOutline,
  IoCloseOutline,
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pexelsModalOpen, setPexelsModalOpen] = useState(false);

  const IMAGE_VALID_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ] as const;

  const CATEGORY_THUMB_SIZE = 72;

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

  const uploadImageFile = async (file: File) => {
    if (
      !IMAGE_VALID_TYPES.includes(file.type as (typeof IMAGE_VALID_TYPES)[number])
    ) {
      toast.error(t("invalidFileType"));
      return;
    }

    setIsImageLoading(true);
    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("preview_failed"));
        reader.readAsDataURL(file);
      });
      setLocalPreview(previewUrl);

      const imageUrl = await uploadImportItemImageFile(file, locale);
      if (imageUrl) {
        onUpdateCategory({ imageUrl });
        setLocalPreview(null);
      } else {
        toast.error(t("imageUploadError"));
        setLocalPreview(null);
      }
    } catch {
      toast.error(t("imageUploadError"));
      setLocalPreview(null);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handlePexelsPhotoSelect = async (photo: PexelsPhoto) => {
    onUpdateCategory({ imageUrl: getPexelsPhotoUrl(photo) });
    setLocalPreview(null);
  };

  const defaultImageSearchQuery = getCategoryPexelsSearchQuery(category);
  const displayImageUrl = category.imageUrl ?? localPreview;
  const isImageBusy = isImageLoading;
  const showResizedThumb =
    Boolean(displayImageUrl) &&
    !displayImageUrl!.startsWith("data:") &&
    !displayImageUrl!.startsWith("blob:");

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
          <div className="flex items-start gap-3 shrink-0">
            <button
              type="button"
              disabled={isImageBusy}
              onClick={() => setPexelsModalOpen(true)}
              className={`relative w-[4.5rem] h-[4.5rem] rounded-xl flex flex-col items-center justify-center overflow-hidden shrink-0 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-80 ${
                displayImageUrl
                  ? "border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-primary"
                  : "border-2 border-dashed border-primary/35 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/60"
              }`}
            >
              {displayImageUrl ? (
                showResizedThumb ? (
                  <LoadImage
                    src={displayImageUrl}
                    alt=""
                    width={CATEGORY_THUMB_SIZE}
                    height={CATEGORY_THUMB_SIZE}
                    cover
                    disableLazy
                    className="h-full w-full object-cover"
                    wrapperClassName="!block h-full w-full"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <>
                  <IoImageOutline className="text-lg text-primary" />
                  <span className="text-[9px] font-semibold text-primary mt-0.5 leading-none">
                    {t("addImage")}
                  </span>
                </>
              )}
              {isImageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[1px]">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-[8px] font-semibold text-white mt-1 leading-none px-1 text-center">
                    {t("uploadingImage")}
                  </span>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={isImageBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImageFile(f);
                e.target.value = "";
              }}
            />
            {displayImageUrl && !isImageBusy && (
              <button
                type="button"
                onClick={() => {
                  setLocalPreview(null);
                  onUpdateCategory({ imageUrl: undefined });
                }}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                <IoCloseOutline />
              </button>
            )}
          </div>
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

      <PexelsImagePickerModal
        open={pexelsModalOpen}
        defaultQuery={defaultImageSearchQuery}
        isUploading={isImageBusy}
        onClose={() => setPexelsModalOpen(false)}
        onUploadFromDevice={() => {
          setPexelsModalOpen(false);
          fileRef.current?.click();
        }}
        onSelectPhoto={handlePexelsPhotoSelect}
      />

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
