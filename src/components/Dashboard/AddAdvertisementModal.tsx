"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { toast } from "react-toastify";
import { Advertisement, UploadResponse } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoCloseOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { HiSpeakerphone } from "react-icons/hi";
import CustomBtn from "../Custom/CustomBtn";
import {
  createAdvertisementSchema,
  type AdvertisementFormSchema,
} from "@/schemas/advertisementSchema";
import { UnmountClosed } from "react-collapse";

type AddAdvertisementFormData = AdvertisementFormSchema;

interface AddAdvertisementModalProps {
  menuId: string;
  ad?: Advertisement | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AddAdvertisementModal({
  menuId,
  ad = null,
  onClose,
  onRefresh,
}: AddAdvertisementModalProps) {
  const locale = useLocale();
  const t = useTranslations("Advertisements.addModal");
  const isEdit = Boolean(ad?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },

    setValue,
    trigger,
    reset,
  } = useForm<AddAdvertisementFormData>({
    defaultValues: {
      title: "",
      titleAr: "",
      content: "",
      contentAr: "",
      linkUrl: "",
    },
    resolver: yupResolver(
      createAdvertisementSchema(t)
    ) as unknown as Resolver<AddAdvertisementFormData>,
    mode: "onChange",
  });

  const handleImageUrlChange = useCallback((image: File | null | string) => {
    setValue("imageUrl", image ? typeof image === "string" ? image : URL.createObjectURL(image) : "");
    trigger("imageUrl");
  }, [setValue, trigger]);

  useEffect(() => {
    if (ad) {
      reset({
        title: ad.title ?? "",
        titleAr: ad.titleAr ?? "",
        content: ad.content ?? "",
        contentAr: ad.contentAr ?? "",
        linkUrl: ad.linkUrl ?? "",
      });
      const url = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
      setImagePreview(url || null);
      setImage(null);
      handleImageUrlChange(url);
    } else {
      reset();
      setImagePreview(null);
      setImage(null);

    }
  }, [ad, reset, handleImageUrlChange]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isSubmitting]);

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
    handleImageUrlChange(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    handleImageUrlChange(null);
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

  const onSubmit = async (data: AddAdvertisementFormData) => {
    try {
      setIsSubmitting(true);

      let imageUrl: string | null = null;

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("type", "ads");

        const uploadResult = await axiosPost<FormData, UploadResponse>(
          "/upload",
          locale,
          formData,
          true
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          toast.error(t("imageUploadError"));
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadResult.data.url;
      } else if (ad?.imageUrl) {
        imageUrl = ad.imageUrl;
      }

      // For new advertisements, image is required
      if (!imageUrl && !isEdit) {
        toast.error(t("imageRequired"));
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: data.title.trim(),
        titleAr: data.titleAr.trim(),
        content: data.content.trim(),
        contentAr: data.contentAr.trim(),
        linkUrl: data.linkUrl ?? undefined,
        imageUrl,
        image: imageUrl,
      };

      if (isEdit && ad?.id != null) {
        const result = await axiosPatch<typeof payload, Advertisement>(
          `/ads/${ad.id}`,
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
        const result = await axiosPost<typeof payload, Advertisement>(
          `/menus/${menuId}/ads`,
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
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()
      }
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-advertisement-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <HiSpeakerphone className="text-primary text-2xl" />
              </div>
              <div>
                <h2
                  id="add-advertisement-title"
                  className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
                >
                  {isEdit ? t("editTitle") : t("title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("headerSubtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              aria-label="Close"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="overflow-y-auto p-6 space-y-6">
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("sectionTitles")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("titleEn")} *
                  </label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="e.g., Summer Offer"
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        error={errors.title?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("titleAr")} *
                  </label>
                  <Controller
                    name="titleAr"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="مثال: عرض الصيف"
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                        error={errors.titleAr?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("sectionContent")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("contentEn")} *
                  </label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="textarea"
                        rows={3}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value
                          )
                        }
                        onBlur={field.onBlur}
                        placeholder="Promotion details..."
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        error={errors.content?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("contentAr")} *
                  </label>
                  <Controller
                    name="contentAr"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="textarea"
                        rows={3}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            (e as React.ChangeEvent<HTMLInputElement>).target
                              .value
                          )
                        }
                        onBlur={field.onBlur}
                        placeholder="تفاصيل العرض..."
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        error={errors.contentAr?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {t("sectionMedia")}
              </h3>
             
              <div className="grid grid-cols-1  gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("image")} *
                  </label>
                  <label
                    className={`relative ${errors.imageUrl?.message ? "border-red-500 bg-red-50" : ""} block w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${isDragOver
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
                    <div className="flex flex-col items-center justify-center py-8 px-6 min-h-[120px]">
                      {imagePreview ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner ring-1 ring-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                            aria-label={t("image")}
                          >
                            <IoCloseOutline className="text-2xl" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-gray-200/80 dark:bg-gray-600/50 flex items-center justify-center mb-2">
                            <IoCloudUploadOutline className="text-2xl text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
                            {t("imageHint")}
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                  <UnmountClosed isOpened={Boolean(errors.imageUrl?.message)}>
                    <p className="text-xs text-red-500 mt-1">{errors.imageUrl?.message}</p>
                  </UnmountClosed>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("linkUrl")}
                  </label>
                  <Controller
                    name="linkUrl"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        type="text"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        placeholder="https://..."
                        className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        error={errors.linkUrl?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="shrink-0 justify-end flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </button>
            <div className="w-fit!">
              <CustomBtn
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
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

