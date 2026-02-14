'use client';

import { useMemo, useState, useCallback, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { FiDroplet, FiType, FiArrowRight, FiArrowLeft, FiSave } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import LinkTo from "@/components/Global/LinkTo";
import { useAppSelector } from "@/store/hooks";
import { templatesInfo } from "@/modules/TemplateShow/data";
import { toast } from "react-toastify";
import ColorControl from "@/components/Settings/ColorControl";
import CustomBtn from "@/components/Custom/CustomBtn";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import Loader from "@/components/Global/Loader";
import { useRouter } from "@/i18n/navigation";

// Simple, typed debounce helper for callbacks like (index: number, value: string) => void
function debounce<T extends (...args: [number, string]) => void>(fn: T, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (index: number, value: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(index, value);
        }, delay);
    };
}

const INITIAL_TEXTS = {
    heroTitleAr: "استكشف قائمتنا الذكية بتصميم يناسب هوية مطعمك",
    heroTitleEn: "Discover your smart menu with a design that fits your brand",
    heroSubtitleAr: "يمكنك تعديل هذه النصوص لتظهر لعملائك في صفحة المنيو.",
    heroSubtitleEn: "You can adjust these texts to appear for your customers on the menu page.",
    badgeTextAr: "عرض خاص / Special Offer",
    badgeTextEn: "Special Offer / عرض خاص",
} as const;

type TextsState = {
    heroTitleAr: string;
    heroTitleEn: string;
    heroSubtitleAr: string;
    heroSubtitleEn: string;
    badgeTextAr: string;
    badgeTextEn: string;
};

interface ColorPalette {
    id: string;
    labelKey: string;
    colors: string[];
}

interface CustomizationResponse {
    id: number;
    menuId: number;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    heroTitleAr: string;
    heroSubtitleAr: string;
    heroTitleEn: string;
    heroSubtitleEn: string;
    createdAt: string;
    updatedAt: string;
}

export default function TemplateDesignCustomizePage() {
    const locale = useLocale();
    const isRTL = locale === "ar";
    const t = useTranslations("settingsDesignTemplatePage");
    const params = useParams<{ tempSlug: string }>();
    const tempSlug = (params?.tempSlug as string) || "default";
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { menu } = useAppSelector((state) => state.menuData);

    const template = useMemo(
        () => templatesInfo.find((tpl) => tpl.slug === tempSlug),
        [tempSlug]
    );

    useEffect(() => {
        if (!menu?.id) return;

        axiosGet<CustomizationResponse>(
            `/menus/${menu.id}/customizations`,
            locale
        ).then((res) => {
            if (!res.status || !res.data) return;

            const data = res.data as CustomizationResponse;

            setSelectedPaletteId("custom");
            const colorsCustomize = [data.primaryColor];

            if (template?.colors?.length === 1) {
                colorsCustomize.push(data.secondaryColor || data.primaryColor);
            }
            setCustomColors(colorsCustomize as string[]);


            setTexts((prev) => ({
                ...prev,
                heroTitleAr: data.heroTitleAr ?? prev.heroTitleAr ?? "",
                heroSubtitleAr: data.heroSubtitleAr ?? prev.heroSubtitleAr ?? "",
                heroTitleEn: data.heroTitleEn ?? prev.heroTitleEn ?? "",
                heroSubtitleEn: data.heroSubtitleEn ?? prev.heroSubtitleEn ?? "",
            }));
        }).finally(() => {
            setLoading(false);
        });
    }, [locale, menu?.id, template?.colors]);

    const displayName = isRTL ? template?.nameAr ?? "" : template?.name ?? "";

    const initialColors = useMemo(
        () =>
            template?.defaultColors && template.defaultColors.length > 0
                ? template.defaultColors
                : ["#0ea5e9", "#6366f1"],
        [template]
    );

    const readyPalettes: ColorPalette[] = useMemo(
        () => [
            {
                id: "primary",
                labelKey: "palettes.default",
                colors: initialColors,
            },
            {
                id: "warm",
                labelKey: "palettes.warm",
                colors: ["#f97316", "#facc15"],
            },
            {
                id: "fresh",
                labelKey: "palettes.fresh",
                colors: ["#22c55e", "#0ea5e9"],
            },
            {
                id: "elegant",
                labelKey: "palettes.elegant",
                colors: ["#4f46e5", "#a855f7"],
            },
        ],
        [initialColors]
    );

    const colorSlots = useMemo(
        () => template?.defaultColors?.length ?? initialColors.length,
        [template, initialColors]
    );

    const [selectedPaletteId, setSelectedPaletteId] = useState<string>(readyPalettes[0]?.id ?? "primary");
    const [customColors, setCustomColors] = useState<string[]>(
        () => Array.from({ length: colorSlots }, () => "")
    );
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const [texts, setTexts] = useState<TextsState>({ ...INITIAL_TEXTS });
    const [isSaving, setIsSaving] = useState(false);

    const activePalette = readyPalettes.find((p) => p.id === selectedPaletteId) ?? readyPalettes[0];
    const hasCustomColors =
        selectedPaletteId === "custom" &&
        customColors.some((color) => color && color.trim() !== "");
    const gradientStart =
        hasCustomColors && customColors[0] && customColors[0].trim() !== ""
            ? customColors[0]
            : activePalette.colors[0];
    const gradientEnd =
        hasCustomColors && customColors[1] && customColors[1].trim() !== ""
            ? customColors[1]
            : activePalette.colors[1] ?? gradientStart;

    const handleSelectPalette = (palette: ColorPalette) => {
        setSelectedPaletteId(palette.id);
        setShowColorPicker(null);
    };

    const handleCustomColorChange = useCallback((index: number, value: string) => {
        const next = [...customColors];
        next[index] = value;
        setCustomColors(next);
    }, [customColors]);




    const debouncedHandleCustomColorChange = useMemo(
        () =>
            debounce((index: number, value: string) => {
                handleCustomColorChange(index, value);
            }, 150),
        [handleCustomColorChange]
    );

    if (!template || !template.canEdit) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className={isRTL ? "text-right space-y-2" : "text-left space-y-2"}>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {t("notEditable.title")}
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md">
                        {t("notEditable.description")}
                    </p>
                    <div className={isRTL ? "flex justify-start" : "flex justify-start"}>
                        <LinkTo
                            href={`/dashboard/${menu?.id}/settings/design`}
                            className="inline-flex items-center gap-2 mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            {isRTL ? <FiArrowRight className="text-sm" /> : <FiArrowLeft className="text-sm" />}
                            {t("buttons.back")}
                        </LinkTo>
                    </div>
                </div>
            </div>
        );
    }

    const handleChangeText = (field: keyof typeof texts, value: string) => {
        setTexts((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!menu?.id) {
            toast.error(
                locale === "ar"
                    ? "لا توجد قائمة محددة لحفظ التخصيص عليها."
                    : "No menu selected to save customization."
            );
            return;
        }

        const payload = {
            primaryColor: gradientStart,
            secondaryColor: template?.defaultColors?.length !== 1 ? gradientEnd : gradientStart,
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
            heroTitleAr: texts.heroTitleAr,
            heroSubtitleAr: texts.heroSubtitleAr,
            heroTitleEn: texts.heroTitleEn,
            heroSubtitleEn: texts.heroSubtitleEn,
        };

        setIsSaving(true);
        try {
            const result = await axiosPatch<typeof payload, unknown>(
                `/menus/${menu.id}/customizations`,
                locale,
                payload
            );

            if (result.status) {
                toast.success(
                    locale === "ar"
                        ? "تم حفظ إعدادات التخصيص بنجاح."
                        : "Customization settings saved successfully."
                );
                router.push(`/dashboard/${menu.id}/settings/design`);
            } else {
                toast.error(
                    locale === "ar"
                        ? "فشل في حفظ إعدادات التخصيص."
                        : "Failed to save customization settings."
                );
                console.error("Save customization error:", result.data);
            }
        } catch (error) {
            toast.error(
                locale === "ar"
                    ? "حدث خطأ غير متوقع أثناء الحفظ."
                    : "An unexpected error occurred while saving."
            );
            console.error("Save customization exception:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSelectedPaletteId(readyPalettes[0]?.id ?? "primary");
        setCustomColors(Array.from({ length: colorSlots }, () => ""));
        setTexts({ ...INITIAL_TEXTS });
        setShowColorPicker(null);
    };

    return (
        loading ?
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader />
            </div> :
            <div className="min-h-[calc(100vh-160px)] ">
                {/* Page header */}
                <LinkTo
                    href={`/dashboard/${menu?.id}/settings/design`}
                    className="inline-flex items-center mb-4 justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    {isRTL ? <FiArrowRight className="text-sm" /> : <FiArrowLeft className="text-sm" />}
                    {t("buttons.back")}
                </LinkTo>
                <header className={isRTL ? "text-right space-y-1" : "text-left space-y-1"}>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold">
                        <HiOutlineSparkles className="text-xs" />
                        <span>{t("badge")}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                        {t("title", { name: displayName || "—" })}
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 max-w-2xl mt-1">
                        {t("description")}
                    </p>
                </header>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:gap-8">
                    {/* Left preview card */}
                    <aside className="order-2 lg:order-1">
                        <div className="sticky top-24">
                            <div className="rounded-[32px] bg-white/95 shadow-xl border border-slate-100/90 overflow-hidden backdrop-blur">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                                    <div className={isRTL ? "text-right" : "text-left"}>
                                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                            {t("preview.livePreview")}
                                        </p>
                                        <h2 className="text-sm font-semibold text-slate-900 mt-1">
                                            {menu ? (isRTL ? menu.nameAr : menu.nameEn) : displayName}
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div
                                        className="rounded-[24px] p-5 text-white shadow-inner"
                                        style={{
                                            background: `linear-gradient(135deg, ${gradientStart}, ${template?.defaultColors?.length !== 1 ? gradientEnd : gradientStart})`,
                                        }}
                                    >
                                        <div className={isRTL ? "text-right space-y-2" : "text-left space-y-2"}>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[10px] font-semibold">
                                                <HiOutlineSparkles className="text-xs" />
                                                {isRTL ? texts.badgeTextAr : texts.badgeTextEn}
                                            </span>
                                            <h3 className="text-base font-semibold leading-snug">
                                                {isRTL ? texts.heroTitleAr : texts.heroTitleEn}
                                            </h3>
                                            <p className="text-[11px] text-white/80 leading-relaxed">
                                                {isRTL ? texts.heroSubtitleAr : texts.heroSubtitleEn}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-3.5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-8 w-8 min-w-8 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, ${gradientStart}, ${template?.defaultColors?.length !== 1 ? gradientEnd : gradientStart})`,
                                                }}
                                            />
                                            <div className={isRTL ? "text-right" : "text-left"}>
                                                <p className="text-xs font-semibold text-slate-800">
                                                    {t("preview.currentColorsTitle")}
                                                </p>
                                                <p className="text-[11px] text-slate-500">
                                                    {t("preview.currentColorsDescription")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {(selectedPaletteId === "custom" && hasCustomColors
                                                ? customColors
                                                : activePalette.colors.slice(
                                                    0,
                                                    template?.defaultColors?.length ?? activePalette.colors.length
                                                )
                                            ).map((color, index) => (
                                                <div
                                                    key={`current-color-${index}-${color}`}
                                                    className="flex-1 rounded-xl h-8 border border-slate-200 flex items-center justify-between px-3 text-[11px] font-mono bg-white"
                                                >
                                                    <span className="truncate text-slate-700">{color}</span>
                                                    <span
                                                        className="ml-2 h-4 w-4 rounded-full border border-slate-200"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                                <p className={isRTL ? "text-right" : "text-left"}>
                                    {t("preview.footerNote")}
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Right side controls */}
                    <main className="order-1 lg:order-2 space-y-5 lg:space-y-6">
                        {/* Ready colors */}
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className={isRTL ? "text-right" : "text-left"}>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-[11px] font-semibold mb-1">
                                        <FiDroplet className="text-xs" />
                                        <span>{t("sections.readyColors.pill")}</span>
                                    </div>
                                    <h2 className="text-sm md:text-base font-semibold text-slate-900">
                                        {t("sections.readyColors.title")}
                                    </h2>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                                        {t("sections.readyColors.description")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {readyPalettes.map((palette, index) => {
                                    const isActive = palette.id === selectedPaletteId;
                                    return (
                                        <button
                                            key={palette.id + index}
                                            type="button"
                                            onClick={() => handleSelectPalette(palette)}
                                            className={`group relative rounded-2xl border text-left overflow-hidden p-3 transition-all duration-150 ${isActive
                                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                                : "border-slate-200 bg-slate-50/60 hover:border-primary/60 hover:bg-primary/5"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[11px] font-semibold text-slate-800">
                                                        {t(palette.labelKey)}
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        {palette.colors.slice(0, template?.defaultColors?.length ?? 0).map((color, idx) => (
                                                            <span
                                                                key={`palette-${palette.id}-${idx}-${color}`}
                                                                className={`h-6 rounded-full border border-black/10 w-6`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <span className="text-[10px] font-semibold text-primary bg-white border border-primary/30 rounded-full px-2 py-0.5">
                                                        {t("sections.readyColors.inUse")}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Custom palette card */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedPaletteId("custom")}
                                    className={`group relative rounded-2xl border text-left overflow-hidden p-3 transition-all duration-150 ${selectedPaletteId === "custom"
                                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                        : "border-dashed border-slate-300 bg-slate-50/40 hover:border-primary/60 hover:bg-primary/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                                                    +
                                                </span>
                                                {t("palettes.custom")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {customColors
                                                    .filter((c) => c)
                                                    .map((color, index) => (
                                                        <span
                                                            key={`custom-preview-${color}-${index}`}
                                                            className={`h-6 rounded-full border border-black/10 w-6`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {t("sections.customColors.pill")}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* Custom colors */}
                        {selectedPaletteId === "custom" && (
                            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className={isRTL ? "text-right" : "text-left"}>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[11px] font-semibold mb-1">
                                            <FiDroplet className="text-xs" />
                                            <span>{t("sections.customColors.pill")}</span>
                                        </div>
                                        <h2 className="text-sm md:text-base font-semibold text-slate-900">
                                            {t("sections.customColors.title")}
                                        </h2>
                                        <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                                            {t("sections.customColors.description")}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`grid gap-4 md:grid-cols-2 ${isRTL ? "text-right" : "text-left"
                                        }`}
                                >
                                    {customColors.map((color, index) => {
                                        const tooltipId = `color-${index}`;
                                        const isActive =
                                            showColorPicker === `color-picker-${tooltipId}`;
                                        const label =
                                            customColors.length === 1
                                                ? t("sections.customColors.primaryLabel")
                                                : index === 0
                                                    ? t("sections.customColors.primaryLabel")
                                                    : `${t("sections.customColors.accentLabel")} ${index}`;

                                        return (
                                            <div key={`customColor-${index}`} className="space-y-2">
                                                <button
                                                    type="button"
                                                    data-tooltip-id={`color-picker-${tooltipId}`}
                                                    onClick={() =>
                                                        setShowColorPicker((prev) =>
                                                            prev === `color-picker-${tooltipId}`
                                                                ? null
                                                                : `color-picker-${tooltipId}`
                                                        )
                                                    }
                                                    className={`w-full rounded-2xl border bg-slate-50/70 p-3 flex items-center gap-3 text-left transition-colors ${isActive
                                                        ? "border-primary/70 ring-2 ring-primary/20 bg-primary/5"
                                                        : "border-slate-100 hover:border-primary/40"
                                                        }`}
                                                >
                                                    <div
                                                        className="h-10 w-10 rounded-xl border border-slate-200 shadow-sm"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            {label}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={color}
                                                                onChange={(e) =>
                                                                    debouncedHandleCustomColorChange(index, e.target.value)
                                                                }
                                                                className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                                            />
                                                        </div>
                                                    </div>
                                                </button>

                                                <ColorControl
                                                    id={tooltipId}
                                                    value={color}
                                                    onChange={(e) =>
                                                        debouncedHandleCustomColorChange(index, e.target.value)
                                                    }
                                                    showColorPicker={showColorPicker}
                                                    setShowColorPicker={setShowColorPicker}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Texts */}
                        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className={isRTL ? "text-right" : "text-left"}>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-[11px] font-semibold mb-1">
                                        <FiType className="text-xs" />
                                        <span>{t("sections.texts.pill")}</span>
                                    </div>
                                    <h2 className="text-sm md:text-base font-semibold text-slate-900">
                                        {t("sections.texts.title")}
                                    </h2>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                                        {t("sections.texts.description")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-emerald-50 via-sky-50 to-white p-4 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-800">
                                        {t("sections.texts.heroTitleAr")}
                                    </p>
                                    <textarea
                                        value={texts.heroTitleAr}
                                        onChange={(e) => handleChangeText("heroTitleAr", e.target.value)}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                        rows={2}
                                    />
                                    <p className="text-[10px] text-slate-500">
                                        {t("sections.texts.helperShortAr")}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-sky-50 via-violet-50 to-white p-4 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-800">
                                        {t("sections.texts.heroTitleEn")}
                                    </p>
                                    <textarea
                                        value={texts.heroTitleEn}
                                        onChange={(e) => handleChangeText("heroTitleEn", e.target.value)}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                        rows={2}
                                    />
                                    <p className="text-[10px] text-slate-500">
                                        {t("sections.texts.helperShortEn")}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-emerald-50/60 via-sky-50/40 to-white p-4 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-800">
                                        {t("sections.texts.shortDescriptionAr")}
                                    </p>
                                    <textarea
                                        value={texts.heroSubtitleAr}
                                        onChange={(e) => handleChangeText("heroSubtitleAr", e.target.value)}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                        rows={3}
                                    />
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-linear-to-br from-sky-50/60 via-violet-50/40 to-white p-4 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-800">
                                        {t("sections.texts.shortDescriptionEn")}
                                    </p>
                                    <textarea
                                        value={texts.heroSubtitleEn}
                                        onChange={(e) => handleChangeText("heroSubtitleEn", e.target.value)}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Footer actions */}
                        <div className=" justify-between gap-3 pt-2 pb-6">
                            <div className="flex flex-wrap gap-2 justify-end w-fit ms-auto mb-3">
                                <CustomBtn
                                    onClick={handleReset}
                                    variant="danger"
                                    className="w-fit!"
                                >
                                    <div className="flex items-center justify-center gap-2 ">
                                        {t("buttons.reset", { defaultMessage: "Reset" })}
                                    </div>
                                </CustomBtn>

                                <CustomBtn
                                    onClick={handleSave}
                                    loading={isSaving}
                                    disabled={isSaving}
                                    className="w-fit!"
                                >
                                    <div className="flex items-center justify-center gap-2 ">
                                        <FiSave className="text-sm" />
                                        {t("buttons.save")}
                                    </div>
                                </CustomBtn>
                            </div>

                            <p className="text-[11px] text-slate-500 max-w-md">
                                {t("preview.footerNote")}
                            </p>
                        </div>
                    </main>
                </div>
            </div>
    );
}
