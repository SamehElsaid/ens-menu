/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch, axiosGet } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { toast } from "react-toastify";
import { Item, Category, UploadResponse } from "@/types/Menu";
import {
    IoCloseOutline,
    IoImageOutline,
    IoPricetagOutline,
    IoAddCircleOutline,
    IoCloudUploadOutline,
    IoEllipseSharp,
    IoCheckmarkCircle,
    IoRemoveCircle,
    IoLockClosedOutline,
} from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";
import { MdOutlineFastfood } from "react-icons/md";
import { useAppSelector } from "@/store/hooks";
import LinkTo from "@/components/Global/LinkTo";

export interface AddItemFormData {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    categoryId: string;
    price: string;
    originalPrice: string;
    discountPercent: string;
    isAvailable: boolean;
}

interface AddItemModalProps {
    menuId: string;
    item?: Item | null;
    /** إن وُجدت تُستخدم بدل جلب الفئات من الـ API */
    categories?: Category[];
    onClose: () => void;
    onRefresh?: () => void;
}

export default function AddItemModal({
    menuId,
    item = null,
    categories: categoriesProp,
    onClose,
    onRefresh,
}: AddItemModalProps) {
    const t = useTranslations("Items.addModal");
    const locale = useLocale();
    const isEdit = Boolean(item?.id);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [categoriesLocal, setCategoriesLocal] = useState<Category[]>([]);
    const categories = categoriesProp ?? categoriesLocal;
    const modalRef = useRef<HTMLDivElement>(null);
    const userData = useAppSelector((state) => state.auth.data);
    const planId = (userData as { user?: { subscription?: { planId?: number } } })?.user?.subscription?.planId;
    const isFreePlan = planId === 1;

    const tItems = useTranslations("Items");

    const {
        control,
        handleSubmit,
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
            originalPrice: "",
            discountPercent: "",
            isAvailable: true,
        },
        mode: "onChange",
    });

    const fetchCategories = useCallback(async () => {
        if (categoriesProp !== undefined) return;
        try {
            const result = await axiosGet<Category[] | { categories: Category[] }>(
                `/menus/${menuId}/categories?page=1&limit=500`,
                locale
            );
            if (result.status && result.data) {
                const list = Array.isArray(result.data)
                    ? result.data
                    : (result.data as { categories: Category[] }).categories ?? [];
                setCategoriesLocal(list);
            }
        } catch {
            setCategoriesLocal([]);
        }
    }, [menuId, locale, categoriesProp]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
                categoryId: String(item.categoryId ?? ""),
                price: item.price != null ? String(item.price) : "",
                originalPrice: item.originalPrice != null ? String(item.originalPrice) : "",
                discountPercent: item.discountPercent != null ? String(item.discountPercent) : "",
                isAvailable: item.isAvailable ?? item.available ?? true,
            });
            const url = item.imageUrl ?? item.image ?? "";
            setImagePreview(url || null);
            setImage(null);
        } else {
            reset({
                nameAr: "",
                nameEn: "",
                descriptionAr: "",
                descriptionEn: "",
                categoryId: "",
                price: "",
                originalPrice: "",
                discountPercent: "",
                isAvailable: true,
            });
            setImagePreview(null);
            setImage(null);
        }
    }, [item, reset]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isCreating) onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose, isCreating]);

    const onSubmit = async (data: AddItemFormData) => {
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
                descriptionAr: data.descriptionAr || undefined,
                descriptionEn: data.descriptionEn || undefined,
                categoryId: Number(data.categoryId) || undefined,
                price: Number(data.price) || 0,
                originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
                discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
                isAvailable: data.isAvailable,
                ...(imageUrl && { imageUrl, image: imageUrl }),
            };

            if (isEdit && item) {
                const result = await axiosPatch<typeof payload, Item>(
                    `/menus/${menuId}/items/${item.id}`,
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
                const result = await axiosPost<typeof payload, Item>(
                    `/menus/${menuId}/items`,
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

    const getCategoryName = (cat: Category) =>
        locale === "ar" ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.target === e.currentTarget && !isCreating && onClose()}
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
                                <h2 id="add-item-title" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
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

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
                    <div className="overflow-y-auto p-6 space-y-6">
                        <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
                            <div className="flex items-center gap-2 mb-4">
                                <IoPricetagOutline className="text-primary text-lg shrink-0" />
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("nameEn")} / {t("nameAr")}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("nameEn")} *</label>
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
                                                placeholder="e.g., Burger"
                                                error={errors.nameEn?.message}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("nameAr")} *</label>
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

                        <section className={`rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50 ${isFreePlan ? "relative opacity-90" : ""}`}>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 inline-flex items-center gap-2">
                                {t("descriptionEn")} / {t("descriptionAr")}
                                {isFreePlan && <IoLockClosedOutline className="text-amber-500 dark:text-amber-400 text-lg" title={tItems("freePlanMessage")} />}
                            </h3>
                            {isFreePlan && (
                                <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">{tItems("freePlanMessage")}</p>
                                    <LinkTo
                                        href="/pricing"
                                        className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                    >
                                        <IoLockClosedOutline className="text-base" />
                                        {tItems("subscribeNow")}
                                    </LinkTo>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("descriptionEn")}</label>
                                    <Controller
                                        name="descriptionEn"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomInput
                                                type="textarea"
                                                rows={3}
                                                value={field.value}
                                                onChange={(e) => field.onChange((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                                                onBlur={field.onBlur}
                                                disabled={isFreePlan}
                                                className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                                                placeholder="Optional"
                                                error={errors.descriptionEn?.message}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("descriptionAr")}</label>
                                    <Controller
                                        name="descriptionAr"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomInput
                                                type="textarea"
                                                rows={3}
                                                value={field.value}
                                                onChange={(e) => field.onChange((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                                                onBlur={field.onBlur}
                                                disabled={isFreePlan}
                                                className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t("category")} & {t("price")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("category")} *</label>
                                    <Controller
                                        name="categoryId"
                                        control={control}
                                        rules={{ required: t("categoryRequired") }}
                                        render={({ field }) => (
                                            <select
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={field.onBlur}
                                                disabled={isEdit}
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary disabled:opacity-70"
                                            >
                                                <option value="">— {locale === "ar" ? "اختر الفئة" : "Select category"} —</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={String(cat.id)}>
                                                        {getCategoryName(cat)}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.categoryId?.message && (
                                        <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("price")} *</label>
                                    <Controller
                                        name="price"
                                        control={control}
                                        rules={{ required: t("priceRequired") }}
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
                                <div className={isFreePlan ? "opacity-90" : ""}>
                                    <label className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("originalPrice")}
                                        {isFreePlan && <IoLockClosedOutline className="text-amber-500 dark:text-amber-400 text-sm" />}
                                    </label>
                                    <Controller
                                        name="originalPrice"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomInput
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={field.onBlur}
                                                disabled={isFreePlan}
                                                className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                                                placeholder="Optional"
                                            />
                                        )}
                                    />
                                </div>
                                <div className={isFreePlan ? "opacity-90" : ""}>
                                    <label className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t("discountPercent")}
                                        {isFreePlan && <IoLockClosedOutline className="text-amber-500 dark:text-amber-400 text-sm" />}
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
                                                disabled={isFreePlan}
                                                className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                                                placeholder="0"
                                            />
                                        )}
                                    />
                                </div>
                                {isFreePlan && (
                                    <div className="md:col-span-2 flex justify-end">
                                        <LinkTo
                                            href="/pricing"
                                            className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-md transition-colors"
                                        >
                                            <IoLockClosedOutline className="text-lg" />
                                            {tItems("subscribeNow")}
                                        </LinkTo>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
                            <div className="flex items-center gap-2 mb-1">
                                <IoEllipseSharp className="text-primary text-lg shrink-0" />
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("currentlyAvailable")}</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {locale === "ar" ? "هل المنتج متوفر للطلب الآن؟" : "Is this product available to order now?"}
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

                        <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
                            <div className="flex items-center gap-2 mb-4">
                                <IoImageOutline className="text-primary text-lg shrink-0" />
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("image")}</h3>
                            </div>
                            <label
                                className={`relative block w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
                                    isDragOver
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
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveImage();
                                                }}
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white"
                                                aria-label={t("removeImage")}
                                            >
                                                <IoCloseOutline className="text-2xl" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-2xl bg-gray-200/80 dark:bg-gray-600/50 flex items-center justify-center mb-2">
                                                <IoCloudUploadOutline className="text-2xl text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">{t("imageHint")}</span>
                                        </>
                                    )}
                                </div>
                            </label>
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
                            <CustomBtn type="submit" loading={isCreating} disabled={isCreating}>
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
