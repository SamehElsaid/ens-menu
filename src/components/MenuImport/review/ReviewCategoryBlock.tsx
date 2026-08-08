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
import { FiAlertTriangle } from "react-icons/fi";
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoTrashOutline,
  IoAddCircleOutline,
  IoImageOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Spinner,
  focusRing,
} from "@/components/ui";

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
  const tCommon = useTranslations("common");
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

  const hasMissingName =
    category.flags.includes("missing_name_ar") ||
    category.flags.includes("missing_name_en") ||
    category.flags.includes("needs_review");

  const missingNameAr =
    !category.nameAr.trim() &&
    (category.flags.includes("missing_name_ar") ||
      category.flags.includes("needs_review"));
  const missingNameEn =
    !category.nameEn.trim() &&
    (category.flags.includes("missing_name_en") ||
      category.flags.includes("needs_review"));

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
        className="scroll-mt-24 overflow-hidden rounded-xl border border-line bg-surface"
      >
        <div
          className={cn(
            "flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5",
            hasMissingName && "bg-warning-soft/50",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? tCommon("showMore") : tCommon("showLess")}
            className="mt-1"
          >
            {collapsed ? (
              <IoChevronDownOutline className="text-xl" />
            ) : (
              <IoChevronUpOutline className="text-xl" />
            )}
          </Button>

          <div className="flex shrink-0 items-start gap-2">
            <button
              type="button"
              disabled={isImageBusy}
              onClick={() => setPexelsModalOpen(true)}
              aria-label={
                displayImageUrl ? t("replaceImage") : t("addImage")
              }
              className={cn(
                "relative flex size-[4.5rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl",
                "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-80",
                focusRing,
                displayImageUrl
                  ? "border border-line bg-surface-2 hover:border-brand"
                  : "border border-dashed border-brand-line bg-brand-soft/50 hover:border-brand hover:bg-brand-soft",
              )}
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
                  <IoImageOutline
                    className="text-lg text-brand-soft-fg"
                    aria-hidden
                  />
                  <span className="mt-0.5 text-[9px] font-semibold leading-none text-brand-soft-fg">
                    {t("addImage")}
                  </span>
                </>
              )}
              {isImageLoading && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55">
                  <Spinner size="md" className="text-white" />
                  <span className="px-1 text-center text-[8px] font-semibold leading-none text-white">
                    {t("uploadingImage")}
                  </span>
                </span>
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
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                aria-label={t("removeImage")}
                onClick={() => {
                  setLocalPreview(null);
                  onUpdateCategory({ imageUrl: undefined });
                }}
              >
                <IoCloseOutline />
              </Button>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {category.matchedCategoryId && (
              <Badge tone="success" className="self-start">
                {t("categoryReusedExisting")}
              </Badge>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                inputSize="sm"
                value={category.nameAr}
                onChange={(e) => onUpdateCategory({ nameAr: e.target.value })}
                placeholder={t("nameAr")}
                aria-label={t("nameAr")}
                aria-invalid={missingNameAr || undefined}
                dir="rtl"
              />
              <Input
                inputSize="sm"
                value={category.nameEn}
                onChange={(e) => onUpdateCategory({ nameEn: e.target.value })}
                placeholder={t("nameEn")}
                aria-label={t("nameEn")}
                aria-invalid={missingNameEn || undefined}
                dir="ltr"
              />
            </div>
          </div>

          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            onClick={() => setConfirmDelete(true)}
            aria-label={t("deleteCategory")}
            title={t("deleteCategory")}
            className="mt-1"
          >
            <IoTrashOutline className="text-lg" />
          </Button>
        </div>

        {!collapsed && (
          <div>
            {category.items.map((item) => (
              <div key={item.id} className="border-b border-line last:border-b-0">
                <ReviewItemRow
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
              </div>
            ))}
            {category.items.length === 0 && (
              <div className="px-4 py-4 sm:px-5">
                <EmptyState size="sm" title={t("emptyCategory")} />
              </div>
            )}
            <div className="px-4 py-3 sm:px-5">
              <Button
                variant="link"
                size="sm"
                onClick={onAddItem}
                startIcon={<IoAddCircleOutline className="text-base" />}
              >
                {t("addItem")}
              </Button>
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
        <ConfirmDialog
          open={confirmDelete}
          title={t("deleteCategoryConfirmTitle")}
          description={t("deleteCategoryConfirmMsg", {
            count: category.items.length,
          })}
          confirmLabel={t("delete")}
          cancelLabel={t("cancel")}
          onConfirm={() => {
            onDeleteCategory();
            setConfirmDelete(false);
          }}
          onClose={() => setConfirmDelete(false)}
          tone="brand"
          icon={<FiAlertTriangle />}
        />
      )}
    </>
  );
}
