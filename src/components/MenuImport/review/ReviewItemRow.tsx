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
  IoCopyOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoEllipsisHorizontal,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Alert,
  Badge,
  Button,
  Input,
  Menu as DropdownMenu,
  MenuItem,
  MenuSeparator,
  Spinner,
  Textarea,
  focusRing,
} from "@/components/ui";

function getVariantLabelAr(variant: ImportVariant): string {
  return variant.labelAr ?? (variant.labelEn ? "" : (variant.label ?? ""));
}

function getVariantLabelEn(variant: ImportVariant): string {
  return variant.labelEn ?? (variant.labelAr ? "" : (variant.label ?? ""));
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

/**
 * One parsed dish, as an editable ticket line.
 *
 * The row used to open with six controls and four text areas all at the same
 * weight, which made a category of twelve dishes a wall of boxes. It now leads
 * with what identifies the line — the photo, the two names and the price — and
 * everything else steps back: the descriptions fold away unless they already
 * hold text, and the photo, variant and delete actions sit behind a single
 * overflow menu. The price keeps the ticket face because it is the figure the
 * row exists to get right.
 */
export default function ReviewItemRow({
  item,
  currency,
  locale,
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
  const [showDescriptions, setShowDescriptions] = useState(
    Boolean(item.descriptionAr?.trim() || item.descriptionEn?.trim()),
  );
  const sizeOptions = item.sizes ?? [];
  const allOptions = [...sizeOptions, ...item.variants];

  const IMAGE_VALID_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ] as const;

  const hasMissingPrice =
    item.flags.includes("missing_price") ||
    allOptions.some((v) => v.flags.includes("missing_price"));
  const hasMissingName =
    item.flags.includes("missing_name_ar") ||
    item.flags.includes("missing_name_en") ||
    item.flags.includes("needs_review") ||
    allOptions.some(
      (v) =>
        v.flags.includes("missing_name_ar") ||
        v.flags.includes("missing_name_en"),
    );

  const hasDuplicate =
    item.flags.includes("duplicate") ||
    allOptions.some((v) => v.flags.includes("duplicate"));
  const hasPriceConflict =
    item.flags.includes("price_conflict") ||
    allOptions.some((v) => v.flags.includes("price_conflict"));

  const missingNameAr =
    !item.nameAr.trim() &&
    (item.flags.includes("missing_name_ar") ||
      item.flags.includes("needs_review"));
  const missingNameEn =
    !item.nameEn.trim() &&
    (item.flags.includes("missing_name_en") ||
      item.flags.includes("needs_review"));

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

  const itemLabel = item.nameEn || item.nameAr || t("itemMenuLabel");

  const currencySuffix = <span className="ui-label">{currency}</span>;

  const resolutionButton = (
    resolution: "skip" | "update_price",
    label: string,
    active: boolean,
    variantId?: string,
  ) => (
    <Button
      variant={active ? "primary" : "secondary"}
      size="xs"
      onClick={() => onResolveDuplicate(resolution, variantId)}
    >
      {label}
    </Button>
  );

  const handleAddVariant = () => {
    onAddVariant();
  };

  return (
    <div
      id={importRefDomId(item.id)}
      className={cn(
        "flex scroll-mt-24 flex-col gap-2 px-3 py-2.5 sm:px-4",
        hasMissingPrice || hasMissingName || hasPriceConflict
          ? "bg-warning-soft/40"
          : hasDuplicate && "bg-surface-2",
      )}
    >
      {sizeOptions.length === 0 &&
        item.duplicateMeta?.status === "exact_duplicate" && (
          <Badge className="self-start" icon={<IoCopyOutline aria-hidden />}>
            {t("duplicateExactSkip")}
          </Badge>
        )}

      {sizeOptions.length === 0 &&
        item.flags.includes("price_conflict") &&
        item.duplicateMeta && (
          <Alert tone="warning">
            <div className="flex flex-col gap-2">
              <p>
                {t("duplicatePriceConflict", {
                  existing: item.duplicateMeta.existingPrice ?? 0,
                  newPrice: item.price ?? 0,
                  currency,
                })}
              </p>
              {item.duplicateMeta.resolution && (
                <p className="font-medium text-success">
                  {item.duplicateMeta.resolution === "update_price"
                    ? t("duplicateResolutionUpdate")
                    : t("duplicateResolutionSkip")}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {resolutionButton(
                  "update_price",
                  t("duplicateUpdatePrice"),
                  item.duplicateMeta.resolution === "update_price",
                )}
                {resolutionButton(
                  "skip",
                  t("duplicateSkip"),
                  item.duplicateMeta.resolution === "skip",
                )}
              </div>
            </div>
          </Alert>
        )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
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
              <IoImageOutline className="text-lg text-fg-subtle" aria-hidden />
            )}
            {showLoadingOverlay && (
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
              if (f) void handleImageUpload(f);
              e.target.value = "";
            }}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                inputSize="sm"
                value={item.nameAr}
                onChange={(e) => onUpdate({ nameAr: e.target.value })}
                placeholder={t("nameAr")}
                aria-label={t("nameAr")}
                aria-invalid={missingNameAr || undefined}
                dir="rtl"
              />
              <Input
                inputSize="sm"
                value={item.nameEn}
                onChange={(e) => onUpdate({ nameEn: e.target.value })}
                placeholder={t("nameEn")}
                aria-label={t("nameEn")}
                aria-invalid={missingNameEn || undefined}
                dir="ltr"
              />
            </div>

            {/* Descriptions are optional copy, so they fold away unless the
                parse already found some — a category of twelve dishes should
                not open as twenty-four text areas. */}
            <Button
              variant="link"
              size="xs"
              onClick={() => setShowDescriptions((v) => !v)}
              aria-expanded={showDescriptions}
              endIcon={
                showDescriptions ? (
                  <IoChevronUpOutline />
                ) : (
                  <IoChevronDownOutline />
                )
              }
              className="self-start"
            >
              {t("itemDescriptions")}
            </Button>

            {showDescriptions ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Textarea
                  value={item.descriptionAr ?? ""}
                  onChange={(e) => onUpdate({ descriptionAr: e.target.value })}
                  placeholder={t("descriptionAr")}
                  aria-label={t("descriptionAr")}
                  rows={2}
                  dir="rtl"
                />
                <Textarea
                  value={item.descriptionEn ?? ""}
                  onChange={(e) => onUpdate({ descriptionEn: e.target.value })}
                  placeholder={t("descriptionEn")}
                  aria-label={t("descriptionEn")}
                  rows={2}
                  dir="ltr"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-2 ps-14 sm:shrink-0 sm:ps-0">
          {sizeOptions.length === 0 && (
            <Input
              inputSize="sm"
              type="number"
              min={0}
              step="0.01"
              value={
                item.duplicateMeta?.resolution === "skip" &&
                item.duplicateMeta.existingPrice != null
                  ? item.duplicateMeta.existingPrice
                  : (item.price ?? "")
              }
              disabled={item.duplicateMeta?.resolution === "skip"}
              onChange={(e) =>
                onUpdate({
                  price:
                    e.target.value === ""
                      ? null
                      : Number.parseFloat(e.target.value),
                })
              }
              placeholder={t("price")}
              aria-label={t("price")}
              aria-invalid={item.price === null || undefined}
              endIcon={currencySuffix}
              className="ui-figure"
              wrapperClassName="w-full sm:w-36"
            />
          )}

          <DropdownMenu
            label={itemLabel}
            trigger={(props) => (
              <Button
                {...props}
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={itemLabel}
              >
                <IoEllipsisHorizontal className="size-4" />
              </Button>
            )}
          >
            <MenuItem icon={<IoAddCircleOutline />} onClick={handleAddVariant}>
              {t("addVariant")}
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
                  onImageChange(undefined);
                }}
              >
                {t("removeImage")}
              </MenuItem>
            ) : null}
            <MenuSeparator />
            <MenuItem
              icon={<IoTrashOutline />}
              tone="danger"
              onClick={onDelete}
            >
              {t("deleteItem")}
            </MenuItem>
          </DropdownMenu>
        </div>
      </div>

      {allOptions.length > 0 && (
        /* Variants are a sub-ledger indented to the item's own text column, so
           three sizes of one dish read as three lines of one ticket rather
           than as three more dishes. */
        <div className="sm:ps-14">
          <p className="ui-label">{t("variantLabel")}</p>
          <ul className="mt-1 divide-y divide-line border-y border-line">
            {allOptions.map((variant) => (
              <li
                key={variant.id}
                id={importRefDomId(variant.id)}
                className="flex scroll-mt-24 flex-col gap-2 py-2"
              >
                {variant.duplicateMeta?.status === "exact_duplicate" && (
                  <p className="text-xs text-fg-muted">
                    {t("duplicateExactSkip")}
                  </p>
                )}
                {variant.flags.includes("price_conflict") &&
                  variant.duplicateMeta && (
                    <Alert tone="warning">
                      <div className="flex flex-col gap-2">
                        <p>
                          {t("duplicatePriceConflict", {
                            existing: variant.duplicateMeta.existingPrice ?? 0,
                            newPrice: variant.price ?? 0,
                            currency,
                          })}
                        </p>
                        {variant.duplicateMeta.resolution && (
                          <p className="font-medium text-success">
                            {variant.duplicateMeta.resolution === "update_price"
                              ? t("duplicateResolutionUpdate")
                              : t("duplicateResolutionSkip")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {resolutionButton(
                            "update_price",
                            t("duplicateUpdatePrice"),
                            variant.duplicateMeta.resolution === "update_price",
                            variant.id,
                          )}
                          {resolutionButton(
                            "skip",
                            t("duplicateSkip"),
                            variant.duplicateMeta.resolution === "skip",
                            variant.id,
                          )}
                        </div>
                      </div>
                    </Alert>
                  )}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="grid min-w-[200px] flex-1 grid-cols-2 gap-2">
                    <Input
                      inputSize="sm"
                      value={getVariantLabelAr(variant)}
                      onChange={(e) =>
                        onUpdateVariant(
                          variant.id,
                          syncVariantLabel(variant, {
                            labelAr: e.target.value,
                          }),
                        )
                      }
                      placeholder={t("nameAr")}
                      aria-label={t("nameAr")}
                      aria-invalid={
                        variant.flags.includes("missing_name_ar") || undefined
                      }
                      dir="rtl"
                    />
                    <Input
                      inputSize="sm"
                      value={getVariantLabelEn(variant)}
                      onChange={(e) =>
                        onUpdateVariant(
                          variant.id,
                          syncVariantLabel(variant, {
                            labelEn: e.target.value,
                          }),
                        )
                      }
                      placeholder={t("nameEn")}
                      aria-label={t("nameEn")}
                      aria-invalid={
                        variant.flags.includes("missing_name_en") || undefined
                      }
                      dir="ltr"
                    />
                  </div>
                  <Input
                    inputSize="sm"
                    type="number"
                    min={0}
                    step="0.01"
                    value={
                      variant.duplicateMeta?.resolution === "skip" &&
                      variant.duplicateMeta.existingPrice != null
                        ? variant.duplicateMeta.existingPrice
                        : (variant.price ?? "")
                    }
                    disabled={variant.duplicateMeta?.resolution === "skip"}
                    onChange={(e) =>
                      onUpdateVariant(variant.id, {
                        price:
                          e.target.value === ""
                            ? null
                            : Number.parseFloat(e.target.value),
                      })
                    }
                    placeholder={t("price")}
                    aria-label={t("price")}
                    aria-invalid={variant.price === null || undefined}
                    endIcon={currencySuffix}
                    className="ui-figure"
                    wrapperClassName="w-32"
                  />
                  <Button
                    variant="dangerGhost"
                    size="sm"
                    iconOnly
                    aria-label={t("delete")}
                    title={t("delete")}
                    onClick={() => onRemoveVariant(variant.id)}
                  >
                    <IoCloseOutline />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            variant="link"
            size="xs"
            onClick={handleAddVariant}
            startIcon={<IoAddCircleOutline />}
            className="mt-1.5 self-start"
          >
            {t("addVariant")}
          </Button>
        </div>
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
