/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPut } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { toast } from "react-toastify";
import { Advertisement, UploadResponse } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoCloseOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { HiSpeakerphone } from "react-icons/hi";
import {
  Button,
  Field,
  Input,
  Modal,
  Textarea,
  focusRing,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  createAdvertisementSchema,
  type AdvertisementFormSchema,
} from "@/schemas/advertisementSchema";
import { UnmountClosed } from "react-collapse";
import { useApiAction } from "@/hooks/useApiAction";
import { toSafeExternalUrl } from "@/lib/normalizeExternalUrl";

type AddAdvertisementFormData = AdvertisementFormSchema;

interface AddAdvertisementModalProps {
  /** Menu-based ads (dashboard) */
  menuId?: string;
  /** Existing ad when editing */
  ad?: Advertisement | null;
  /** Use admin endpoints (/admin/ads) instead of menu endpoints */
  adminMode?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const AD_FORM_ID = "add-advertisement-form";

export default function AddAdvertisementModal({
  menuId,
  ad = null,
  adminMode = false,
  onClose,
  onRefresh,
}: AddAdvertisementModalProps) {
  const locale = useLocale();
  const t = useTranslations("Advertisements.addModal");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(ad?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { runApiAction } = useApiAction();

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
      createAdvertisementSchema(t),
    ) as unknown as Resolver<AddAdvertisementFormData>,
    mode: "onChange",
  });

  const handleImageUrlChange = useCallback(
    (image: File | null | string) => {
      setValue(
        "imageUrl",
        image
          ? typeof image === "string"
            ? image
            : URL.createObjectURL(image)
          : "",
      );
      trigger("imageUrl");
    },
    [setValue, trigger],
  );

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      return;
    }
    const resized = await _resizeImage(file);
    if (resized.size > 2 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      return;
    }

    setImage(resized);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(resized);
    handleImageUrlChange(resized);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    handleImageUrlChange(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("imageFormatError"));
      return;
    }
    const resized = await _resizeImage(file);
    if (resized.size > 2 * 1024 * 1024) {
      toast.error(t("imageSizeError"));
      return;
    }

    setImage(resized);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(resized);
    handleImageUrlChange(resized);
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
          true,
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          toast.error(t("imageUploadError"));
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadResult.data.url;
      } else {
        const existingImage =
          ad?.imageUrl ?? (ad as { image?: string } | null)?.image ?? null;
        if (existingImage) {
          imageUrl = existingImage;
        }
      }

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
        linkUrl: data.linkUrl
          ? (toSafeExternalUrl(data.linkUrl) ?? undefined)
          : undefined,
        imageUrl,
        image: imageUrl,
        ...(isEdit
          ? {
              position:
                (ad as { position?: string } | null)?.position ?? "banner",
            }
          : { position: "banner" }),
      };

      const request =
        isEdit && ad?.id != null
          ? () =>
              axiosPut<typeof payload, Advertisement>(
                adminMode ? `/admin/ads/${ad.id}` : `/ads/${ad.id}`,
                locale,
                payload,
              )
          : () =>
              axiosPost<typeof payload, Advertisement>(
                adminMode
                  ? "/admin/ads"
                  : `/menus/${menuId as string}/ads`,
                locale,
                payload,
              );
      await runApiAction(request, {
        successToast: isEdit ? t("editSuccess") : t("createSuccess"),
        errorToast: isEdit ? t("editError") : t("createError"),
        onSuccess: () => {
          onClose();
          onRefresh?.();
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("title")}
      description={t("headerSubtitle")}
      icon={<HiSpeakerphone className="size-5" />}
      size="lg"
      dismissible={!isSubmitting}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={AD_FORM_ID}
            loading={isSubmitting}
            disabled={isSubmitting}
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {isEdit ? t("save") : t("create")}
          </Button>
        </>
      }
    >
      <form
        id={AD_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-fg">
            {t("sectionTitles")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t("titleEn")} required error={errors.title?.message}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder={t("titlePlaceholder")}
                    data-autofocus
                  />
                )}
              />
            </Field>
            <Field
              label={t("titleAr")}
              required
              error={errors.titleAr?.message}
            >
              <Controller
                name="titleAr"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder="مثال: عرض الصيف"
                    dir="rtl"
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-fg">
            {t("sectionContent")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={t("contentEn")}
              required
              error={errors.content?.message}
            >
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    rows={3}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder={t("contentPlaceholder")}
                  />
                )}
              />
            </Field>
            <Field
              label={t("contentAr")}
              required
              error={errors.contentAr?.message}
            >
              <Controller
                name="contentAr"
                control={control}
                render={({ field }) => (
                  <Textarea
                    rows={3}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder="تفاصيل العرض..."
                    dir="rtl"
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-fg">
            {t("sectionMedia")}
          </h3>
          <Field label={t("image")} required error={errors.imageUrl?.message}>
            <label
              className={cn(
                "relative block w-full cursor-pointer rounded-lg border border-dashed transition-colors duration-(--dur-settle)",
                isDragOver
                  ? "border-brand bg-brand-soft"
                  : errors.imageUrl?.message
                    ? "border-danger bg-danger-soft/30"
                    : "border-line-strong bg-surface-2",
              )}
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
              <div className="flex min-h-32 flex-col items-center justify-center py-8 px-6">
                {imagePreview ? (
                  <div className="relative size-24 overflow-hidden rounded-lg bg-surface ring-1 ring-line">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center bg-overlay text-on-brand opacity-0 transition-opacity hover:opacity-100",
                        focusRing,
                      )}
                      aria-label={t("image")}
                    >
                      <IoCloseOutline className="size-6" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-surface-3 text-fg-muted">
                      <IoCloudUploadOutline className="size-6" aria-hidden />
                    </span>
                    <span className="text-center text-sm font-medium text-fg-muted">
                      {t("imageHint")}
                    </span>
                  </>
                )}
              </div>
            </label>
            <UnmountClosed isOpened={Boolean(errors.imageUrl?.message)}>
              <p className="mt-1 text-xs text-danger">
                {errors.imageUrl?.message}
              </p>
            </UnmountClosed>
          </Field>

          <Field label={t("linkUrl")} error={errors.linkUrl?.message}>
            <Controller
              name="linkUrl"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={t("linkUrlPlaceholder")}
                />
              )}
            />
          </Field>
        </section>
      </form>
    </Modal>
  );
}
