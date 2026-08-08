"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Field,
  Input,
  Spinner,
  Switch,
  Textarea,
} from "@/components/ui";
import CurrencySelector from "@/components/Global/CurrencySelector";
import { useTranslations, useLocale } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  IoPricetagOutline,
  IoDocumentTextOutline,
  IoCashOutline,
  IoWarningOutline,
  IoImageOutline,
  IoCloudUploadOutline,
  IoCloseOutline,
  IoSaveOutline,
  IoChatbubblesOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu, MenusResponse, UploadResponse } from "@/types/Menu";
import { useParams, useRouter } from "next/navigation";
import DeleteMenuConfirm from "../../../../../components/Dashboard/DeleteMenuConfirm";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import ImageLoad from "@/components/ImageLoad";
import { Subscription, SubscriptionResponse } from "@/types/Subscription";
import { getEffectiveMaxMenus } from "@/lib/subscriptionMenus";

interface SettingsFormValues {
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  currency: string;
  isActive: boolean;
  chatbotEnabled: boolean;
  taxEnabled: boolean;
  taxPercent?: number | null;
  serviceEnabled: boolean;
  servicePercent?: number | null;
}

const settingsSchema = (
  t: ReturnType<typeof useTranslations<"Menus.createModal">>,
) =>
  yup.object({
    name: yup.string().required(t("validation.nameEnRequired")),
    nameAr: yup.string().required(t("validation.nameArRequired")),
    description: yup.string().nullable(),
    descriptionAr: yup.string().nullable(),
    currency: yup.string().required(t("validation.currencyRequired")),
    chatbotEnabled: yup.boolean().default(false),
    taxEnabled: yup.boolean().default(false),
    taxPercent: yup
      .number()
      .nullable()
      .transform((value, original) =>
        original === "" || original === null || original === undefined
          ? null
          : value,
      )
      .min(0)
      .max(100),
    serviceEnabled: yup.boolean().default(false),
    servicePercent: yup
      .number()
      .nullable()
      .transform((value, original) =>
        original === "" || original === null || original === undefined
          ? null
          : value,
      )
      .min(0)
      .max(100),
  }) as yup.ObjectSchema<SettingsFormValues>;

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { menu, loading } = useAppSelector((state) => state.menuData);
  const tMenusCreate = useTranslations("Menus.createModal");
  const tMenusList = useTranslations("Menus");
  const tMenuCard = useTranslations("Menus.menuCard");
  const tSettings = useTranslations("menuSettingsPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoDirty, setLogoDirty] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [localIsActive, setLocalIsActive] = useState<boolean>(
    menu?.isActive ?? false,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const { menu: menuId } = useParams();

  const fetchSubscriptionAndMenus = useCallback(async () => {
    const [subResult, menusResult] = await Promise.all([
      axiosGet<SubscriptionResponse>("/user/subscription", locale),
      axiosGet<MenusResponse | Menu[]>("/menus", locale, undefined, { locale }),
    ]);

    if (subResult.status && subResult.data?.subscription) {
      setSubscription(subResult.data.subscription);
    }

    if (menusResult.status && menusResult.data) {
      const menusList = Array.isArray(menusResult.data)
        ? menusResult.data
        : (menusResult.data.menus ?? []);
      setAllMenus(menusList);
    }
  }, [locale]);

  useEffect(() => {
    void fetchSubscriptionAndMenus();
  }, [fetchSubscriptionAndMenus]);

  const wouldExceedActiveMenuLimit = useCallback(
    (activating: boolean) => {
      if (!activating || !menu) return false;

      const effectiveMax = getEffectiveMaxMenus(subscription);
      const otherActiveCount = allMenus.filter(
        (m) => m.isActive && String(m.id) !== String(menu.id),
      ).length;

      return otherActiveCount >= effectiveMax;
    },
    [allMenus, menu, subscription],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: yupResolver(settingsSchema(tMenusCreate)),
    defaultValues: {
      name: menu?.nameEn ?? "",
      nameAr: menu?.nameAr ?? "",
      description: menu?.descriptionEn ?? "",
      descriptionAr: menu?.descriptionAr ?? "",
      currency: menu?.currency ?? "AED",
      isActive: menu?.isActive ?? false,
      chatbotEnabled: menu?.chatbotEnabled ?? false,
      taxEnabled: menu?.taxEnabled ?? false,
      taxPercent: menu?.taxPercent ?? null,
      serviceEnabled: menu?.serviceEnabled ?? false,
      servicePercent: menu?.servicePercent ?? null,
    },
  });

  const taxEnabledWatch = useWatch({ control, name: "taxEnabled" });
  const serviceEnabledWatch = useWatch({ control, name: "serviceEnabled" });

  useEffect(() => {
    if (!menu) return;

    reset({
      name: menu.nameEn,
      nameAr: menu.nameAr,
      description: menu.descriptionEn ?? "",
      descriptionAr: menu.descriptionAr ?? "",
      currency: menu.currency,
      isActive: menu.isActive,
      chatbotEnabled: menu.chatbotEnabled ?? false,
      taxEnabled: menu.taxEnabled ?? false,
      taxPercent: menu.taxPercent ?? null,
      serviceEnabled: menu.serviceEnabled ?? false,
      servicePercent: menu.servicePercent ?? null,
    });
    // Keep local active state in sync with latest menu data
    setLocalIsActive(menu.isActive);
  }, [menu, reset]);

  const initialLogo = menu?.logo ?? null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-fg-muted">
          {locale === "ar"
            ? "جاري تحميل إعدادات القائمة..."
            : "Loading menu settings..."}
        </p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400">
        <p className="font-medium">
          {locale === "ar"
            ? "لم يتم العثور على بيانات القائمة. يرجى العودة واختيار قائمة صالحة."
            : "Menu data not found. Please go back and choose a valid menu."}
        </p>
      </div>
    );
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/png",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(tMenusCreate("logoFormatError"));
      return;
    }

    const resized = await _resizeImage(file);
    if (resized.size > 2 * 1024 * 1024) {
      toast.error(tMenusCreate("logoSizeError"));
      return;
    }

    setLogoFile(resized);
    setLogoDirty(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(resized);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoDirty(true);
  };

  const handleToggleStatus = async () => {
    if (!menu) return;

    const nextValue = !localIsActive;

    if (wouldExceedActiveMenuLimit(nextValue)) {
      await fetchSubscriptionAndMenus();
      if (wouldExceedActiveMenuLimit(nextValue)) {
        toast.error(tMenusList("switchMenuLimitMessage"));
        return;
      }
    }

    setTogglingStatus(true);
    setLocalIsActive(nextValue);
    setValue("isActive", nextValue, { shouldDirty: true });
    setTogglingStatus(false);
  };

  const onSubmit = async (values: SettingsFormValues) => {
    if (!menu) return;

    if (wouldExceedActiveMenuLimit(values.isActive)) {
      await fetchSubscriptionAndMenus();
      if (wouldExceedActiveMenuLimit(values.isActive)) {
        toast.error(tMenusList("switchMenuLimitMessage"));
        return;
      }
    }

    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("type", "logos");
        logoFormData.append("file", logoFile);

        const uploadResult = await axiosPost<FormData, UploadResponse>(
          "/upload",
          locale,
          logoFormData,
          true,
        );

        if (!uploadResult.status || !uploadResult.data?.url) {
          console.error("Logo upload error:", uploadResult.data);
          toast.error(tSettings("logoUploadFailed"));
          return;
        }

        logoUrl = uploadResult.data.url;
      }

      const payload = {
        nameEn: values.name,
        nameAr: values.nameAr,
        descriptionEn: values.description,
        descriptionAr: values.descriptionAr,
        currency: values.currency,
        id: menuId,
        isActive: values.isActive,
        chatbotEnabled: values.chatbotEnabled,
        taxEnabled: values.taxEnabled,
        taxPercent:
          values.taxPercent === null || values.taxPercent === undefined
            ? null
            : Number(values.taxPercent),
        serviceEnabled: values.serviceEnabled,
        servicePercent:
          values.servicePercent === null ||
          values.servicePercent === undefined
            ? null
            : Number(values.servicePercent),
        logo: logoUrl ?? menu?.logo ?? null,
      };
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${menuId}`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        dispatch(SET_ACTIVE_USER(payload as unknown as Menu));
        toast.success(
          locale === "ar"
            ? "تم تحديث إعدادات القائمة"
            : "Menu settings updated",
        );
        void fetchSubscriptionAndMenus();
      } else {
        toast.error(tMenusList("toggleError"));
      }
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <PageTitleWithHelp className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {tSettings("generalSettings")}
        </h1>
      </PageTitleWithHelp>

      {/* General information */}
      <section
        id="onboarding-settings-general"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IoPricetagOutline className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {tSettings("generalSettings")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {locale === "ar"
                  ? "قم بمراجعة معلومات قائمتك الأساسية من الاسم والوصف."
                  : "Review the basic information of your menu like name and description."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Field
                label={tMenusCreate("nameEn")}
                required
                error={errors.name?.message}
              >
                <Input
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={tSettings("namePlaceholder")}
                />
              </Field>
            )}
          />

          <Controller
            name="nameAr"
            control={control}
            render={({ field }) => (
              <Field
                label={tMenusCreate("nameAr")}
                required
                error={errors.nameAr?.message}
              >
                <Input
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="قائمة مطعمي"
                />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Field label={tMenusCreate("descriptionEn")}>
                <Textarea
                  rows={3}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={tSettings("descriptionPlaceholder")}
                />
              </Field>
            )}
          />

          <Controller
            name="descriptionAr"
            control={control}
            render={({ field }) => (
              <Field label={tMenusCreate("descriptionAr")}>
                <Textarea
                  rows={3}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="اكتب وصف القائمة بالعربية..."
                />
              </Field>
            )}
          />
        </div>
      </section>

      {/* Logo, currency & status */}

      <section id="onboarding-settings-branding" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IoImageOutline className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {tMenusCreate("logo")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {locale === "ar"
                    ? "قم بتحديث شعار قائمتك الذي يظهر في الواجهة."
                    : "Update the logo for your menu as shown in the UI."}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-800/60 overflow-hidden">
                  {logoPreview || initialLogo ? (
                     
                    <ImageLoad
                      width={100}
                      height={100}
                      src={logoPreview ?? initialLogo ?? ""}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-300 dark:text-slate-500 text-xs">
                      {tSettings("noLogo")}
                    </span>
                  )}
                </div>
                {(logoPreview || initialLogo) && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    iconOnly
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -end-2 size-7 rounded-full!"
                    aria-label={tCommon("remove")}
                  >
                    <IoCloseOutline className="text-sm" />
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 w-full">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.ico,.jpg,.jpeg,image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg"
                  onChange={handleLogoChange}
                  className="sr-only"
                />
                <Button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  startIcon={<IoCloudUploadOutline className="text-xl" />}
                >
                  {tMenusCreate("logoUpload")}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  {tMenusCreate("logoHint")}
                </p>
              </div>
            </div>
          </div>

          {/* Currency card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IoCashOutline className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {tMenusCreate("currency")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {locale === "ar"
                    ? "العملة المستخدمة في جميع أسعار قائمتك."
                    : "Currency used for all prices in your menu."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {tMenusCreate("currencyLabel")}
              </label>
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
              {errors.currency?.message && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.currency.message}
                </p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {locale === "ar"
                  ? "لا يمكن تعديل العملة من هذه الصفحة. قم بإنشاء قائمة جديدة إذا كنت بحاجة لتغيير العملة."
                  : "Currency is read-only here. Create a new menu if you need to change it."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot toggle */}
      <section
        id="onboarding-settings-chatbot"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center">
              <IoChatbubblesOutline className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {tSettings("chatbotEnabled")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {tSettings("chatbotEnabledDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              <Controller
                name="chatbotEnabled"
                control={control}
                render={({ field }) => (
                  <span>
                    {field.value
                      ? tSettings("chatbotEnabledOn")
                      : tSettings("chatbotEnabledOff")}
                  </span>
                )}
              />
            </span>
            <Controller
              name="chatbotEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  aria-label={tSettings("chatbotEnabled")}
                />
              )}
            />
          </div>
        </div>
      </section>

      {/* Tax & service (optional) */}
      <section
        id="onboarding-settings-tax-service"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center">
            <IoReceiptOutline className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {tSettings("taxServiceTitle")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tSettings("taxServiceDescription")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {tSettings("taxEnabled")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {tSettings("taxEnabledDescription")}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {taxEnabledWatch
                  ? tSettings("enabledOn")
                  : tSettings("enabledOff")}
              </span>
              <Controller
                name="taxEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    aria-label={tSettings("taxEnabled")}
                  />
                )}
              />
            </div>
          </div>
          {taxEnabledWatch && (
            <Controller
              name="taxPercent"
              control={control}
              render={({ field }) => (
                <Field
                  label={tSettings("taxPercent")}
                  error={errors.taxPercent?.message}
                  className="ps-1"
                >
                  <Input
                    type="number"
                    value={
                      field.value === null || field.value === undefined
                        ? ""
                        : String(field.value)
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      field.onChange(raw === "" ? null : Number(raw));
                    }}
                    placeholder={tSettings("taxPercentPlaceholder")}
                  />
                </Field>
              )}
            />
          )}

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {tSettings("serviceEnabled")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {tSettings("serviceEnabledDescription")}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {serviceEnabledWatch
                  ? tSettings("enabledOn")
                  : tSettings("enabledOff")}
              </span>
              <Controller
                name="serviceEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    aria-label={tSettings("serviceEnabled")}
                  />
                )}
              />
            </div>
          </div>
          {serviceEnabledWatch && (
            <Controller
              name="servicePercent"
              control={control}
              render={({ field }) => (
                <Field
                  label={tSettings("servicePercent")}
                  error={errors.servicePercent?.message}
                  className="ps-1"
                >
                  <Input
                    type="number"
                    value={
                      field.value === null || field.value === undefined
                        ? ""
                        : String(field.value)
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      field.onChange(raw === "" ? null : Number(raw));
                    }}
                    placeholder={tSettings("servicePercentPlaceholder")}
                  />
                </Field>
              )}
            />
          )}
        </div>
      </section>

      {/* Locked / advanced sections */}
      <section className="flex flex-col gap-6 lg:flex-row w-full">        {/* Favicon / logo for menu */}
        {/* Status card */}
        <div
          id="onboarding-settings-status"
          className="bg-white dark:bg-slate-900 rounded-2xl border min-w-[32%] border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <IoDocumentTextOutline className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {tSettings("menuStatus")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {locale === "ar"
                    ? "عرض ما إذا كانت القائمة مفعلة أو متوقفة."
                    : "See whether this menu is active or paused."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {tSettings("currentStatus")}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  localIsActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    localIsActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {localIsActive ? tMenuCard("active") : tMenuCard("inactive")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {locale === "ar"
                ? "قم بتفعيل أو إيقاف القائمة من هنا."
                : "Activate or pause this menu from here."}
            </p>
            <Button
              type="button"
              variant={localIsActive ? "dangerGhost" : "primary"}
              size="sm"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              loading={togglingStatus}
            >
              {localIsActive ? tMenuCard("pause") : tMenuCard("play")}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-linear-to-r w-full from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-2 ">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300">
              <IoWarningOutline className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                {tSettings("dangerZone")}
              </h3>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
                {locale === "ar"
                  ? "إجراءات حساسة مثل حذف القائمة سيتم نقلها لاحقًا إلى هذه المنطقة."
                  : "Sensitive actions like deleting this menu will be moved here in the future."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <Button
              type="button"
              variant="dangerGhost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {tSettings("deleteThisMenu")}
            </Button>
            <p className="text-[11px] text-red-500/80 dark:text-red-300/80">
              {locale === "ar"
                ? "لحذف القائمة اكتب اسمها في النافذة المنبثقة للتأكيد."
                : "To delete this menu, type its name in the confirmation dialog."}
            </p>
          </div>
        </div>
      </section>

      {/* Footer actions (visual only) */}
      <div
        id="onboarding-settings-save"
        className="flex flex-col md:flex-row justify-end gap-3 pt-4 pb-10 border-t border-slate-100 dark:border-slate-800 mt-4"
      >
        <Button type="button" variant="secondary" disabled>
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={(!isDirty && !logoDirty) || isSubmitting}
          size="lg"
          className="w-fit!"
          startIcon={<IoSaveOutline className="text-xl" />}
        >
          {tSettings("saveChanges")}
        </Button>
      </div>

      {isDeleteModalOpen && (
        <DeleteMenuConfirm
          menuId={String(menuId)}
          menuTitle={locale === "ar" ? menu.nameAr : menu.nameEn}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={() => {
            router.push(`/dashboard`);
          }}
        />
      )}
    </form>
  );
}
