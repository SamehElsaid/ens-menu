/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { toast } from "react-toastify";
import { Category } from "@/types/Menu";
import { UploadResponse } from "@/types/Menu";
import {
  IoCloseOutline,
  IoImageOutline,
  IoPricetagOutline,
  IoAddCircleOutline,
  IoCloudUploadOutline,
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
} from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";
import { BiCategory } from "react-icons/bi";

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

export default function AddCategoryModal({
  menuId,
  category = null,
  onClose,
  onRefresh,
}: AddCategoryModalProps) {
  const t = useTranslations("Categories.addModal");
  const locale = useLocale();
  const isEdit = Boolean(category?.id);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
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
    } else {
      reset({ nameAr: "", nameEn: "", isActive: true });
      setImagePreview(null);
      setImage(null);
    }
  }, [category, reset]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreating) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isCreating]);

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
          true
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          toast.error(t("imageUploadError"));
          setIsCreating(false);
          return;
        }
        imageUrl = uploadResult.data.url;
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
          payload
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
          payload
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !isCreating && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out] border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <BiCategory className="text-primary text-2xl" />
              </div>
              <div>
                <h2 id="add-category-title" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {isEdit ? t("editTitle") : t("title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("names")}
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Names section */}
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoPricetagOutline className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("names")}
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
                        placeholder="e.g., Drinks"
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
                        placeholder="مثال: مشروبات"
                        dir="rtl"
                        error={errors.nameAr?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Status section */}
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoEllipseSharp className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("status")}
                </h3>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex rounded-2xl p-1 bg-gray-100 dark:bg-gray-600/40 border border-gray-200/80 dark:border-gray-600/50 w-fit">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${field.value === true
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
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${field.value === false
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

            {/* Image section */}
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoImageOutline className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("image")}
                </h3>
              </div>
              <div className="flex flex-col items-center gap-4">
                <label
                  className={`relative block w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${isDragOver
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : imagePreview
                      ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                      : "border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-600/20 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10"
                    }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center py-10 px-6 min-h-[160px]">
                    {imagePreview ? (
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner ring-1 ring-black/5">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveImage();
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white"
                          aria-label={t("removeImage")}
                        >
                          <IoCloseOutline className="text-3xl" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-gray-200/80 dark:bg-gray-600/50 flex items-center justify-center mb-3">
                          <IoCloudUploadOutline className="text-3xl text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                          {isDragOver ? t("uploadImage") : t("imageHint")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          PNG, JPG, WebP · max 2MB
                        </span>
                      </>
                    )}
                  </div>
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    {t("removeImage")}
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="shrink-0 justify-end flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400/30"
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
      </div>
    </div>
  );
}
