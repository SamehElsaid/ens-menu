"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  IoEllipsisHorizontal,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Menu as DropdownMenu,
  MenuItem,
  MenuSeparator,
  Spinner,
  focusRing,
} from "@/components/ui";

interface ReviewCategoryBlockProps {
  category: ImportCategory;
  /** Position in the parse. Shown on the header as the section's ordinal. */
  index: number;
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

/**
 * One parsed category, as a section of the review ledger.
 *
 * It carries no border or radius of its own any more: `ReviewStep` rules the
 * categories against each other, so this is a header row and a list of item
 * rows inside a shared panel rather than another floating card. The header used
 * to hold four equal-weight controls — collapse, photo, clear photo, delete —
 * next to two text fields; the rare and destructive ones now sit behind one
 * overflow menu, which leaves the header saying what the category is instead of
 * offering four things to do to it.
 */
export default function ReviewCategoryBlock({
  category,
  index,
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
      !IMAGE_VALID_TYPES.includes(
        file.type as (typeof IMAGE_VALID_TYPES)[number],
      )
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

  const categoryLabel =
    category.nameEn || category.nameAr || t("categoryMenuLabel");

  const handleAddItem = () => {
    setCollapsed(false);
    onAddItem();
  };

  return (
    <>
      <section
        id={importRefDomId(category.id)}
        className={cn(
          "scroll-mt-24 first:rounded-t-xl",
          hasMissingName && "bg-warning-soft/40",
        )}
      >
        <div className="flex items-start gap-2 px-3 py-3 sm:px-4">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? tCommon("showMore") : tCommon("showLess")}
          >
            {collapsed ? (
              <IoChevronDownOutline className="text-lg" />
            ) : (
              <IoChevronUpOutline className="text-lg" />
            )}
          </Button>

          <button
            type="button"
            disabled={isImageBusy}
            onClick={() => setPexelsModalOpen(true)}
            aria-label={displayImageUrl ? t("replaceImage") : t("addImage")}
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm",
              "transition-[border-color] duration-(--dur-fast) ease-(--ease-settle) disabled:pointer-events-none",
              focusRing,
              displayImageUrl
                ? "border border-line bg-surface-2 hover:border-fg-subtle"
                : "border border-dashed border-line-strong bg-surface-2 hover:border-fg-subtle",
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
              <IoImageOutline className="text-lg text-fg-subtle" aria-hidden />
            )}
            {isImageLoading && (
              <span className="absolute inset-0 flex items-center justify-center bg-surface/85">
                <Spinner size="sm" className="text-fg-muted" />
                <span className="sr-only">{t("uploadingImage")}</span>
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

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="ui-figure text-[11px] text-fg-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="ui-label">
                {t("itemsInCategory", { count: category.items.length })}
              </span>
              {category.matchedCategoryId && (
                <Badge tone="success" dot>
                  {t("categoryReusedExisting")}
                </Badge>
              )}
            </div>

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

          <DropdownMenu
            label={categoryLabel}
            trigger={(props) => (
              <Button
                {...props}
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={categoryLabel}
              >
                <IoEllipsisHorizontal className="size-4" />
              </Button>
            )}
          >
            <MenuItem icon={<IoAddCircleOutline />} onClick={handleAddItem}>
              {t("addItem")}
            </MenuItem>
            <MenuItem
              icon={<IoImageOutline />}
              onClick={() => setPexelsModalOpen(true)}
              disabled={isImageBusy}
            >
              {displayImageUrl ? t("replaceImage") : t("addImage")}
            </MenuItem>
            {displayImageUrl && !isImageBusy ? (
              <MenuItem
                icon={<IoCloseOutline />}
                onClick={() => {
                  setLocalPreview(null);
                  onUpdateCategory({ imageUrl: undefined });
                }}
              >
                {t("removeImage")}
              </MenuItem>
            ) : null}
            <MenuSeparator />
            <MenuItem
              icon={<IoTrashOutline />}
              tone="danger"
              onClick={() => setConfirmDelete(true)}
            >
              {t("deleteCategory")}
            </MenuItem>
          </DropdownMenu>
        </div>

        {!collapsed && (
          <div className="border-t border-line">
            {category.items.length === 0 ? (
              <div className="px-3 py-3 sm:px-4">
                <EmptyState size="sm" title={t("emptyCategory")} />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <ReviewItemRow
                      item={item}
                      currency={currency}
                      locale={locale}
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
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-line bg-surface-2/40 px-3 py-1.5 sm:px-4">
              <Button
                variant="link"
                size="sm"
                onClick={handleAddItem}
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
