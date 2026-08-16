"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageShell,
  Spinner,
  Switch,
  Textarea,
} from "@/components/ui";
import CurrencySelector from "@/components/Global/CurrencySelector";
import { useTranslations, useLocale } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { IoCloudUploadOutline, IoCloseOutline } from "react-icons/io5";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { SET_ACTIVE_MENU_CACHE } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu, MenusResponse, UploadResponse } from "@/types/Menu";
import { useParams, useRouter } from "next/navigation";
import DeleteMenuConfirm from "../../../../../components/Dashboard/DeleteMenuConfirm";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import ImageLoad from "@/components/ImageLoad";
import { Subscription, SubscriptionResponse } from "@/types/Subscription";
import { getEffectiveMaxMenus } from "@/lib/subscriptionMenus";

/**
 * A labelled setting with its control on the trailing edge. Every toggle on
 * this page reads the same way, so the eye can scan the column of switches
 * without re-parsing each row.
 */
function SettingRow({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

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
      <div className="py-16 text-center text-fg-muted">
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
          values.servicePercent === null || values.servicePercent === undefined
            ? null
            : Number(values.servicePercent),
        logo: logoUrl ?? menu?.logo ?? null,
      };
      const result = await axiosPut<typeof payload, Menu>(
        `/menus/${menuId}`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        dispatch(SET_ACTIVE_MENU_CACHE(payload as unknown as Menu));
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

  const dirty = isDirty || logoDirty;

  const handleDiscard = () => {
    reset();
    setLogoFile(null);
    setLogoPreview(null);
    setLogoDirty(false);
    setLocalIsActive(menu.isActive);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageShell
        kind="detail"
        header={
          <PageTitleWithHelp
            title={tSettings("generalSettings")}
            description={
              locale === "ar"
                ? "اسم القائمة ووصفها وشعارها والضرائب وحالة النشر."
                : "Name, description, logo, charges and publish state for this menu."
            }
          />
        }
        /*
          The commit bar rides the floor of the viewport once something changes,
          so a long settings page never hides its own save action below the
          fold. It is absent entirely while the form is pristine.
        */
        footerSticky={dirty}
        footer={
          dirty ? (
            <div
              id="onboarding-settings-save"
              className="flex flex-wrap items-center justify-between gap-2"
              role="status"
            >
              <p className="text-xs text-fg-muted">
                {tSettings("unsavedChanges")}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDiscard}
                  disabled={isSubmitting}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {tSettings("saveChanges")}
                </Button>
              </div>
            </div>
          ) : undefined
        }
      >
        <Card as="section" id="onboarding-settings-general">
          <CardHeader
            title={tSettings("generalSettings")}
            description={
              locale === "ar"
                ? "قم بمراجعة معلومات قائمتك الأساسية من الاسم والوصف."
                : "Review the basic information of your menu like name and description."
            }
          />

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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
        </Card>

        <div
          id="onboarding-settings-branding"
          className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        >
          <Card as="section">
            <CardHeader
              title={tMenusCreate("logo")}
              description={
                locale === "ar"
                  ? "قم بتحديث شعار قائمتك الذي يظهر في الواجهة."
                  : "Update the logo for your menu as shown in the UI."
              }
            />

            <div className="mt-3 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface-2">
                  {logoPreview || initialLogo ? (
                    <ImageLoad
                      width={100}
                      height={100}
                      src={logoPreview ?? initialLogo ?? ""}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-fg-subtle">
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

              <div className="flex w-full flex-col items-center gap-1.5">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.ico,.jpg,.jpeg,image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg"
                  onChange={handleLogoChange}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => logoInputRef.current?.click()}
                  startIcon={<IoCloudUploadOutline className="size-3.5" />}
                >
                  {tMenusCreate("logoUpload")}
                </Button>
                <p className="text-center text-xs text-fg-subtle">
                  {tMenusCreate("logoHint")}
                </p>
              </div>
            </div>
          </Card>

          <Card as="section" className="lg:col-span-2">
            <CardHeader
              title={tMenusCreate("currency")}
              description={
                locale === "ar"
                  ? "العملة المستخدمة في جميع أسعار قائمتك."
                  : "Currency used for all prices in your menu."
              }
            />

            <div className="mt-3">
              <Field
                label={tMenusCreate("currencyLabel")}
                error={errors.currency?.message}
                hint={
                  locale === "ar"
                    ? "لا يمكن تعديل العملة من هذه الصفحة. قم بإنشاء قائمة جديدة إذا كنت بحاجة لتغيير العملة."
                    : "Currency is read-only here. Create a new menu if you need to change it."
                }
              >
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
            </div>
          </Card>
        </div>

        <Card as="section" id="onboarding-settings-chatbot">
          <SettingRow
            label={tSettings("chatbotEnabled")}
            description={tSettings("chatbotEnabledDescription")}
          >
            <Controller
              name="chatbotEnabled"
              control={control}
              render={({ field }) => (
                <>
                  <span className="text-xs text-fg-muted">
                    {field.value
                      ? tSettings("chatbotEnabledOn")
                      : tSettings("chatbotEnabledOff")}
                  </span>
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    aria-label={tSettings("chatbotEnabled")}
                  />
                </>
              )}
            />
          </SettingRow>
        </Card>

        <Card as="section" id="onboarding-settings-tax-service">
          <CardHeader
            title={tSettings("taxServiceTitle")}
            description={tSettings("taxServiceDescription")}
          />

          <div className="mt-3 space-y-2.5">
            <SettingRow
              label={tSettings("taxEnabled")}
              description={tSettings("taxEnabledDescription")}
            >
              <span className="text-xs text-fg-muted">
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
            </SettingRow>
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

            <SettingRow
              label={tSettings("serviceEnabled")}
              description={tSettings("serviceEnabledDescription")}
            >
              <span className="text-xs text-fg-muted">
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
            </SettingRow>
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
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card as="section" id="onboarding-settings-status">
            <CardHeader
              title={tSettings("menuStatus")}
              description={
                locale === "ar"
                  ? "عرض ما إذا كانت القائمة مفعلة أو متوقفة."
                  : "See whether this menu is active or paused."
              }
            />

            <div className="mt-3">
              <SettingRow
                label={tSettings("currentStatus")}
                description={
                  locale === "ar"
                    ? "قم بتفعيل أو إيقاف القائمة من هنا."
                    : "Activate or pause this menu from here."
                }
              >
                <Badge tone={localIsActive ? "success" : "danger"} dot>
                  {localIsActive ? tMenuCard("active") : tMenuCard("inactive")}
                </Badge>
                <Button
                  type="button"
                  variant={localIsActive ? "dangerGhost" : "secondary"}
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={togglingStatus}
                  loading={togglingStatus}
                >
                  {localIsActive ? tMenuCard("pause") : tMenuCard("play")}
                </Button>
              </SettingRow>
            </div>
          </Card>

          <Card as="section" className="border-danger-line">
            <CardHeader
              title={tSettings("dangerZone")}
              description={
                locale === "ar"
                  ? "لحذف القائمة اكتب اسمها في النافذة المنبثقة للتأكيد."
                  : "To delete this menu, type its name in the confirmation dialog."
              }
            />

            <div className="mt-3">
              <Button
                type="button"
                variant="dangerGhost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                {tSettings("deleteThisMenu")}
              </Button>
            </div>
          </Card>
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
      </PageShell>
    </form>
  );
}
