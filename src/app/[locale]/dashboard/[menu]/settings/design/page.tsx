'use client';

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { templatesInfo } from "@/modules/TemplateShow/data";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LinkTo from "@/components/Global/LinkTo";
import { FiEye, FiSettings } from "react-icons/fi";
import { HiOutlineHand } from "react-icons/hi";
import { axiosPatch } from "@/shared/axiosCall";
import type { Menu } from "@/types/Menu";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function DesignPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const t = useTranslations("settingsDesignPage");

  const dispatch = useAppDispatch();
  const { menu } = useAppSelector((state) => state.menuData);
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    typeof menu?.theme === "string" && menu.theme !== "" ? (menu.theme as string) : "default"
  );

  useEffect(() => {
    if (menu?.theme) {
      setActiveTemplateId(menu.theme as string);
    }
  }, [menu?.theme]);



  const handleSelectTemplate = async (templateId: string) => {

    if (!menu?.id) return;

    setIsLoading(templateId);
    try {
      const payload = { theme: templateId };
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${menu.id}`,
        locale,
        payload
      );

      if (result.status) {
        setActiveTemplateId(templateId);
        dispatch(SET_ACTIVE_USER({
          ...menu,
          theme: templateId,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className={isRTL ? "text-right" : "text-left"}>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t("title")}
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl">
          {t("subtitle")}
        </p>
      </header>

      {/* Templates grid */}
      <section className="bg-slate-50/60 rounded-3xl border border-slate-100 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templatesInfo.map((template) => {
            const isActive = template.id === activeTemplateId;
            const isNew = template.isNew;
            const linkView = template.slug + process.env.NEXT_PUBLIC_MENU_URL;
            const editLink = `/dashboard/${menu?.id}/settings/design/${template.slug}`;

            return (
              <div
                key={template.id}
                className={`group relative cursor-pointer rounded-[28px] border bg-white shadow-sm transition-all duration-200 overflow-hidden ${isActive
                  ? "border-primary ring-2 ring-primary/30 shadow-xl shadow-primary/10"
                  : "border-slate-100 hover:border-primary/60 hover:shadow-md"
                  }`}
              >
                {/* Top status & image */}
                <div className="relative p-4 pb-0">

                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3">
                    <div className="relative h-full w-full overflow-hidden">
                      <LoadImage
                        src={template.image}
                        disableLazy
                        alt={isRTL ? template.nameAr : template.name}
                        className="w-full auto-scroll-image"
                      />
                    </div>

                    {isActive && (
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center rounded-full bg-emerald-500 text-white px-3 py-1 font-semibold shadow-lg shadow-emerald-500/40">
                          {t("badges.activeNow")}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50/80 text-emerald-700 px-2 py-0.5 border border-emerald-200 backdrop-blur">
                          {t("badges.currentTemplate")}
                        </span>
                      </div>
                    )}

                    {isNew && !isActive && (
                      <span className="absolute top-3 right-3 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[11px] font-semibold shadow-sm">
                        {t("badges.new")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-4 space-y-3">
                  <div
                    className={`flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""
                      }`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h2 className="text-base font-semibold text-slate-900">
                        {isRTL ? template.nameAr : template.name}
                      </h2>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {template.id === "default"
                          ? t("cards.defaultHelper")
                          : t("cards.templateHelper")}
                      </p>
                    </div>

                    {template.id === "default" && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold">
                        {t("badges.default")}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs text-slate-500 leading-relaxed line-clamp-2 ${isRTL ? "text-right" : "text-left"
                      }`}
                  >
                    {isRTL ? template.descriptionAr : template.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    {/* Primary select button - full width */}
                    <button
                      type="button"
                      disabled={typeof isLoading === "string" ? isLoading !== template.id : false}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template.id);
                      }}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors ${isActive
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                    >
                      {typeof isLoading === "string" ? isLoading === template.id ? <FaSpinner className="animate-spin text-sm md:text-base" /> : <FaCheck className=" text-sm md:text-base" /> : !isActive ? <HiOutlineHand className="text-sm md:text-base" /> : <FaCheck className=" text-sm md:text-base" />}
                      {isActive
                        ? t("cards.buttonActive")
                        : t("cards.buttonUse")}
                    </button>

                    {/* Secondary actions row: preview + customize */}
                    <div
                      className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(linkView, "_blank");
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <FiEye className="text-sm" />
                        {t("cards.preview")}
                      </button>
                      {template.canEdit && (
                        <LinkTo
                          href={isActive ? editLink : "#"}
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.stopPropagation();
                            if (!isActive) {
                              toast.error(t("cards.templateNotActive"));
                            }
                          }}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors ${!template.canEdit ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <FiSettings className="text-sm" />
                          {t("cards.customize")}
                        </LinkTo>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful tips */}
        <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 md:px-6 md:py-5 flex flex-col gap-3">
          <div
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : "text-left"
              }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-sm font-bold">
              ✨
            </div>
            <h3 className="text-sm md:text-base font-semibold text-sky-900">
              {t("tips.title")}
            </h3>
          </div>

          <ul
            className={`text-[11px] md:text-xs text-slate-600 space-y-1.5 ${isRTL ? "text-right" : "text-left"
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
