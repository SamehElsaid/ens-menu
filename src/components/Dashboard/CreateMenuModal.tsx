/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { pushMenuCreatedEvent } from "@/shared/gtmEvents";
import CurrencySelector from "@/components/Global/CurrencySelector";
import { createMenuSchema, CreateMenuSchema } from "@/schemas/createMenuSchema";
import { toast } from "react-toastify";
import { Menu, SlugCheckResponse, UploadResponse } from "@/types/Menu";
import {
  IoRestaurant,
  IoCloseOutline,
  IoPricetagOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoCashOutline,
  IoLinkOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircleOutline,
  IoAddCircleOutline,
  IoCloudUploadOutline,
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
import { normalizeMenuFromApi } from "@/lib/normalizeMenuFromApi";
import {
  publicMenuHostDisplay,
  sanitizeMenuSlugInput,
} from "@/lib/publicMenuUrl";
import { useApiAction } from "@/hooks/useApiAction";

interface CreateMenuModalProps {
  onClose: () => void;
  onMenuCreated?: (newMenu?: Menu) => void;
  onRefresh?: () => void;
}

const CREATE_MENU_FORM_ID = "onboarding-create-menu-form";

const LOGO_ACCEPT =
  ".png,.ico,.jpg,.jpeg,.webp,image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp";

const LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const LOGO_EXTENSIONS = /\.(png|ico|jpe?g|webp)$/i;

function isValidLogoFile(file: File): boolean {
  if (file.type && LOGO_MIME_TYPES.has(file.type)) return true;
  return LOGO_EXTENSIONS.test(file.name);
}

function parseSlugAvailability(
  data: SlugCheckResponse | undefined,
): boolean | null {
  if (!data) return null;
  if (typeof data.available === "boolean") return data.available;
  const isAvailable = (data as { isAvailable?: boolean }).isAvailable;
  if (typeof isAvailable === "boolean") return isAvailable;
  return null;
}

export default function CreateMenuModal({
  onClose,
  onRefresh,
  onMenuCreated,
}: CreateMenuModalProps) {
  const t = useTranslations("Menus.createModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateMenuSchema>({
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      slug: "",
      currency: "EGP",
    },
    resolver: yupResolver(
      createMenuSchema(t),
    ) as unknown as Resolver<CreateMenuSchema>,
    mode: "onChange",
  });

  const slugValue = useWatch({ control, name: "slug" });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    suggestions: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const { runApiAction } = useApiAction();

  // Debounced slug check
  useEffect(() => {
    if (!slugValue || slugValue.length < 3) {
      setSlugStatus({ checking: false, available: null, suggestions: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugStatus({ checking: true, available: null, suggestions: [] });
      try {
        const result = await axiosGet<SlugCheckResponse>(
          "/menus/check-slug",
          locale,
          undefined,
          { slug: slugValue },
        );
        const payload = result.data as SlugCheckResponse | undefined;
        const available = parseSlugAvailability(payload);
        setSlugStatus({
          checking: false,
          available,
          suggestions: payload?.suggestions ?? [],
        });
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugStatus({ checking: false, available: null, suggestions: [] });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slugValue, locale]);

  const onSubmit = async (data: CreateMenuSchema) => {
    if (data.slug && slugStatus.available === false) {
      toast.error(t("slugTakenError"));
      return;
    }

    if (!logo) {
      setLogoError(t("validation.logoRequired"));
      toast.error(t("validation.logoRequired"));
      return;
    }

    try {
      setIsCreating(true);
      setLogoError(null);

      const logoFormData = new FormData();
      logoFormData.append("type", "logos");
      logoFormData.append("file", logo);

      const uploadResult = await axiosPost<FormData, UploadResponse>(
        "/upload",
        locale,
        logoFormData,
        true,
      );

      if (!uploadResult.status || !uploadResult.data?.url) {
        console.error("Logo upload error:", uploadResult.data);
        toast.error(t("logoUploadError"));
        setIsCreating(false);
        return;
      }

      const logoUrl = uploadResult.data.url;

      const menuData = {
        nameEn: data.name,
        nameAr: data.nameAr,
        descriptionEn: data.description,
        descriptionAr: data.descriptionAr,
        slug: data.slug,
        currency: data.currency,
        logo: logoUrl,
      };

      await runApiAction(
        () => axiosPost<typeof menuData, Menu>("/menus", locale, menuData),
        {
          errorToast: t("createError"),
          onSuccess: (data) => {
            const apiPayload = data as Record<string, unknown>;
            const createdMenu = normalizeMenuFromApi({
              ...menuData,
              ...apiPayload,
              id: apiPayload.menuId ?? apiPayload.id,
              logo: logoUrl,
            });
            if (!createdMenu) {
              console.error("Failed to normalize menu from API:", data);
              toast.error(t("createError"));
              return;
            }
            pushMenuCreatedEvent(
              typeof createdMenu.uuid === "string"
                ? createdMenu.uuid
                : undefined,
            );
            toast.success(t("createSuccess"));
            onMenuCreated?.(createdMenu);
            onRefresh?.();
            onClose();
          },
        },
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue("slug", suggestion);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidLogoFile(file)) {
      toast.error(t("logoFormatError"));
      return;
    }

    const resized = await _resizeImage(file);
    if (resized.size > 2 * 1024 * 1024) {
      toast.error(t("logoSizeError"));
      return;
    }

    setLogoError(null);
    setLogo(resized);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(resized);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setLogoError(t("validation.logoRequired"));
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t("title")}
      icon={<IoRestaurant className="size-5" />}
      size="xl"
      dismissible={!isCreating}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            {t("cancel")}
          </Button>
          <Button
            id="onboarding-create-submit"
            variant="primary"
            type="submit"
            form={CREATE_MENU_FORM_ID}
            loading={isCreating}
            disabled={
              isCreating ||
              !logo ||
              !isValid ||
              slugStatus.checking ||
              slugStatus.available === false
            }
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {t("create")}
          </Button>
        </>
      }
    >
      <form
        id={CREATE_MENU_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoPricetagOutline
              className="size-4 shrink-0 text-fg-muted"
              aria-hidden
            />
            {t("menuNames")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t("nameEn")} required error={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("nameEnPlaceholder")}
                    data-autofocus
                  />
                )}
              />
            </Field>
            <Field label={t("nameAr")} required error={errors.nameAr?.message}>
              <Controller
                name="nameAr"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="مثال: قائمة مطعمي"
                    dir="rtl"
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoDocumentTextOutline
              className="size-4 shrink-0 text-fg-muted"
              aria-hidden
            />
            {t("descriptions")}
          </h3>
          <Field label={t("descriptionEn")}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  rows={3}
                  className="resize-none"
                  placeholder={t("descriptionEnPlaceholder")}
                />
              )}
            />
          </Field>
          <Field label={t("descriptionAr")}>
            <Controller
              name="descriptionAr"
              control={control}
              render={({ field }) => (
                <Textarea
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  rows={3}
                  className="resize-none"
                  placeholder="اكتب وصف القائمة بالعربية..."
                  dir="rtl"
                />
              )}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoImageOutline
              className="size-4 shrink-0 text-fg-muted"
              aria-hidden
            />
            {t("logo")} *
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="flex size-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface-2">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="size-full object-contain"
                  />
                ) : (
                  <IoRestaurant className="size-12 text-fg-subtle" />
                )}
              </div>
              {logoPreview && (
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  onClick={handleRemoveLogo}
                  aria-label={t("cancel")}
                  className="absolute -end-2 -top-2"
                >
                  <IoCloseOutline className="size-4" />
                </Button>
              )}
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={LOGO_ACCEPT}
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand/90",
                    focusRing,
                  )}
                >
                  <IoCloudUploadOutline className="size-5" />
                  {t("logoUpload")}
                </span>
              </label>
              <p className="text-center text-xs text-fg-muted">
                {t("logoHint")}
              </p>
              <p className="text-center text-xs text-fg-subtle">
                {t("supportedFormats")}
              </p>
              {logoError && <p className="text-xs text-danger">{logoError}</p>}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoCashOutline
              className="size-4 shrink-0 text-fg-muted"
              aria-hidden
            />
            {t("currency")}
          </h3>
          <Field label={t("currencyLabel")} required>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <CurrencySelector
                  value={field.value}
                  onChange={field.onChange}
                  showArabOnly={locale === "ar"}
                />
              )}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoLinkOutline
              className="size-4 shrink-0 text-fg-muted"
              aria-hidden
            />
            {t("urlSettings")}
          </h3>
          <Field label={t("slug")} required error={errors.slug?.message}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(sanitizeMenuSlugInput(e.target.value))
                  }
                  onBlur={field.onBlur}
                  className="font-mono"
                  placeholder={t("slugPlaceholder")}
                  aria-invalid={
                    slugStatus.available === false ? true : undefined
                  }
                  endIcon={
                    slugStatus.checking ? (
                      <Spinner size="sm" />
                    ) : slugStatus.available === true ? (
                      <IoCheckmarkCircle className="size-5 text-success" />
                    ) : slugStatus.available === false ? (
                      <IoCloseCircle className="size-5 text-danger" />
                    ) : undefined
                  }
                />
              )}
            />
          </Field>

          {slugStatus.checking && (
            <p className="text-sm text-fg-muted">{t("slugChecking")}</p>
          )}
          {!slugStatus.checking && slugStatus.available === true && (
            <p className="flex items-center gap-2 text-sm text-success">
              <IoCheckmarkCircle className="size-4" />
              {t("slugAvailable")}
            </p>
          )}
          {!slugStatus.checking && slugStatus.available === false && (
            <p className="flex items-center gap-2 text-sm text-danger">
              <IoCloseCircle className="size-4" />
              {t("slugTaken")}
            </p>
          )}

          {!slugStatus.checking &&
            slugStatus.available === false &&
            slugStatus.suggestions.length > 0 && (
              <div className="rounded-lg border border-line bg-surface-2 p-3">
                <p className="mb-2 text-xs font-medium text-fg">
                  {t("slugSuggestions")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slugStatus.suggestions.map(
                    (suggestion: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          "rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-xs text-fg transition-colors hover:border-brand/30 hover:bg-brand-soft",
                          focusRing,
                        )}
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

          <div className="rounded-lg bg-brand-soft/50 p-3 select-none">
            <div className="flex items-start gap-2">
              <IoInformationCircleOutline className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-fg">
                  {t("slugHint")}
                </p>
                <p
                  className="font-mono text-xs text-fg-muted select-none"
                  dir="ltr"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {publicMenuHostDisplay(slugValue)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
