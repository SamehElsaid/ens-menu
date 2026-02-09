"use client";

import { useEffect, useState } from "react";
import CustomInput from "@/components/Custom/CustomInput";
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
} from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { axiosPatch, axiosPost } from "@/shared/axiosCall";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu, UploadResponse } from "@/types/Menu";
import { useParams, useRouter } from "next/navigation";
import CustomBtn from "@/components/Custom/CustomBtn";
import DeleteMenuConfirm from "../../../../../components/Dashboard/DeleteMenuConfirm";

interface SettingsFormValues {
    name: string;
    nameAr: string;
    description?: string | null;
    descriptionAr?: string | null;
    currency: string;
    isActive: boolean;
}

const settingsSchema = (
    t: ReturnType<typeof useTranslations<"Menus.createModal">>
) =>
    yup.object({
        name: yup.string().required(t("validation.nameEnRequired")),
        nameAr: yup.string().required(t("validation.nameArRequired")),
        description: yup.string().nullable(),
        descriptionAr: yup.string().nullable(),
        currency: yup.string().required(t("validation.currencyRequired")),
    }) as yup.ObjectSchema<SettingsFormValues>;

export default function SettingsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { menu, loading } = useAppSelector((state) => state.menuData);
    const tMenus = useTranslations("Menus.createModal");
    const tMenuCard = useTranslations("Menus.menuCard");
    const locale = useLocale();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoDirty, setLogoDirty] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [localIsActive, setLocalIsActive] = useState<boolean>(
        menu?.isActive ?? false
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { menu: menuId } = useParams();

    const userData = useAppSelector((state) => state.auth.data);
    const planId = (userData as { user?: { subscription?: { planId?: number } } })?.user?.subscription?.planId;
    const isFreePlan = planId === 1;
  

    console.log(menuId);
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<SettingsFormValues>({
        resolver: yupResolver(settingsSchema(tMenus)),
        defaultValues: {
            name: menu?.nameEn ?? "",
            nameAr: menu?.nameAr ?? "",
            description: menu?.descriptionEn ?? "",
            descriptionAr: menu?.descriptionAr ?? "",
            currency: menu?.currency ?? "AED",
            isActive: menu?.isActive ?? false,
        },
    });



    useEffect(() => {
        if (!menu) return;

        reset({
            name: menu.nameEn,
            nameAr: menu.nameAr,
            description: menu.descriptionEn ?? "",
            descriptionAr: menu.descriptionAr ?? "",
            currency: menu.currency,
            isActive: menu.isActive,
        });
        // Keep local active state in sync with latest menu data
        setLocalIsActive(menu.isActive);
    }, [menu, reset]);

    const initialLogo = menu?.logo ?? null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-slate-500">
                    {locale === "ar" ? "جاري تحميل إعدادات القائمة..." : "Loading menu settings..."}
                </p>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="py-16 text-center text-slate-500">
                <p className="font-medium">
                    {locale === "ar"
                        ? "لم يتم العثور على بيانات القائمة. يرجى العودة واختيار قائمة صالحة."
                        : "Menu data not found. Please go back and choose a valid menu."}
                </p>
            </div>
        );
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (isFreePlan) {
            toast.error(
                locale === "ar"
                    ? "تغيير الشعار غير متاح في الخطة المجانية."
                    : "Changing the logo is not available on the free plan."
            );
            return;
        }

        const validTypes = [
            "image/png",
            "image/x-icon",
            "image/vnd.microsoft.icon",
            "image/jpeg",
            "image/jpg",
        ];
        if (!validTypes.includes(file.type)) {
            toast.error(tMenus("logoFormatError"));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error(tMenus("logoSizeError"));
            return;
        }

        setLogoFile(file);
        setLogoDirty(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setLogoDirty(true);
    };

    const handleToggleStatus = async () => {
        if (!menu) return;

        setTogglingStatus(true);

        const nextValue = !localIsActive;
        setLocalIsActive(nextValue);
        // Update form value so submit payload includes latest status
        setValue("isActive", nextValue, { shouldDirty: true });
        setTogglingStatus(false);
    };

    const onSubmit = async (values: SettingsFormValues) => {
        if (!menu) return;

        try {
            let logoUrl: string | null = null;
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append("file", logoFile);
                logoFormData.append("type", "logos");

                const uploadResult = await axiosPost<FormData, UploadResponse>(
                    "/upload",
                    locale,
                    logoFormData,
                    true
                );

                if (!uploadResult.status || !uploadResult.data?.url) {
                    console.error("Logo upload error:", uploadResult.data);
                    toast.error(
                        locale === "ar" ? "فشل رفع الشعار" : "Failed to upload logo"
                    );
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
                logo: logoUrl ?? menu?.logo ?? null,
            };
            const result = await axiosPatch<typeof payload, Menu>(
                `/menus/${menuId}`,
                locale,
                payload
            );

            if (result.status && result.data) {
                dispatch(SET_ACTIVE_USER(payload as unknown as Menu));
                toast.success(
                    locale === "ar"
                        ? "تم تحديث إعدادات القائمة"
                        : "Menu settings updated"
                );
            }
        } finally {
            setTogglingStatus(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* General information */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <IoPricetagOutline className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {locale === "ar" ? "إعدادات عامة" : "General settings"}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                {locale === "ar"
                                    ? "قم بمراجعة معلومات قائمتك الأساسية من الاسم والوصف."
                                    : "Review the basic information of your menu like name and description."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {tMenus("nameEn")} *
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <CustomInput
                                    type="text"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder="My Restaurant Menu"
                                    error={errors.name?.message}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {tMenus("nameAr")} *
                        </label>
                        <Controller
                            name="nameAr"
                            control={control}
                            render={({ field }) => (
                                <CustomInput
                                    type="text"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder="قائمة مطعمي"
                                    error={errors.nameAr?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {tMenus("descriptionEn")}
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <CustomInput
                                    type="textarea"
                                    rows={3}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder="Describe your menu in English..."
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {tMenus("descriptionAr")}
                        </label>
                        <Controller
                            name="descriptionAr"
                            control={control}
                            render={({ field }) => (
                                <CustomInput
                                    type="textarea"
                                    rows={3}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    placeholder="اكتب وصف القائمة بالعربية..."
                                />
                            )}
                        />
                    </div>
                </div>
            </section>

            {/* Logo, currency & status */}

            <section className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Logo card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <IoImageOutline className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    {tMenus("logo")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {locale === "ar"
                                        ? "قم بتحديث شعار قائمتك الذي يظهر في الواجهة."
                                        : "Update the logo for your menu as shown in the UI."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                                    {logoPreview || initialLogo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={logoPreview ?? initialLogo ?? ""}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-slate-300 text-xs">
                                            {locale === "ar" ? "لا يوجد شعار" : "No logo"}
                                        </span>
                                    )}
                                </div>
                                {(logoPreview || initialLogo) && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                    >
                                        <IoCloseOutline className="text-sm" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full">
                                <label
                                    className={
                                        isFreePlan ? "cursor-not-allowed" : "cursor-pointer"
                                    }
                                >
                                    <input
                                        type="file"
                                        accept=".png,.ico,.jpg,.jpeg,image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        disabled={isFreePlan}
                                    />
                                    <div
                                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                            isFreePlan
                                                ? "bg-slate-200 text-slate-500"
                                                : "bg-primary hover:bg-primary/90 text-white"
                                        }`}
                                    >
                                        <IoCloudUploadOutline className="text-xl" />
                                        <span className="text-sm font-medium">
                                            {tMenus("logoUpload")}
                                        </span>
                                    </div>
                                </label>
                                <p className="text-xs text-slate-500 text-center">
                                    {isFreePlan
                                        ? locale === "ar"
                                            ? "تغيير الشعار متاح فقط في الباقات المدفوعة."
                                            : "Changing the logo is available only on paid plans."
                                        : tMenus("logoHint")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Currency card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <IoCashOutline className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    {tMenus("currency")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {locale === "ar"
                                        ? "العملة المستخدمة في جميع أسعار قائمتك."
                                        : "Currency used for all prices in your menu."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {tMenus("currencyLabel")}
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
                            <p className="text-xs text-slate-400 mt-1">
                                {locale === "ar"
                                    ? "لا يمكن تعديل العملة من هذه الصفحة. قم بإنشاء قائمة جديدة إذا كنت بحاجة لتغيير العملة."
                                    : "Currency is read-only here. Create a new menu if you need to change it."}
                            </p>
                        </div>
                    </div>


                </div>
            </section>

            {/* Locked / advanced sections */}
            <section className="flex flex-col gap-6 lg:flex-row w-full">
                {/* Favicon / logo for menu */}
                {/* Status card */}
                <div className="bg-white rounded-2xl border min-w-[32%] border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <IoDocumentTextOutline className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    {locale === "ar" ? "حالة القائمة" : "Menu status"}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {locale === "ar"
                                        ? "عرض ما إذا كانت القائمة مفعلة أو متوقفة."
                                        : "See whether this menu is active or paused."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-slate-600">
                                {locale === "ar" ? "الحالة الحالية" : "Current status"}
                            </span>
                            <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${localIsActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                                    }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${localIsActive ? "bg-emerald-500" : "bg-red-500"
                                        }`}
                                />
                                {localIsActive ? tMenuCard("active") : tMenuCard("inactive")}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {locale === "ar"
                                ? "قم بتفعيل أو إيقاف القائمة من هنا."
                                : "Activate or pause this menu from here."}
                        </p>
                        <button
                            type="button"
                            onClick={handleToggleStatus}
                            disabled={togglingStatus}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${localIsActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                                } disabled:opacity-60`}
                        >
                            {togglingStatus ? (
                                locale === "ar" ? "جاري التحديث..." : "Updating..."
                            ) : localIsActive ? (
                                tMenuCard("pause")
                            ) : (
                                tMenuCard("play")
                            )}
                        </button>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="bg-linear-to-r  w-full from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-2 ">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <IoWarningOutline className="text-lg" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">
                                {locale === "ar" ? "منطقة الخطر" : "Danger zone"}
                            </h3>
                            <p className="mt-1 text-xs text-red-700/80">
                                {locale === "ar"
                                    ? "إجراءات حساسة مثل حذف القائمة سيتم نقلها لاحقًا إلى هذه المنطقة."
                                    : "Sensitive actions like deleting this menu will be moved here in the future."}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-xl border border-red-300/70 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition-colors"
                        >
                            {locale === "ar" ? "حذف هذه القائمة" : "Delete this menu"}
                        </button>
                        <p className="text-[11px] text-red-500/80">
                            {locale === "ar"
                                ? "لحذف القائمة اكتب اسمها في النافذة المنبثقة للتأكيد."
                                : "To delete this menu, type its name in the confirmation dialog."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer actions (visual only) */}
            <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 pb-10 border-t border-slate-100 mt-4">
                <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-70"
                >
                    {locale === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <CustomBtn
                    loading={isSubmitting}
                    disabled={(!isDirty && !logoDirty) || isSubmitting}
                    className="w-fit!"
                >
                    <div className="flex items-center justify-center gap-2">
                        <IoSaveOutline className="text-xl" />
                        {locale === "ar" ? "حفظ التغييرات" : "Save changes"}
                    </div>
                </CustomBtn>
            </div>

            {isDeleteModalOpen && (
                <DeleteMenuConfirm 
                    menuId={String(menuId)}
                    menuTitle={locale === "ar" ? menu.nameAr : menu.nameEn}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDeleted={() => {
                        router.push(`/${locale}/dashboard`);
                    }}
                />
            )}
        </form>
    );
}
