/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { PexelsPhoto } from "@/types/pexels";
import { getPexelsPhotoUrl } from "@/lib/menuImport/pexelsImportImage";
import PexelsImagePickerModal from "@/components/MenuImport/review/PexelsImagePickerModal";
import CategorySearchSelect, {
  type CategoryOption,
} from "@/components/Dashboard/CategorySearchSelect";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPut } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { toast } from "react-toastify";
import { Item, Category, UploadResponse } from "@/types/Menu";
import {
  IoCloseOutline,
  IoImageOutline,
  IoPricetagOutline,
  IoAddCircleOutline,
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
  IoTrashOutline,
} from "react-icons/io5";
import {
  Button,
  Field,
  Input,
  Modal,
  Spinner,
  Textarea,
  focusRing,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { MdOutlineFastfood } from "react-icons/md";
import {
  createItemSchema,
  type AddItemFormData,
} from "@/schemas/itemSchema";
import { menuEndpoints } from "@/api/endpoints/menus";
import { resolveApiErrorMessage } from "@/api/apiError";
import { useApiAction } from "@/hooks/useApiAction";
import {
  createItemSizeRow,
  createItemVariantRow,
  parseEditableItemSizes,
  parseEditableItemVariants,
  serializeItemSizes,
  serializeItemVariants,
  type EditableItemSize,
  type EditableItemVariant,
} from "@/lib/itemOptionPersistence";

export type { AddItemFormData } from "@/schemas/itemSchema";

type PriceMode = "single" | "multiple";

type SizeFieldKey = "nameAr" | "nameEn" | "price";
type VariantFieldKey = "labelAr" | "labelEn" | "price";

interface AddItemModalProps {
  menuId: string;
  item?: Item | null;
  /** إن وُجدت تُستخدم بدل جلب الفئات من الـ API */
  categories?: Category[];
  onClose: () => void;
  onRefresh?: () => void;
  isItemLoading?: boolean;
}

const ITEM_FORM_ID = "add-item-form";

export default function AddItemModal({
  menuId,
  item = null,
  onClose,
  onRefresh,
  isItemLoading = false,
}: AddItemModalProps) {
  const t = useTranslations("Items.addModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEdit = Boolean(item?.id) || isItemLoading;
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pexelsModalOpen, setPexelsModalOpen] = useState(false);
  const { runApiAction } = useApiAction();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption | null>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("single");
  const itemSchema = useMemo(
    () =>
      createItemSchema(
        {
          nameArRequired: t("nameArRequired"),
          nameEnRequired: t("nameEnRequired"),
          categoryRequired: t("categoryRequired"),
          priceRequired: t("priceRequired"),
          discountMinError: t("discountMinError"),
          discountMaxError: t("discountMaxError"),
        },
        priceMode,
      ),
    [priceMode, t],
  );
  const [sizes, setSizes] = useState<EditableItemSize[]>([]);
  const [sizesError, setSizesError] = useState<string | null>(null);
  const [sizeFieldErrors, setSizeFieldErrors] = useState<
    Record<string, Partial<Record<SizeFieldKey, string>>>
  >({});
  const [variants, setVariants] = useState<EditableItemVariant[]>([]);
  const [variantFieldErrors, setVariantFieldErrors] = useState<
    Record<string, Partial<Record<VariantFieldKey, string>>>
  >({});
  const fileRef = useRef<HTMLInputElement>(null);

  const tItems = useTranslations("Items");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddItemFormData>({
    resolver: yupResolver(itemSchema),
    defaultValues: {
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      categoryId: "",
      price: "",
      discountPercent: "",
      isAvailable: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (item) {
      // دعم كل من الحقول camelCase (nameAr/nameEn) و snake_case (name_ar/name_en) القادمة من الـ API
      const snake = item as Item & {
        name_ar?: string;
        name_en?: string;
        description_ar?: string;
        description_en?: string;
      };

      const fallbackName = item.name ?? snake.name_en ?? snake.name_ar ?? "";
      const parsedSizes = parseEditableItemSizes(item);
      const parsedVariants = parseEditableItemVariants(item);
      const categoryId = String(
        item.categoryId ??
          (typeof item.category === "object" && item.category?.id != null
            ? item.category.id
            : (item as { category_id?: number }).category_id) ??
          "",
      );
      const categoryRef =
        typeof item.category === "object" && item.category != null
          ? item.category
          : null;
      const categoryLabel = categoryRef
        ? locale === "ar"
          ? categoryRef.nameAr || categoryRef.nameEn || item.categoryName || ""
          : categoryRef.nameEn || categoryRef.nameAr || item.categoryName || ""
        : item.categoryName || "";

      reset({
        nameAr: item.nameAr ?? snake.name_ar ?? fallbackName,
        nameEn: item.nameEn ?? snake.name_en ?? fallbackName,
        descriptionAr:
          item.descriptionAr ??
          snake.description_ar ??
          item.description ??
          snake.description_en ??
          "",
        descriptionEn:
          item.descriptionEn ??
          snake.description_en ??
          item.description ??
          snake.description_ar ??
          "",
        categoryId,
        price: item.price != null ? String(item.price) : "",
        discountPercent:
          item.discountPercent != null ? String(item.discountPercent) : "",
        isAvailable: item.isAvailable ?? item.available ?? true,
      });
      setPriceMode(parsedSizes.length > 0 ? "multiple" : "single");
      setSizes(parsedSizes.length > 0 ? parsedSizes : []);
      setVariants(parsedVariants);
      setSizesError(null);
      setSizeFieldErrors({});
      setVariantFieldErrors({});
      const url = item.imageUrl ?? item.image ?? "";
      setSelectedCategory(
        categoryId
          ? { value: categoryId, label: categoryLabel || categoryId }
          : null,
      );
      setImagePreview(url || null);
      setImage(null);
      setSelectedImageUrl(null);
    } else {
      reset({
        nameAr: "",
        nameEn: "",
        descriptionAr: "",
        descriptionEn: "",
        categoryId: "",
        price: "",
        discountPercent: "",
        isAvailable: true,
      });
      setPriceMode("single");
      setSizes([]);
      setVariants([]);
      setSizesError(null);
      setSizeFieldErrors({});
      setVariantFieldErrors({});
      setSelectedCategory(null);
      setImagePreview(null);
      setImage(null);
      setSelectedImageUrl(null);
    }
  }, [item, reset, locale]);

  const nameAr = watch("nameAr");
  const nameEn = watch("nameEn");
  const defaultImageSearchQuery = (nameAr || nameEn || "").trim();
  const isImageBusy = isImageLoading || isCreating;

  const validateSizes = () => {
    const nextErrors: Record<
      string,
      Partial<Record<SizeFieldKey, string>>
    > = {};
    let hasError = false;

    for (const size of sizes) {
      const rowErrors: Partial<Record<SizeFieldKey, string>> = {};

      if (!size.nameAr.trim()) {
        rowErrors.nameAr = t("nameArRequired");
        hasError = true;
      }
      if (!size.nameEn.trim()) {
        rowErrors.nameEn = t("nameEnRequired");
        hasError = true;
      }
      if (!size.price.trim() || Number.isNaN(Number(size.price))) {
        rowErrors.price = t("priceRequired");
        hasError = true;
      }

      if (Object.keys(rowErrors).length > 0) {
        nextErrors[size.id] = rowErrors;
      }
    }

    setSizeFieldErrors(nextErrors);
    return !hasError;
  };

  const validateVariants = () => {
    if (variants.length === 0) return true;

    const nextErrors: Record<
      string,
      Partial<Record<VariantFieldKey, string>>
    > = {};
    let hasError = false;

    for (const variant of variants) {
      const rowErrors: Partial<Record<VariantFieldKey, string>> = {};

      if (!variant.labelAr.trim()) {
        rowErrors.labelAr = t("nameArRequired");
        hasError = true;
      }
      if (!variant.labelEn.trim()) {
        rowErrors.labelEn = t("nameEnRequired");
        hasError = true;
      }
      if (!variant.price.trim() || Number.isNaN(Number(variant.price))) {
        rowErrors.price = t("priceRequired");
        hasError = true;
      }

      if (Object.keys(rowErrors).length > 0) {
        nextErrors[variant.id] = rowErrors;
      }
    }

    setVariantFieldErrors(nextErrors);
    return !hasError;
  };

  const onSubmit = async (data: AddItemFormData) => {
    if (priceMode === "multiple") {
      if (sizes.length === 0) {
        setSizesError(t("sizesRequired"));
        return;
      }
      if (!validateSizes()) {
        return;
      }
    }
    if (!validateVariants()) {
      return;
    }
    setSizesError(null);

    try {
      setIsCreating(true);

      let imageUrl: string | null = null;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("type", "categories");

        const uploadResult = await axiosPost<FormData, UploadResponse>(
          "/upload",
          locale,
          formData,
          true,
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          toast.error(t("imageUploadError"));
          setIsCreating(false);
          return;
        }
        imageUrl = uploadResult.data.url;
      } else if (selectedImageUrl) {
        imageUrl = selectedImageUrl;
      }

      const normalizedSizes =
        priceMode === "multiple" ? serializeItemSizes(sizes) : [];
      const normalizedVariants = serializeItemVariants(variants);

      const payload = {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr || undefined,
        descriptionEn: data.descriptionEn || undefined,
        categoryId: Number(data.categoryId) || undefined,
        price:
          priceMode === "single"
            ? Number(data.price) || 0
            : Math.min(...normalizedSizes.map((size) => size.price)),
        ...(data.discountPercent
          ? { discountPercent: Number(data.discountPercent) }
          : {}),
        sizes: priceMode === "multiple" ? normalizedSizes : [],
        variants: normalizedVariants,
        isAvailable: data.isAvailable,
        ...(imageUrl && { imageUrl, image: imageUrl }),
      };

      await runApiAction(
        () =>
          isEdit && item
            ? axiosPut<typeof payload, Item>(
                menuEndpoints.items.detail(menuId, item.id),
                locale,
                payload,
              )
            : axiosPost<typeof payload, Item>(
                menuEndpoints.items.list(menuId),
                locale,
                payload,
              ),
        {
          successToast: isEdit ? t("editSuccess") : t("createSuccess"),
          errorToast: ({ error }) =>
            resolveApiErrorMessage(
              { error },
              locale,
              isEdit ? t("editError") : t("createError"),
            ),
          onSuccess: () => {
            onClose();
            onRefresh?.();
          },
        },
      );
    } catch {
      toast.error(isEdit ? t("editError") : t("createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const applyImageFile = async (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      return;
    }

    setIsImageLoading(true);
    try {
      const resized = await _resizeImage(file);
      if (resized.size > 2 * 1024 * 1024) {
        toast.error(t("imageSizeError"));
        return;
      }
      setImage(resized);
      setSelectedImageUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(resized);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await applyImageFile(file);
    e.target.value = "";
  };

  const handlePexelsPhotoSelect = async (photo: PexelsPhoto) => {
    const url = getPexelsPhotoUrl(photo);
    setImage(null);
    setSelectedImageUrl(url);
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setSelectedImageUrl(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await applyImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);

  const addSizeRow = () => {
    setSizes((prev) => [...prev, createItemSizeRow()]);
    setSizesError(null);
  };

  const updateSizeRow = (
    id: EditableItemSize["id"],
    patch: Partial<EditableItemSize>,
  ) => {
    setSizes((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
    setSizesError(null);
    setSizeFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev[id] };
      if (patch.nameAr !== undefined) delete next.nameAr;
      if (patch.nameEn !== undefined) delete next.nameEn;
      if (patch.price !== undefined) delete next.price;
      if (Object.keys(next).length === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeSizeRow = (id: EditableItemSize["id"]) => {
    setSizes((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length === 0 ? [createItemSizeRow()] : next;
    });
    setSizesError(null);
    setSizeFieldErrors((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  };

  const handlePriceModeChange = (mode: PriceMode) => {
    setPriceMode(mode);
    setSizesError(null);
    setSizeFieldErrors({});
    if (mode === "single") {
      setSizes([]);
    } else {
      setSizes([createItemSizeRow()]);
    }
  };

  const addVariantRow = () => {
    setVariants((prev) => [...prev, createItemVariantRow()]);
    setVariantFieldErrors({});
  };

  const updateVariantRow = (
    id: EditableItemVariant["id"],
    patch: Partial<EditableItemVariant>,
  ) => {
    setVariants((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
    setVariantFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev[id] };
      if (patch.labelAr !== undefined) delete next.labelAr;
      if (patch.labelEn !== undefined) delete next.labelEn;
      if (patch.price !== undefined) delete next.price;
      if (Object.keys(next).length === 0) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeVariantRow = (id: EditableItemVariant["id"]) => {
    setVariants((prev) => prev.filter((row) => row.id !== id));
    setVariantFieldErrors((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={isEdit ? t("editTitle") : t("title")}
        description={`${t("nameEn")} / ${t("nameAr")}`}
        icon={<MdOutlineFastfood className="size-5" />}
        size="lg"
        dismissible={!isCreating && !isItemLoading}
        closeLabel={tCommon("close")}
        footer={
          isItemLoading ? undefined : (
            <>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isCreating}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="primary"
                type="submit"
                form={ITEM_FORM_ID}
                loading={isCreating}
                disabled={isCreating}
                startIcon={<IoAddCircleOutline className="size-4.5" />}
              >
                {isEdit ? t("save") : t("create")}
              </Button>
            </>
          )
        }
      >
        {isItemLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner size="md" />
            <p className="text-sm text-fg-muted">{tItems("loading")}</p>
          </div>
        ) : (
          <form
            id={ITEM_FORM_ID}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <section className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
                <IoImageOutline
                  className="size-4 shrink-0 text-fg-muted"
                  aria-hidden
                />
                {t("image")}
              </h3>
              <div
                className={cn(
                  "relative rounded-lg border border-dashed transition-colors duration-(--dur-settle)",
                  isDragOver
                    ? "border-brand bg-brand-soft"
                    : "border-line-strong bg-surface-2",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isImageBusy}
                />
                <button
                  type="button"
                  disabled={isImageBusy}
                  onClick={() => setPexelsModalOpen(true)}
                  className={cn(
                    "flex min-h-40 w-full flex-col items-center justify-center rounded-lg px-6 py-8 disabled:opacity-70",
                    focusRing,
                  )}
                >
                  {imagePreview ? (
                    <div className="relative size-28 overflow-hidden rounded-lg bg-surface ring-1 ring-line">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-overlay">
                          <Spinner size="sm" className="text-on-brand" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-surface-3 text-fg-muted">
                        <IoImageOutline className="size-6" aria-hidden />
                      </span>
                      <span className="text-center text-sm font-medium text-fg">
                        {t("searchImage")}
                      </span>
                      <span className="mt-1 text-center text-xs text-fg-muted">
                        {t("imageHint")}
                      </span>
                    </>
                  )}
                </button>
                {imagePreview && !isImageBusy && (
                  <Button
                    variant="secondary"
                    size="sm"
                    iconOnly
                    onClick={handleRemoveImage}
                    aria-label={t("removeImage")}
                    className="absolute end-3 top-3"
                  >
                    <IoCloseOutline className="size-4.5" />
                  </Button>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
                <IoPricetagOutline
                  className="size-4 shrink-0 text-fg-muted"
                  aria-hidden
                />
                {t("nameEn")} / {t("nameAr")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label={t("nameEn")}
                  required
                  error={errors.nameEn?.message}
                >
                  <Controller
                    name="nameEn"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder={t("namePlaceholder")}
                        data-autofocus
                      />
                    )}
                  />
                </Field>
                <Field
                  label={t("nameAr")}
                  required
                  error={errors.nameAr?.message}
                >
                  <Controller
                    name="nameAr"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="مثال: برجر"
                        dir="rtl"
                      />
                    )}
                  />
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-fg">
                {t("descriptionEn")} / {t("descriptionAr")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label={t("descriptionEn")}
                  error={errors.descriptionEn?.message}
                >
                  <Controller
                    name="descriptionEn"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        rows={3}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder={t("optionalPlaceholder")}
                      />
                    )}
                  />
                </Field>
                <Field
                  label={t("descriptionAr")}
                  error={errors.descriptionAr?.message}
                >
                  <Controller
                    name="descriptionAr"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        rows={3}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="اختياري"
                        dir="rtl"
                      />
                    )}
                  />
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <Field
                label={t("category")}
                required
                error={errors.categoryId?.message}
              >
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <CategorySearchSelect
                      menuId={menuId}
                      instanceId="item-category"
                      value={field.value}
                      selectedOption={selectedCategory}
                      placeholder={`— ${tItems("selectCategory")} —`}
                      hasError={Boolean(errors.categoryId)}
                      minHeight={48}
                      onChange={(id, option) => {
                        setSelectedCategory(option);
                        field.onChange(id);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </Field>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-fg">
                {t("price")}
              </h3>
              <div className="mb-2 flex w-fit gap-1 rounded-lg border border-line bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => handlePriceModeChange("single")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                    focusRing,
                    priceMode === "single"
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {t("oneSize")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceModeChange("multiple")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                    focusRing,
                    priceMode === "multiple"
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {t("multipleSizes")}
                </button>
              </div>

              {priceMode === "single" ? (
                <Field
                  label={t("price")}
                  required
                  error={errors.price?.message}
                  className="max-w-md"
                >
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="0"
                      />
                    )}
                  />
                </Field>
              ) : (
                <div className="space-y-4">
                  {sizes.map((size) => (
                    <div
                      key={size.id}
                      className="grid grid-cols-1 items-start gap-3 rounded-lg border border-line bg-surface p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <Field
                        label={t("sizeNameAr")}
                        required
                        error={sizeFieldErrors[size.id]?.nameAr}
                      >
                        <Input
                          type="text"
                          value={size.nameAr}
                          onChange={(e) =>
                            updateSizeRow(size.id, { nameAr: e.target.value })
                          }
                          placeholder="مثال: صغير"
                          dir="rtl"
                        />
                      </Field>
                      <Field
                        label={t("sizeNameEn")}
                        required
                        error={sizeFieldErrors[size.id]?.nameEn}
                      >
                        <Input
                          type="text"
                          value={size.nameEn}
                          onChange={(e) =>
                            updateSizeRow(size.id, { nameEn: e.target.value })
                          }
                          placeholder="e.g. Small"
                        />
                      </Field>
                      <Field
                        label={t("price")}
                        required
                        error={sizeFieldErrors[size.id]?.price}
                      >
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={size.price}
                          onChange={(e) =>
                            updateSizeRow(size.id, { price: e.target.value })
                          }
                          placeholder="0"
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={() => removeSizeRow(size.id)}
                        className={cn(
                          "mt-7 rounded-lg p-2 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger",
                          focusRing,
                        )}
                        aria-label={tItems("deleteConfirmTitle")}
                      >
                        <IoTrashOutline className="size-4.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSizeRow}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80",
                      focusRing,
                    )}
                  >
                    <IoAddCircleOutline className="size-4.5" />
                    {t("addSize")}
                  </button>

                  {sizesError && (
                    <p className="text-xs text-danger">{sizesError}</p>
                  )}
                </div>
              )}

              <Field
                label={t("discountPercent")}
                error={errors.discountPercent?.message}
                className="max-w-md border-t border-line pt-4"
              >
                <Controller
                  name="discountPercent"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      value={field.value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "" || raw === "-") {
                          field.onChange(raw);
                          return;
                        }
                        const num = Number(raw);
                        field.onChange(
                          Math.min(100, Math.max(0, num)).toString(),
                        );
                      }}
                      onBlur={field.onBlur}
                      placeholder="0"
                    />
                  )}
                />
              </Field>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold text-fg">
                {t("addOns")}
              </h3>
              <p className="text-sm text-fg-muted">{t("addOnsHint")}</p>

              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-1 items-start gap-3 rounded-lg border border-line bg-surface p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Field
                      label={t("variantLabelAr")}
                      required
                      error={variantFieldErrors[variant.id]?.labelAr}
                    >
                      <Input
                        type="text"
                        value={variant.labelAr}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            labelAr: e.target.value,
                          })
                        }
                        placeholder="مثال: جبنة إضافية"
                        dir="rtl"
                      />
                    </Field>
                    <Field
                      label={t("variantLabelEn")}
                      required
                      error={variantFieldErrors[variant.id]?.labelEn}
                    >
                      <Input
                        type="text"
                        value={variant.labelEn}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            labelEn: e.target.value,
                          })
                        }
                        placeholder="e.g. Extra cheese"
                      />
                    </Field>
                    <Field
                      label={t("price")}
                      required
                      error={variantFieldErrors[variant.id]?.price}
                    >
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            price: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeVariantRow(variant.id)}
                      className={cn(
                        "mt-7 rounded-lg p-2 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger",
                        focusRing,
                      )}
                      aria-label={tItems("deleteConfirmTitle")}
                    >
                      <IoTrashOutline className="size-4.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariantRow}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80",
                    focusRing,
                  )}
                >
                  <IoAddCircleOutline className="size-4.5" />
                  {t("addVariant")}
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
                <IoEllipseSharp
                  className="size-3 shrink-0 text-fg-subtle"
                  aria-hidden
                />
                {t("currentlyAvailable")}
              </h3>
              <p className="text-sm text-fg-muted">
                {tItems("availableToOrderNow")}
              </p>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <div className="flex w-fit gap-1 rounded-lg border border-line bg-surface-2 p-1">
                    <button
                      type="button"
                      aria-pressed={field.value === true}
                      onClick={() => field.onChange(true)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                        focusRing,
                        field.value === true
                          ? "bg-surface text-fg shadow-xs"
                          : "text-fg-muted hover:text-fg",
                      )}
                    >
                      <IoCheckmarkCircle
                        className={cn(
                          "size-4",
                          field.value === true
                            ? "text-success"
                            : "text-fg-subtle",
                        )}
                        aria-hidden
                      />
                      {t("active")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={field.value === false}
                      onClick={() => field.onChange(false)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                        focusRing,
                        field.value === false
                          ? "bg-surface text-fg shadow-xs"
                          : "text-fg-muted hover:text-fg",
                      )}
                    >
                      <IoRemoveCircle
                        className={cn(
                          "size-4",
                          field.value === false
                            ? "text-danger"
                            : "text-fg-subtle",
                        )}
                        aria-hidden
                      />
                      {t("inactive")}
                    </button>
                  </div>
                )}
              />
            </section>
          </form>
        )}
      </Modal>

      <PexelsImagePickerModal
        open={pexelsModalOpen}
        defaultQuery={defaultImageSearchQuery}
        isUploading={isImageBusy}
        overlayClassName="z-[60]"
        onClose={() => setPexelsModalOpen(false)}
        onUploadFromDevice={() => {
          setPexelsModalOpen(false);
          fileRef.current?.click();
        }}
        onSelectPhoto={handlePexelsPhotoSelect}
      />
    </>
  );
}
