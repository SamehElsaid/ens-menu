"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineColorSwatch } from "react-icons/hi";
import LinkTo from "@/components/Global/LinkTo";
import {
  getMenuDashboardRef,
  menuDashboardPath,
} from "@/lib/menuDashboardPath";
import { useAppSelector } from "@/store/hooks";
import { templatesInfo } from "@/modules/TemplateShow/data";
import { toast } from "react-toastify";
import ColorControl from "@/components/Settings/ColorControl";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  Badge,
  Button,
  buttonClasses,
  Card,
  EmptyState,
  Field,
  focusRing,
  Input,
  SectionHeader,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { axiosGet, axiosPut } from "@/shared/axiosCall";
import Loader from "@/components/Global/Loader";
import { useRouter } from "@/i18n/navigation";
import { useApiAction } from "@/hooks/useApiAction";

/** Tile chrome shared by the ready palettes and the custom tile. */
const tileBase = cn(
  "relative flex items-center justify-between gap-3 rounded-lg p-2.5 text-start",
  "border transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-settle)",
  focusRing,
);

/** The selected tile takes the same purple inline edge an active `Card` uses,
 *  so a chosen palette reads as a position rather than as a tinted fill
 *  competing with the swatches it contains. */
const tileActive =
  "border-accent-line bg-surface before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:rounded-s-lg before:bg-accent before:content-['']";

// Simple, typed debounce helper for callbacks like (index: number, value: string) => void
function debounce<T extends (...args: [number, string]) => void>(
  fn: T,
  delay: number,
) {
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
  heroSubtitleEn:
    "You can adjust these texts to appear for your customers on the menu page.",
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

export interface TemplateDesignCustomizePanelProps {
  tempSlug: string;
  embedded?: boolean;
  onClose?: () => void;
}

export default function TemplateDesignCustomizePanel({
  tempSlug: tempSlugProp,
  embedded = false,
  onClose,
}: TemplateDesignCustomizePanelProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settingsDesignTemplatePage");
  const params = useParams<{ tempSlug: string }>();
  const tempSlug = tempSlugProp || (params?.tempSlug as string) || "default";
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { menu } = useAppSelector((state) => state.menuData);
  const menuApiRef = getMenuDashboardRef(menu);
  const designListPath = menuDashboardPath(menu, "settings", "design");

  const template = useMemo(
    () => templatesInfo.find((tpl) => tpl.slug === tempSlug),
    [tempSlug],
  );

  const displayName = isRTL ? (template?.nameAr ?? "") : (template?.name ?? "");

  const initialColors = useMemo(() => {
    const base =
      template?.defaultColors && template.defaultColors.length > 0
        ? [...template.defaultColors]
        : template?.colors && template.colors.length > 0
          ? [...template.colors]
          : ["#0ea5e9", "#6366f1"];
    if (base.length === 1) {
      return [base[0], base[0]];
    }
    return base;
  }, [template]);

  /* These are the *guest-facing menu's* colours, not the app's — the same
     exemption the third-party marks get (DESIGN.md §14.4). A restaurant that
     wants a warm orange menu is not making a brand mistake, and forcing the
     house purple on their published menu would be the product overruling its
     own customer. The app chrome around this panel stays on brand. */
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
    [initialColors],
  );

  const colorSlots = useMemo(
    () =>
      Math.max(
        2,
        template?.defaultColors?.length ??
          template?.colors?.length ??
          initialColors.length,
      ),
    [template, initialColors],
  );

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(
    readyPalettes[0]?.id ?? "primary",
  );
  const [customColors, setCustomColors] = useState<string[]>(() =>
    Array.from(
      { length: colorSlots },
      (_, index) => initialColors[index] ?? initialColors[0] ?? "",
    ),
  );
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [texts, setTexts] = useState<TextsState>({ ...INITIAL_TEXTS });
  const [isSaving, setIsSaving] = useState(false);
  const { runApiAction } = useApiAction();

  const activePalette =
    readyPalettes.find((p) => p.id === selectedPaletteId) ?? readyPalettes[0];
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
      : (activePalette.colors[1] ?? gradientStart);

  const gradientSecondary = colorSlots >= 2 ? gradientEnd : gradientStart;
  const previewGradient = `linear-gradient(135deg, ${gradientStart}, ${gradientSecondary})`;

  useEffect(() => {
    if (!menuApiRef) return;

    axiosGet<CustomizationResponse>(
      `/menus/${menuApiRef}/customizations`,
      locale,
    )
      .then((res) => {
        if (!res.status || !res.data) return;

        const data = res.data as CustomizationResponse;

        setSelectedPaletteId("custom");
        const colorsCustomize: string[] = [
          data.primaryColor,
          data.secondaryColor || data.primaryColor,
        ];
        while (colorsCustomize.length < colorSlots) {
          colorsCustomize.push(
            colorsCustomize[colorsCustomize.length - 1] ?? "",
          );
        }
        setCustomColors(colorsCustomize.slice(0, colorSlots));

        setTexts((prev) => ({
          ...prev,
          heroTitleAr: data.heroTitleAr ?? prev.heroTitleAr ?? "",
          heroSubtitleAr: data.heroSubtitleAr ?? prev.heroSubtitleAr ?? "",
          heroTitleEn: data.heroTitleEn ?? prev.heroTitleEn ?? "",
          heroSubtitleEn: data.heroSubtitleEn ?? prev.heroSubtitleEn ?? "",
        }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, menuApiRef, template?.slug, colorSlots]);

  const handleSelectPalette = (palette: ColorPalette) => {
    setSelectedPaletteId(palette.id);
    setShowColorPicker(null);
  };

  const handleCustomColorChange = useCallback(
    (index: number, value: string) => {
      const next = [...customColors];
      next[index] = value;
      setCustomColors(next);
    },
    [customColors],
  );

  const debouncedHandleCustomColorChange = useMemo(
    () =>
      debounce((index: number, value: string) => {
        handleCustomColorChange(index, value);
      }, 150),
    [handleCustomColorChange],
  );

  const showHeroTexts = template?.customizeHeroTexts !== false;

  const backIcon = <FiArrowLeft className="rtl:rotate-180" aria-hidden />;
  const backControl =
    embedded && onClose ? (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClose}
        startIcon={backIcon}
      >
        {t("buttons.back")}
      </Button>
    ) : (
      <LinkTo
        href={designListPath}
        className={buttonClasses({ variant: "secondary", size: "sm" })}
      >
        {backIcon}
        {t("buttons.back")}
      </LinkTo>
    );

  if (!template || !template.canEdit) {
    return (
      <div className="flex min-w-0 flex-col gap-4 pb-6">
        <PageTitleWithHelp
          eyebrow={t("badge")}
          title={t("title", { name: displayName || "—" })}
        />
        <EmptyState
          icon={<HiOutlineColorSwatch />}
          title={t("notEditable.title")}
          description={t("notEditable.description")}
          action={backControl}
        />
      </div>
    );
  }

  const handleChangeText = (field: keyof typeof texts, value: string) => {
    setTexts((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!menuApiRef) {
      toast.error(t("noMenuSelected"));
      return;
    }

    const payload = {
      primaryColor: gradientStart,
      secondaryColor: gradientSecondary,
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      ...(showHeroTexts
        ? {
            heroTitleAr: texts.heroTitleAr,
            heroSubtitleAr: texts.heroSubtitleAr,
            heroTitleEn: texts.heroTitleEn,
            heroSubtitleEn: texts.heroSubtitleEn,
          }
        : {}),
    };

    setIsSaving(true);
    try {
      await runApiAction(
        () =>
          axiosPut(
            `/menus/${menuApiRef}/customizations`,
            locale,
            payload,
          ),
        {
          successToast:
            locale === "ar"
              ? "تم حفظ إعدادات التخصيص بنجاح."
              : "Customization settings saved successfully.",
          errorToast:
            locale === "ar"
              ? "فشل في حفظ إعدادات التخصيص."
              : "Failed to save customization settings.",
          onSuccess: () => {
            if (embedded && onClose) onClose();
            else router.push(designListPath);
          },
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPaletteId(readyPalettes[0]?.id ?? "primary");
    setCustomColors(Array.from({ length: colorSlots }, () => ""));
    if (showHeroTexts) {
      setTexts({ ...INITIAL_TEXTS });
    }
    setShowColorPicker(null);
  };

  const isCustomSelected = selectedPaletteId === "custom";
  const previewSwatches =
    isCustomSelected && hasCustomColors
      ? customColors
      : activePalette.colors.slice(0, colorSlots);
  const customTileSwatches = customColors.filter((color) => color);
  const menuTitle = menu ? (isRTL ? menu.nameAr : menu.nameEn) : displayName;
  const footerNote = showHeroTexts
    ? t("preview.footerNote")
    : t("preview.footerNoteColorsOnly");

  return loading ? (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  ) : (
    <div className="flex min-w-0 flex-col gap-4 pb-6">
      <PageTitleWithHelp
        eyebrow={t("badge")}
        title={t("title", { name: displayName || "—" })}
        description={
          showHeroTexts ? t("description") : t("descriptionColorsOnly")
        }
        actions={backControl}
      />

      {/* The preview leads the reading order on narrow screens and sticks
          beside the controls from `lg`, because every control on this screen is
          only meaningful against the thing it changes. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:items-start lg:gap-6">
        <aside className="min-w-0 lg:col-start-2 lg:row-start-1">
          <div className="lg:sticky lg:top-20">
            <Card padded="none" className="overflow-hidden">
              <div className="flex items-start justify-between gap-2 border-b border-line px-3 py-2.5 sm:px-4">
                <div className="min-w-0">
                  <p className="ui-label">{t("preview.previewMenu")}</p>
                  <h2 className="mt-1 truncate text-sm font-semibold text-fg">
                    {menuTitle}
                  </h2>
                </div>
                <Badge tone="accent" dot>
                  {t("preview.livePreview")}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 p-3 sm:p-4">
                {/* The template's own gradient and white type are the subject
                    of this block, not chrome — it is a picture of the
                    customer-facing menu, so it keeps its literal colours. */}
                <div
                  className="flex flex-col gap-2 rounded-lg p-4 text-start text-white"
                  style={{ background: previewGradient }}
                >
                  {showHeroTexts ? (
                    <>
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                        <HiOutlineSparkles className="text-xs" aria-hidden />
                        {isRTL ? texts.badgeTextAr : texts.badgeTextEn}
                      </span>
                      <h3 className="text-base leading-snug font-semibold">
                        {isRTL ? texts.heroTitleAr : texts.heroTitleEn}
                      </h3>
                      <p className="text-[11px] leading-relaxed text-white/80">
                        {isRTL ? texts.heroSubtitleAr : texts.heroSubtitleEn}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                        {t("preview.colorOnlyBadge")}
                      </span>
                      <h3 className="text-base leading-snug font-semibold">
                        {menuTitle || "—"}
                      </h3>
                      <p className="text-[11px] leading-relaxed text-white/80">
                        {t("preview.colorOnlyCaption")}
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-line bg-surface-2 p-3">
                  <div className="flex items-start gap-2">
                    <span
                      className="size-8 shrink-0 rounded-lg border border-line"
                      style={{ background: previewGradient }}
                      aria-hidden
                    />
                    <div className="min-w-0 text-start">
                      <p className="text-xs font-semibold text-fg">
                        {t("preview.currentColorsTitle")}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-fg-muted">
                        {t("preview.currentColorsDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    {previewSwatches.map((color, index) => (
                      <span
                        key={`current-color-${index}-${color}`}
                        className="flex h-8 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 font-mono text-[11px] tabular-nums text-fg-muted"
                      >
                        <span className="truncate" dir="ltr">
                          {color}
                        </span>
                        <span
                          className="size-4 shrink-0 rounded-full border border-line"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="border-t border-line bg-surface-2/40 px-3 py-2.5 text-xs leading-relaxed text-fg-muted sm:px-4">
                {footerNote}
              </p>
            </Card>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <Card padded="lg" className="flex flex-col gap-3.5">
            <SectionHeader
              ruled
              eyebrow={t("sections.readyColors.pill")}
              title={t("sections.readyColors.title")}
              description={t("sections.readyColors.description")}
            />

            <div className="grid gap-2.5 sm:grid-cols-2">
              {readyPalettes.map((palette, index) => {
                const isActive = palette.id === selectedPaletteId;
                return (
                  <button
                    key={palette.id + index}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelectPalette(palette)}
                    className={cn(
                      tileBase,
                      isActive
                        ? tileActive
                        : "border-line bg-surface hover:border-line-strong hover:bg-surface-2/60",
                    )}
                  >
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <span className="truncate text-[13px] font-medium text-fg">
                        {t(palette.labelKey)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {palette.colors
                          .slice(0, colorSlots)
                          .map((color, idx) => (
                            <span
                              key={`palette-${palette.id}-${idx}-${color}`}
                              className="size-6 rounded-full border border-line"
                              style={{ backgroundColor: color }}
                              aria-hidden
                            />
                          ))}
                      </span>
                    </span>
                    {isActive ? (
                      <Badge tone="accent" dot>
                        {t("sections.readyColors.inUse")}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={isCustomSelected}
                onClick={() => setSelectedPaletteId("custom")}
                className={cn(
                  tileBase,
                  "border-dashed",
                  isCustomSelected
                    ? tileActive
                    : "border-line-strong bg-surface-2/40 hover:border-fg-subtle hover:bg-surface-2",
                )}
              >
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="truncate text-[13px] font-medium text-fg">
                    {t("palettes.custom")}
                  </span>
                  {customTileSwatches.length > 0 ? (
                    <span className="flex items-center gap-1.5">
                      {customTileSwatches.map((color, index) => (
                        <span
                          key={`custom-preview-${color}-${index}`}
                          className="size-6 rounded-full border border-line"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="text-xs text-fg-muted">
                      {t("sections.customColors.pill")}
                    </span>
                  )}
                </span>
                {isCustomSelected ? (
                  <Badge tone="accent" dot>
                    {t("sections.readyColors.inUse")}
                  </Badge>
                ) : null}
              </button>
            </div>
          </Card>

          {isCustomSelected && (
            <Card padded="lg" className="flex flex-col gap-3.5">
              <SectionHeader
                ruled
                eyebrow={t("sections.customColors.pill")}
                title={t("sections.customColors.title")}
                description={t("sections.customColors.description")}
              />

              <div className="grid gap-3.5 sm:grid-cols-2">
                {customColors.map((color, index) => {
                  const tooltipId = `color-${index}`;
                  const pickerId = `color-picker-${tooltipId}`;
                  const isPickerOpen = showColorPicker === pickerId;
                  const label =
                    index === 0
                      ? t("sections.customColors.primaryLabel")
                      : index === 1
                        ? t("sections.customColors.accentLabel")
                        : `${t("sections.customColors.accentLabel")} ${index}`;

                  return (
                    <div key={`customColor-${index}`} className="min-w-0">
                      <Field label={label}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            data-tooltip-id={pickerId}
                            aria-label={t("sections.customColors.openPicker", {
                              label,
                            })}
                            aria-expanded={isPickerOpen}
                            onClick={() =>
                              setShowColorPicker((prev) =>
                                prev === pickerId ? null : pickerId,
                              )
                            }
                            className={cn(
                              "size-9 shrink-0 rounded-lg border transition-[border-color] duration-(--dur-fast) ease-(--ease-settle) sm:size-8",
                              focusRing,
                              isPickerOpen
                                ? "border-accent"
                                : "border-line-strong hover:border-fg-subtle",
                            )}
                            style={{ backgroundColor: color }}
                          />
                          <Input
                            value={color}
                            onChange={(e) =>
                              debouncedHandleCustomColorChange(
                                index,
                                e.target.value,
                              )
                            }
                            dir="ltr"
                            spellCheck={false}
                            className="font-mono tabular-nums"
                          />
                        </div>
                      </Field>

                      <ColorControl
                        id={tooltipId}
                        value={color}
                        onChange={(e) =>
                          debouncedHandleCustomColorChange(
                            index,
                            e.target.value,
                          )
                        }
                        showColorPicker={showColorPicker}
                        setShowColorPicker={setShowColorPicker}
                      />
                    </div>
                  );
                })}
              </div>

              <p className="text-xs leading-relaxed text-fg-muted">
                {t("sections.customColors.pickerLabel")}
              </p>
            </Card>
          )}

          {showHeroTexts && (
            <Card padded="lg" className="flex flex-col gap-3.5">
              <SectionHeader
                ruled
                eyebrow={t("sections.texts.pill")}
                title={t("sections.texts.title")}
                description={t("sections.texts.description")}
              />

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field
                  label={t("sections.texts.heroTitleAr")}
                  hint={t("sections.texts.helperShortAr")}
                >
                  <Textarea
                    value={texts.heroTitleAr}
                    onChange={(e) =>
                      handleChangeText("heroTitleAr", e.target.value)
                    }
                    rows={2}
                    dir="rtl"
                    lang="ar"
                  />
                </Field>

                <Field
                  label={t("sections.texts.heroTitleEn")}
                  hint={t("sections.texts.helperShortEn")}
                >
                  <Textarea
                    value={texts.heroTitleEn}
                    onChange={(e) =>
                      handleChangeText("heroTitleEn", e.target.value)
                    }
                    rows={2}
                    dir="ltr"
                    lang="en"
                  />
                </Field>

                <Field label={t("sections.texts.shortDescriptionAr")}>
                  <Textarea
                    value={texts.heroSubtitleAr}
                    onChange={(e) =>
                      handleChangeText("heroSubtitleAr", e.target.value)
                    }
                    rows={3}
                    dir="rtl"
                    lang="ar"
                  />
                </Field>

                <Field label={t("sections.texts.shortDescriptionEn")}>
                  <Textarea
                    value={texts.heroSubtitleEn}
                    onChange={(e) =>
                      handleChangeText("heroSubtitleEn", e.target.value)
                    }
                    rows={3}
                    dir="ltr"
                    lang="en"
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* Save sits last in the row and last in the DOM, so on a phone the
              thumb lands on it before the discard. */}
          <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="dangerGhost"
              size="lg"
              fullWidth
              className="sm:w-auto"
              onClick={handleReset}
            >
              {t("buttons.reset")}
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
              size="lg"
              fullWidth
              className="sm:w-auto"
              startIcon={<FiSave aria-hidden />}
            >
              {t("buttons.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
