/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { PexelsPhoto } from "@/types/pexels";
import { getPexelsPhotoUrl } from "@/lib/menuImport/pexelsImportImage";
import PexelsImagePickerModal from "@/components/MenuImport/review/PexelsImagePickerModal";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { toast } from "react-toastify";
import { Category } from "@/types/Menu";
import { UploadResponse } from "@/types/Menu";
import {
  IoCloseOutline,
  IoImageOutline,
  IoPricetagOutline,
  IoAddCircleOutline,
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
} from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import {
  Button,
  Field,
  Input,
  Modal,
  Spinner,
  focusRing,
} from "@/components/ui";
import { cn } from "@/lib/cn";

export interface AddCategoryFormData {
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

interface AddCategoryModalProps {
  menuId: string;
  category?: Category | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const CATEGORY_FORM_ID = "add-category-form";

export default function AddCategoryModal({
  menuId,
  category = null,
  onClose,
  onRefresh,
}: AddCategoryModalProps) {
  const t = useTranslations("Categories.addModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEdit = Boolean(category?.id);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pexelsModalOpen, setPexelsModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddCategoryFormData>({
    defaultValues: {
      nameAr: "",
      nameEn: "",
      isActive: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (category) {
      reset({
        nameAr: category.nameAr ?? "",
        nameEn: category.nameEn ?? "",
        isActive: category.isActive ?? true,
      });
      const url = category.imageUrl ?? category.image ?? "";
      setImagePreview(url || null);
      setImage(null);
      setSelectedImageUrl(null);
    } else {
      reset({ nameAr: "", nameEn: "", isActive: true });
      setImagePreview(null);
      setImage(null);
      setSelectedImageUrl(null);
    }
  }, [category, reset]);

  const nameAr = watch("nameAr");
  const nameEn = watch("nameEn");
  const defaultImageSearchQuery = (nameAr || nameEn || "").trim();
  const isImageBusy = isImageLoading || isCreating;

  const onSubmit = async (data: AddCategoryFormData) => {
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

      const payload = {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        isActive: data.isActive,
        ...(imageUrl && { imageUrl, image: imageUrl }),
      };

      if (isEdit && category) {
        const result = await axiosPatch<typeof payload, Category>(
          `/menus/${menuId}/categories/${category.id}`,
          locale,
          payload,
        );
        if (result.status && result.data) {
          toast.success(t("editSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(t("editError"));
        }
      } else {
        const result = await axiosPost<typeof payload, Category>(
          `/menus/${menuId}/categories`,
          locale,
          payload,
        );
        if (result.status && result.data) {
          toast.success(t("createSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(t("createError"));
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

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={isEdit ? t("editTitle") : t("title")}
        description={t("names")}
        icon={<BiCategory className="size-5" />}
        dismissible={!isCreating}
        closeLabel={tCommon("close")}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isCreating}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={CATEGORY_FORM_ID}
              loading={isCreating}
              disabled={isCreating}
              startIcon={<IoAddCircleOutline className="size-4.5" />}
            >
              {isEdit ? t("save") : t("create")}
            </Button>
          </>
        }
      >
        <form
          id={CATEGORY_FORM_ID}
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
              {t("names")}
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
                  rules={{ required: t("nameEnRequired") }}
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
                  rules={{ required: t("nameArRequired") }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      placeholder="مثال: مشروبات"
                      dir="rtl"
                    />
                  )}
                />
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <IoEllipseSharp
                className="size-3 shrink-0 text-fg-subtle"
                aria-hidden
              />
              {t("status")}
            </h3>
            <Controller
              name="isActive"
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
