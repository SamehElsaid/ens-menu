"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import LoadImage from "@/components/ImageLoad";
import { templatesInfo } from "@/modules/TemplateShow/data";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import TemplateDesignCustomizePanel from "@/components/Settings/TemplateDesignCustomizePanel";
import { FiEye, FiSettings, FiChevronDown } from "react-icons/fi";
import { HiOutlineHand, HiOutlineColorSwatch } from "react-icons/hi";
import { axiosPatch } from "@/shared/axiosCall";
import type { Menu } from "@/types/Menu";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { menuRefFromRouteParam } from "@/lib/menuDashboardPath";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";

const customizeButtonClassName =
  "flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors";

export default function DesignPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const routeParams = useParams<{ menu: string }>();

  const t = useTranslations("settingsDesignPage");

  const dispatch = useAppDispatch();
  const { menu } = useAppSelector((state) => state.menuData);
  const resolvedMenuId =
    menuRefFromRouteParam(routeParams?.menu) ||
    (typeof menu?.uuid === "string" && menu.uuid.length > 0
      ? menu.uuid
      : menu?.id != null
        ? String(menu.id)
        : undefined);
  const templatesForMenu = templatesInfo.filter((template) => {
    if (template.showInPickerOnlyWhenThemeMatches) {
      return menu?.theme === template.id;
    }
    return true;
  });
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const [customizingSlug, setCustomizingSlug] = useState<string | null>(null);
  const [customizeLoadingSlug, setCustomizeLoadingSlug] = useState<
    string | null
  >(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    typeof menu?.theme === "string" && menu.theme !== ""
      ? (menu.theme as string)
      : "default",
  );

  useEffect(() => {
    if (menu?.theme) {
      setActiveTemplateId(menu.theme as string);
    }
  }, [menu?.theme]);

  const handleSelectTemplate = async (
    templateId: string,
    options?: { skipLoadingUi?: boolean },
  ): Promise<boolean> => {
    if (!resolvedMenuId) {
      return false;
    }

    if (!options?.skipLoadingUi) {
      setIsLoading(templateId);
    }
    try {
      const payload = { theme: templateId };
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${resolvedMenuId}`,
        locale,
        payload,
      );

      if (result.status) {
        setActiveTemplateId(templateId);
        if (menu) {
          dispatch(
            SET_ACTIVE_USER({
              ...menu,
              theme: templateId,
            }),
          );
        }
        return true;
      }
      return false;
    } finally {
      if (!options?.skipLoadingUi) {
        setIsLoading(false);
      }
    }
  };

  const handleOpenCustomize = async (template: {
    id: string;
    slug: string;
  }) => {
    if (!resolvedMenuId) {
      toast.error(
        locale === "ar"
          ? "لا توجد قائمة محددة."
          : "No menu selected.",
      );
      return;
    }

    setCustomizeLoadingSlug(template.slug);
    try {
      if (template.id !== activeTemplateId) {
        const activated = await handleSelectTemplate(template.id, {
          skipLoadingUi: true,
        });
        if (!activated) {
          toast.error(
            locale === "ar"
              ? "تعذّر تفعيل القالب. حاول مرة أخرى."
              : "Could not activate the template. Please try again.",
          );
          return;
        }
      }
      setCustomizingSlug(template.slug);
    } finally {
      setCustomizeLoadingSlug(null);
    }
  };

  if (customizingSlug) {
    return (
      <TemplateDesignCustomizePanel
        tempSlug={customizingSlug}
        embedded
        onClose={() => setCustomizingSlug(null)}
      />
    );
  }

  const scrollToTemplatePicker = () => {
    document
      .getElementById("onboarding-design-templates")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8 mb-2">
      {/* Page header */}
      <header
        id="onboarding-design-header"
        className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
          isRTL ? "text-right sm:flex-row-reverse" : "text-left"
        }`}
      >
        <div className="min-w-0 flex-1">
          <PageTitleWithHelp>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-0">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mt-2">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          id="onboarding-choose-design-cta"
          onClick={scrollToTemplatePicker}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 dark:hover:bg-primary/80 sm:text-sm"
        >
          <HiOutlineColorSwatch className="text-base shrink-0" />
          {t("headerCta")}
          <FiChevronDown className="text-sm shrink-0 opacity-90" />
        </button>
      </header>

      {/* Templates grid */}
      <section
        id="onboarding-design-templates"
        aria-label={t("headerCta")}
        className="bg-slate-50/60 dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 md:p-6 lg:p-8 scroll-mt-24"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templatesForMenu.map((template, templateIndex) => {
            const isActive = template.id === activeTemplateId;
            const isNew = template.isNew;
            const linkView =
              "https://" + template.slug + process.env.NEXT_PUBLIC_MENU_URL;
            const isCustomizeLoading = customizeLoadingSlug === template.slug;

            return (
              <div
                key={template.id}
                className={`group relative cursor-pointer rounded-[28px] border bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 overflow-hidden ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 shadow-xl shadow-primary/10 dark:shadow-primary/20"
                    : "border-slate-100 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {/* Top status & image */}
                <div className="relative p-4 pb-0">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-4/3">
                    <div className="relative h-full w-full overflow-hidden">
                      {template.hidePreviewImage ? (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${template.colors[0]}B8 0%, ${template.colors[1] ?? template.colors[0]}99 42%, rgb(15 23 42 / 0.72) 100%)`,
                          }}
                          aria-hidden
                        />
                      ) : (
                        <LoadImage
                          src={template.image}
                          disableLazy
                          alt={isRTL ? template.nameAr : template.name}
                          className="w-full auto-scroll-image"
                        />
                      )}
                      {template.hidePreviewImage ? (
                        <div
                          className="absolute inset-0 backdrop-blur-xl bg-white/25 dark:bg-slate-900/35"
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    {isActive && (
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center rounded-full bg-emerald-500 text-white px-3 py-1 font-semibold shadow-lg shadow-emerald-500/40 dark:shadow-emerald-500/30">
                          {t("badges.activeNow")}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 border border-emerald-200 dark:border-emerald-500/40 backdrop-blur">
                          {t("badges.currentTemplate")}
                        </span>
                      </div>
                    )}

                    {template.isUnderConstruction && (
                      <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-600/90 dark:bg-slate-700/95 text-white px-2.5 py-0.5 text-[11px] font-semibold shadow-sm border border-slate-500/40">
                        {t("badges.underConstruction")}
                      </span>
                    )}
                    {isNew && !isActive && !template.isUnderConstruction && (
                      <span className="absolute top-3 right-3 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-[11px] font-semibold shadow-sm border border-amber-200/50 dark:border-amber-500/30">
                        {t("badges.new")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-4 space-y-3">
                  <div
                    className={`flex items-center justify-between gap-2 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {isRTL ? template.nameAr : template.name}
                      </h2>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {template.id === "default"
                          ? t("cards.defaultHelper")
                          : t("cards.templateHelper")}
                      </p>
                    </div>

                    {template.id === "default" && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary px-2.5 py-1 text-[11px] font-semibold">
                        {t("badges.default")}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {isRTL ? template.descriptionAr : template.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    {/* Primary select button - full width */}
                    <button
                      type="button"
                      id={
                        templateIndex === 0
                          ? "onboarding-select-template"
                          : undefined
                      }
                      disabled={
                        typeof isLoading === "string"
                          ? isLoading !== template.id
                          : false
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template.id);
                      }}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors ${
                        isActive
                          ? "bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white"
                          : "bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 text-white"
                      }`}
                    >
                      {typeof isLoading === "string" ? (
                        isLoading === template.id ? (
                          <FaSpinner className="animate-spin text-sm md:text-base" />
                        ) : (
                          <FaCheck className=" text-sm md:text-base" />
                        )
                      ) : !isActive ? (
                        <HiOutlineHand className="text-sm md:text-base" />
                      ) : (
                        <FaCheck className=" text-sm md:text-base" />
                      )}
                      {isActive
                        ? t("cards.buttonActive")
                        : t("cards.buttonUse")}
                    </button>

                    {/* Secondary actions row: preview + customize */}
                    <div
                      className={`flex gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(linkView, "_blank");
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        <FiEye className="text-sm" />
                        {t("cards.preview")}
                      </button>
                      {template.canEdit && (
                        <button
                          type="button"
                          disabled={Boolean(customizeLoadingSlug)}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleOpenCustomize(template);
                          }}
                          className={`${customizeButtonClassName} disabled:opacity-60 disabled:cursor-wait`}
                        >
                          {isCustomizeLoading ? (
                            <FaSpinner className="animate-spin text-sm" />
                          ) : (
                            <FiSettings className="text-sm" />
                          )}
                          {t("cards.customize")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful tips */}
        <div className="mt-8 rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/70 dark:bg-sky-900/30 px-4 py-4 md:px-6 md:py-5 flex flex-col gap-3">
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse text-right" : "text-left"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-sm font-bold">
              ✨
            </div>
            <h3 className="text-sm md:text-base font-semibold text-sky-900 dark:text-sky-200">
              {t("tips.title")}
            </h3>
          </div>

          <ul
            className={`text-[11px] md:text-xs text-slate-600 dark:text-slate-400 space-y-1.5 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            <li>{t("tips.tip1")}</li>
            <li>{t("tips.tip2")}</li>
            <li>{t("tips.tip3")}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
