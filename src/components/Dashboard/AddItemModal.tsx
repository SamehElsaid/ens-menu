/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import type { PexelsPhoto } from "@/types/pexels";
import { getPexelsPhotoUrl } from "@/lib/menuImport/pexelsImportImage";
import PexelsImagePickerModal from "@/components/MenuImport/review/PexelsImagePickerModal";
import CategorySearchSelect, {
  type CategoryOption,
} from "@/components/Dashboard/CategorySearchSelect";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import CustomInput from "@/components/Custom/CustomInput";
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
import CustomBtn from "../Custom/CustomBtn";
import { MdOutlineFastfood } from "react-icons/md";

type PriceMode = "single" | "multiple";

interface ItemSizeRow {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
}

interface ItemVariantRow {
  id: string;
  labelAr: string;
  labelEn: string;
  price: string;
}

type SizeFieldKey = "nameAr" | "nameEn" | "price";
type VariantFieldKey = "labelAr" | "labelEn" | "price";

export interface AddItemFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryId: string;
  price: string;
  discountPercent: string;
  isAvailable: boolean;
}

function createSizeRow(): ItemSizeRow {
  return {
    id: crypto.randomUUID(),
    nameAr: "",
    nameEn: "",
    price: "",
  };
}

function createVariantRow(): ItemVariantRow {
  return {
    id: crypto.randomUUID(),
    labelAr: "",
    labelEn: "",
    price: "",
  };
}

function getApiErrorMessage(data: unknown, locale: string): string | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.error === "string" && row.error.trim()) return row.error;
  if (locale === "ar" && typeof row.errorAr === "string") return row.errorAr;
  if (typeof row.errorEn === "string") return row.errorEn;
  if (typeof row.message === "string") return row.message;
  return null;
}

function parseItemSizes(item: Item): ItemSizeRow[] {
  let list: unknown = item.sizes;

  if (typeof list === "string") {
    try {
      list = JSON.parse(list) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((size) => {
    const row = size as Record<string, unknown>;
    return {
      id: crypto.randomUUID(),
      nameAr: String(row.nameAr ?? row.name_ar ?? row.labelAr ?? row.label ?? ""),
      nameEn: String(row.nameEn ?? row.name_en ?? row.labelEn ?? row.label ?? ""),
      price: row.price != null ? String(row.price) : "",
    };
  });
}

function parseItemVariants(item: Item): ItemVariantRow[] {
  let list: unknown = item.variants;

  if (typeof list === "string") {
    try {
      list = JSON.parse(list) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((variant) => {
    const row = variant as Record<string, unknown>;
    return {
      id: crypto.randomUUID(),
      labelAr: String(row.labelAr ?? row.label_ar ?? row.label ?? ""),
      labelEn: String(row.labelEn ?? row.label_en ?? row.label ?? ""),
      price: row.price != null ? String(row.price) : "",
    };
  });
}

interface AddItemModalProps {
  menuId: string;
  item?: Item | null;
  /** إن وُجدت تُستخدم بدل جلب الفئات من الـ API */
  categories?: Category[];
  onClose: () => void;
  onRefresh?: () => void;
  isItemLoading?: boolean;
}

export default function AddItemModal({
  menuId,
  item = null,
  categories: _categoriesProp,
  onClose,
  onRefresh,
  isItemLoading = false,
}: AddItemModalProps) {
  const t = useTranslations("Items.addModal");
  const locale = useLocale();
  const isEdit = Boolean(item?.id) || isItemLoading;
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pexelsModalOpen, setPexelsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption | null>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("single");
  const [sizes, setSizes] = useState<ItemSizeRow[]>([]);
  const [sizesError, setSizesError] = useState<string | null>(null);
  const [sizeFieldErrors, setSizeFieldErrors] = useState<
    Record<string, Partial<Record<SizeFieldKey, string>>>
  >({});
  const [variants, setVariants] = useState<ItemVariantRow[]>([]);
  const [variantFieldErrors, setVariantFieldErrors] = useState<
    Record<string, Partial<Record<VariantFieldKey, string>>>
  >({});
  const modalRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tItems = useTranslations("Items");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddItemFormData>({
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
      const parsedSizes = parseItemSizes(item);
      const parsedVariants = parseItemVariants(item);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreating) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isCreating]);

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
        priceMode === "multiple"
          ? sizes.map((size) => ({
              nameAr: size.nameAr.trim(),
              nameEn: size.nameEn.trim(),
              price: Number(size.price),
            }))
          : [];

      const normalizedVariants = variants.map((variant) => ({
        labelAr: variant.labelAr.trim(),
        labelEn: variant.labelEn.trim(),
        price: Number(variant.price),
      }));

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

      if (isEdit && item) {
        const result = await axiosPatch<typeof payload, Item>(
          `/menus/${menuId}/items/${item.id}`,
          locale,
          payload,
        );
        if (result.status && result.data) {
          toast.success(t("editSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(getApiErrorMessage(result.data, locale) ?? t("editError"));
        }
      } else {
        const result = await axiosPost<typeof payload, Item>(
          `/menus/${menuId}/items`,
          locale,
          payload,
        );
        if (result.status && result.data) {
          toast.success(t("createSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(getApiErrorMessage(result.data, locale) ?? t("createError"));
        }
      }
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
    setSizes((prev) => [...prev, createSizeRow()]);
    setSizesError(null);
  };

  const updateSizeRow = (id: string, patch: Partial<ItemSizeRow>) => {
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
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeSizeRow = (id: string) => {
    setSizes((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length === 0 ? [createSizeRow()] : next;
    });
    setSizesError(null);
    setSizeFieldErrors((prev) => {
      const { [id]: _removed, ...rest } = prev;
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
      setSizes([createSizeRow()]);
    }
  };

  const addVariantRow = () => {
    setVariants((prev) => [...prev, createVariantRow()]);
    setVariantFieldErrors({});
  };

  const updateVariantRow = (id: string, patch: Partial<ItemVariantRow>) => {
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
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeVariantRow = (id: string) => {
    setVariants((prev) => prev.filter((row) => row.id !== id));
    setVariantFieldErrors((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !isCreating && !isItemLoading && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out] border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <MdOutlineFastfood className="text-primary text-2xl" />
              </div>
              <div>
                <h2
                  id="add-item-title"
                  className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
                >
                  {isEdit ? t("editTitle") : t("title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("nameEn")} / {t("nameAr")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              aria-label="Close"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        {isItemLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 px-6">
            <div
              className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent"
              aria-hidden
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tItems("loading")}
            </p>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="overflow-y-auto p-6 space-y-6">
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoImageOutline className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("image")}
                </h3>
              </div>
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
                  isDragOver
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : imagePreview
                      ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                      : "border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-600/20"
                }`}
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
                  className="flex w-full flex-col items-center justify-center py-8 px-6 min-h-[120px] disabled:opacity-70"
                >
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner ring-1 ring-black/5">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-gray-200/80 dark:bg-gray-600/50 flex items-center justify-center mb-2">
                        <IoImageOutline className="text-2xl text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary text-center">
                        {t("searchImage")}
                      </span>
                      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                        {t("imageHint")}
                      </span>
                    </>
                  )}
                </button>
                {imagePreview && !isImageBusy && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    aria-label={t("removeImage")}
                  >
                    <IoCloseOutline className="text-lg" />
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoPricetagOutline className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("nameEn")} / {t("nameAr")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("nameEn")} *
                  </label>
                  <Controller
                    name="nameEn"
                    control={control}
                    rules={{ required: t("nameEnRequired") }}
                    render={({ field }) => (
                      <CustomInput
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder={t("namePlaceholder")}
                        error={errors.nameEn?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("nameAr")} *
                  </label>
                  <Controller
                    name="nameAr"
                    control={control}
                    rules={{ required: t("nameArRequired") }}
                    render={({ field }) => (
                      <CustomInput
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="مثال: برجر"
                        dir="rtl"
                        error={errors.nameAr?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("descriptionEn")} / {t("descriptionAr")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("descriptionEn")}
                  </label>
                  <Controller
                    name="descriptionEn"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="textarea"
                        rows={3}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          )
                        }
                        onBlur={field.onBlur}
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder={t("optionalPlaceholder")}
                        error={errors.descriptionEn?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("descriptionAr")}
                  </label>
                  <Controller
                    name="descriptionAr"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="textarea"
                        rows={3}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value,
                          )
                        }
                        onBlur={field.onBlur}
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="اختياري"
                        dir="rtl"
                        error={errors.descriptionAr?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("category")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("category")} *
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: t("categoryRequired") }}
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
                {errors.categoryId?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("price")}
              </h3>
              <div className="flex rounded-2xl p-1 bg-gray-100 dark:bg-gray-600/40 border border-gray-200/80 dark:border-gray-600/50 w-fit mb-4">
                <button
                  type="button"
                  onClick={() => handlePriceModeChange("single")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    priceMode === "single"
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-primary/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {t("oneSize")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceModeChange("multiple")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    priceMode === "multiple"
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-primary/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {t("multipleSizes")}
                </button>
              </div>

              {priceMode === "single" ? (
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("price")} *
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      validate: (value) =>
                        priceMode !== "single" || value.trim()
                          ? true
                          : t("priceRequired"),
                    }}
                    render={({ field }) => (
                      <CustomInput
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="0"
                        error={errors.price?.message}
                      />
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {sizes.map((size) => (
                    <div
                      key={size.id}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/50"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("sizeNameAr")} *
                        </label>
                        <CustomInput
                          type="text"
                          value={size.nameAr}
                          onChange={(e) =>
                            updateSizeRow(size.id, { nameAr: e.target.value })
                          }
                          className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                          placeholder="مثال: صغير"
                          dir="rtl"
                          error={sizeFieldErrors[size.id]?.nameAr}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("sizeNameEn")} *
                        </label>
                        <CustomInput
                          type="text"
                          value={size.nameEn}
                          onChange={(e) =>
                            updateSizeRow(size.id, { nameEn: e.target.value })
                          }
                          className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                          placeholder="e.g. Small"
                          error={sizeFieldErrors[size.id]?.nameEn}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t("price")} *
                        </label>
                        <CustomInput
                          type="number"
                          min={0}
                          step="0.01"
                          value={size.price}
                          onChange={(e) =>
                            updateSizeRow(size.id, { price: e.target.value })
                          }
                          className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                          placeholder="0"
                          error={sizeFieldErrors[size.id]?.price}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSizeRow(size.id)}
                        className="mt-8 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        aria-label={tItems("deleteConfirmTitle")}
                      >
                        <IoTrashOutline className="text-lg" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSizeRow}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <IoAddCircleOutline className="text-lg" />
                    {t("addSize")}
                  </button>

                  {sizesError && (
                    <p className="text-xs text-red-500">{sizesError}</p>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("discountPercent")}
                </label>
                <Controller
                  name="discountPercent"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                      placeholder="0"
                    />
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {t("addOns")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t("addOnsHint")}
              </p>

              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/50"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("variantLabelAr")} *
                      </label>
                      <CustomInput
                        type="text"
                        value={variant.labelAr}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            labelAr: e.target.value,
                          })
                        }
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="مثال: جبنة إضافية"
                        dir="rtl"
                        error={variantFieldErrors[variant.id]?.labelAr}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("variantLabelEn")} *
                      </label>
                      <CustomInput
                        type="text"
                        value={variant.labelEn}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            labelEn: e.target.value,
                          })
                        }
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="e.g. Extra cheese"
                        error={variantFieldErrors[variant.id]?.labelEn}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("price")} *
                      </label>
                      <CustomInput
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantRow(variant.id, {
                            price: e.target.value,
                          })
                        }
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        placeholder="0"
                        error={variantFieldErrors[variant.id]?.price}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantRow(variant.id)}
                      className="mt-8 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label={tItems("deleteConfirmTitle")}
                    >
                      <IoTrashOutline className="text-lg" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariantRow}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <IoAddCircleOutline className="text-lg" />
                  {t("addVariant")}
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-1">
                <IoEllipseSharp className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("currentlyAvailable")}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {tItems("availableToOrderNow")}
              </p>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <div className="flex rounded-2xl p-1 bg-gray-100 dark:bg-gray-600/40 border border-gray-200/80 dark:border-gray-600/50 w-fit">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        field.value === true
                          ? "bg-white dark:bg-gray-700 text-primary shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-primary/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <IoCheckmarkCircle className="text-lg" />
                      {t("active")}
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        field.value === false
                          ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-red-500/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <IoRemoveCircle className="text-lg" />
                      {t("inactive")}
                    </button>
                  </div>
                )}
              />
            </section>
          </div>

          <div className="shrink-0 justify-end flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={isCreating}
            >
              {t("cancel")}
            </button>
            <div className="w-fit!">
              <CustomBtn
                type="submit"
                loading={isCreating}
                disabled={isCreating}
              >
                <div className="flex items-center justify-center gap-2">
                  <IoAddCircleOutline className="text-xl" />
                  {isEdit ? t("save") : t("create")}
                </div>
              </CustomBtn>
            </div>
          </div>
        </form>
        )}
      </div>

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
    </div>
  );
}
