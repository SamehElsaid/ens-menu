"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import type { ImportItem, ImportVariant } from "@/types/menuImport";
import type { PexelsPhoto } from "@/types/pexels";
import LoadImage from "@/components/ImageLoad";
import {
  getPexelsPhotoUrl,
  getPexelsSearchQuery,
  uploadImportItemImageFile,
} from "@/lib/menuImport/pexelsImportImage";
import { importRefDomId } from "@/lib/menuImport/importRefDomId";
import PexelsImagePickerModal from "./PexelsImagePickerModal";
import {
  IoTrashOutline,
  IoImageOutline,
  IoAddCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";

function getVariantLabelAr(variant: ImportVariant): string {
  return variant.labelAr ?? (variant.labelEn ? "" : variant.label ?? "");
}

function getVariantLabelEn(variant: ImportVariant): string {
  return variant.labelEn ?? (variant.labelAr ? "" : variant.label ?? "");
}

function syncVariantLabel(
  variant: ImportVariant,
  patch: { labelAr?: string; labelEn?: string },
): Pick<ImportVariant, "labelAr" | "labelEn" | "label"> {
  const labelAr = patch.labelAr ?? getVariantLabelAr(variant);
  const labelEn = patch.labelEn ?? getVariantLabelEn(variant);
  return {
    ...patch,
    label: labelAr || labelEn || "",
  };
}

interface ReviewItemRowProps {
  item: ImportItem;
  currency: string;
  locale: string;
  uiLocale: string;
  onUpdate: (patch: Partial<ImportItem>) => void;
  onUpdateVariant: (
    variantId: string,
    patch: Partial<ImportItem["variants"][0]>,
  ) => void;
  onDelete: () => void;
  onAddVariant: () => void;
  onRemoveVariant: (variantId: string) => void;
  onImageChange: (url: string | undefined) => void;
  onResolveDuplicate: (
    resolution: "skip" | "update_price",
    variantId?: string,
  ) => void;
}

export default function ReviewItemRow({
  item,
  currency,
  locale,
  uiLocale,
  onUpdate,
  onUpdateVariant,
  onDelete,
  onAddVariant,
  onRemoveVariant,
  onImageChange,
  onResolveDuplicate,
}: ReviewItemRowProps) {
  const t = useTranslations("MenuImport");
  const fileRef = useRef<HTMLInputElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pexelsModalOpen, setPexelsModalOpen] = useState(false);

  const IMAGE_VALID_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ] as const;

  const hasMissingPrice =
    item.flags.includes("missing_price") ||
    item.variants.some((v) => v.flags.includes("missing_price"));
  const hasMissingName =
    item.flags.includes("missing_name_ar") ||
    item.flags.includes("missing_name_en") ||
    item.flags.includes("needs_review") ||
    item.variants.some(
      (v) =>
        v.flags.includes("missing_name_ar") ||
        v.flags.includes("missing_name_en"),
    );

  const hasDuplicate =
    item.flags.includes("duplicate") ||
    item.variants.some((v) => v.flags.includes("duplicate"));
  const hasPriceConflict =
    item.flags.includes("price_conflict") ||
    item.variants.some((v) => v.flags.includes("price_conflict"));

  const missingFieldClass =
    "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600";
  const normalFieldClass =
    "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800";

  const uploadImageFile = async (file: File) => {
    if (!IMAGE_VALID_TYPES.includes(file.type as (typeof IMAGE_VALID_TYPES)[number])) {
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
        onImageChange(imageUrl);
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

  const handleImageUpload = async (file: File) => {
    await uploadImageFile(file);
  };

  const handlePexelsPhotoSelect = async (photo: PexelsPhoto) => {
    onImageChange(getPexelsPhotoUrl(photo));
  };

  const defaultImageSearchQuery = getPexelsSearchQuery(item);

  const ITEM_THUMB_SIZE = 72;

  const displayImageUrl = item.imageUrl ?? localPreview;
  const showLoadingOverlay = !displayImageUrl && isImageLoading;
  const isImageBusy = isImageLoading;
  const showResizedThumb =
    Boolean(displayImageUrl) &&
    !displayImageUrl!.startsWith("data:") &&
    !displayImageUrl!.startsWith("blob:");

  return (
    <div
      id={importRefDomId(item.id)}
      className={`px-5 py-4 space-y-3 scroll-mt-24 ${hasMissingPrice || hasMissingName || hasPriceConflict ? "bg-amber-50/50 dark:bg-amber-900/10" : hasDuplicate ? "bg-slate-50/80 dark:bg-slate-800/50" : ""}`}
    >
      {item.variants.length === 0 &&
        item.duplicateMeta?.status === "exact_duplicate" && (
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 rounded-lg px-3 py-2">
            {t("duplicateExactSkip")}
          </p>
        )}

      {item.variants.length === 0 &&
        item.flags.includes("price_conflict") &&
        item.duplicateMeta && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 space-y-2">
            <p className="text-xs text-amber-900 dark:text-amber-200">
              {t("duplicatePriceConflict", {
                existing: item.duplicateMeta.existingPrice ?? 0,
                newPrice: item.price ?? 0,
                currency,
              })}
            </p>
            {item.duplicateMeta.resolution ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {item.duplicateMeta.resolution === "update_price"
                  ? t("duplicateResolutionUpdate")
                  : t("duplicateResolutionSkip")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onResolveDuplicate("update_price")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white font-medium"
                >
                  {t("duplicateUpdatePrice")}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveDuplicate("skip")}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                >
                  {t("duplicateSkip")}
                </button>
              </div>
            )}
          </div>
        )}

      <div className="flex flex-col lg:flex-row gap-3">
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
                  width={ITEM_THUMB_SIZE}
                  height={ITEM_THUMB_SIZE}
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
            {showLoadingOverlay && (
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
              if (f) void handleImageUpload(f);
              e.target.value = "";
            }}
          />
          {displayImageUrl && !isImageBusy && (
            <button
              type="button"
              onClick={() => {
                setLocalPreview(null);
                onImageChange(undefined);
              }}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              <IoCloseOutline />
            </button>
          )}
        </div>

        <div className="flex-1 grid sm:grid-cols-2 gap-2 min-w-0">
          <input
            type="text"
            value={item.nameAr}
            onChange={(e) => onUpdate({ nameAr: e.target.value })}
            placeholder={t("nameAr")}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${
              !item.nameAr.trim() &&
              (item.flags.includes("missing_name_ar") ||
                item.flags.includes("needs_review"))
                ? missingFieldClass
                : normalFieldClass
            }`}
            dir="rtl"
          />
          <input
            type="text"
            value={item.nameEn}
            onChange={(e) => onUpdate({ nameEn: e.target.value })}
            placeholder={t("nameEn")}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${
              !item.nameEn.trim() &&
              (item.flags.includes("missing_name_en") ||
                item.flags.includes("needs_review"))
                ? missingFieldClass
                : normalFieldClass
            }`}
            dir="ltr"
          />
          <textarea
            value={item.descriptionAr ?? ""}
            onChange={(e) => onUpdate({ descriptionAr: e.target.value })}
            placeholder={t("descriptionAr")}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border text-sm resize-y min-h-[4.5rem] ${normalFieldClass}`}
            dir="rtl"
          />
          <textarea
            value={item.descriptionEn ?? ""}
            onChange={(e) => onUpdate({ descriptionEn: e.target.value })}
            placeholder={t("descriptionEn")}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border text-sm resize-y min-h-[4.5rem] ${normalFieldClass}`}
            dir="ltr"
          />
        </div>

        {item.variants.length === 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.price ?? ""}
              onChange={(e) =>
                onUpdate({
                  price:
                    e.target.value === ""
                      ? null
                      : Number.parseFloat(e.target.value),
                })
              }
              placeholder={t("price")}
              className={`w-28 px-3 py-2 rounded-lg border text-sm tabular-nums ${
                item.price === null
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                  : "border-slate-200 dark:border-slate-600"
              }`}
            />
            <span className="text-xs text-slate-500">{currency}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 self-start"
          title={t("deleteItem")}
        >
          <IoTrashOutline className="text-lg" />
        </button>
      </div>

      {item.variants.length > 0 && (
        <div className="space-y-2 ps-2 border-s-2 border-slate-100 dark:border-slate-700">
          {item.variants.map((variant) => (
            <div
              key={variant.id}
              id={importRefDomId(variant.id)}
              className="space-y-2 scroll-mt-24"
            >
              {variant.duplicateMeta?.status === "exact_duplicate" && (
                <p className="text-xs text-slate-500">
                  {t("duplicateExactSkip")}
                </p>
              )}
              {variant.flags.includes("price_conflict") &&
                variant.duplicateMeta && (
                  <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-2 space-y-2">
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      {t("duplicatePriceConflict", {
                        existing: variant.duplicateMeta.existingPrice ?? 0,
                        newPrice: variant.price ?? 0,
                        currency,
                      })}
                    </p>
                    {!variant.duplicateMeta.resolution ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onResolveDuplicate("update_price", variant.id)
                          }
                          className="text-xs px-2 py-1 rounded-lg bg-primary text-white"
                        >
                          {t("duplicateUpdatePrice")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolveDuplicate("skip", variant.id)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600"
                        >
                          {t("duplicateSkip")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={getVariantLabelAr(variant)}
                    onChange={(e) =>
                      onUpdateVariant(
                        variant.id,
                        syncVariantLabel(variant, { labelAr: e.target.value }),
                      )
                    }
                    placeholder={t("nameAr")}
                    className={`w-full px-2 py-1.5 rounded-lg border text-sm ${
                      variant.flags.includes("missing_name_ar")
                        ? missingFieldClass
                        : "border-slate-200 dark:border-slate-600"
                    }`}
                    dir="rtl"
                  />
                  <input
                    type="text"
                    value={getVariantLabelEn(variant)}
                    onChange={(e) =>
                      onUpdateVariant(
                        variant.id,
                        syncVariantLabel(variant, { labelEn: e.target.value }),
                      )
                    }
                    placeholder={t("nameEn")}
                    className={`w-full px-2 py-1.5 rounded-lg border text-sm ${
                      variant.flags.includes("missing_name_en")
                        ? missingFieldClass
                        : "border-slate-200 dark:border-slate-600"
                    }`}
                    dir="ltr"
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={variant.price ?? ""}
                  onChange={(e) =>
                    onUpdateVariant(variant.id, {
                      price:
                        e.target.value === ""
                          ? null
                          : Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder={t("price")}
                  className={`w-24 px-2 py-1.5 rounded-lg border text-sm tabular-nums ${
                    variant.price === null
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                      : "border-slate-200 dark:border-slate-600"
                  }`}
                />
                <span className="text-xs text-slate-500">{currency}</span>
                <button
                  type="button"
                  onClick={() => onRemoveVariant(variant.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <IoCloseOutline />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddVariant}
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            <IoAddCircleOutline />
            {t("addVariant")}
          </button>
        </div>
      )}

      {item.variants.length === 0 && (
        <button
          type="button"
          onClick={onAddVariant}
          className="text-xs text-slate-500 hover:text-primary inline-flex items-center gap-1"
        >
          <IoAddCircleOutline />
          {t("addVariant")}
        </button>
      )}

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
    </div>
  );
}
