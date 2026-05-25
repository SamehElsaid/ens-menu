"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { BsCheckCircle } from "react-icons/bs";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { templates } from "@/modules/TemplateShow";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
  sectionHighlightClassName,
} from "@/components/HomePage/SectionBadge";

export const TemplateShow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Landing.templateShow");

  const activeTemplate = templates[activeTab];

  return (
    <section className="py-16 bg-white dark:bg-[#0d1117] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <SectionBadge
            icon={<HiOutlineSquares2X2 className="h-4 w-4" aria-hidden />}
          >
            {t("badge")}
          </SectionBadge>
          <h2 className={sectionHeadingClassName}>
            {t("choosePrefix")}
            <span className={sectionHighlightClassName}>
              {t("chooseHighlight")}
            </span>
          </h2>
          <p className={sectionDescriptionClassName}>{t("subtitle")}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 w-full flex flex-col gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActiveTab(template.id)}
                className={`p-6 rounded-[30px] ${isRTL ? "text-right" : "text-left"
                  } transition-all flex items-center gap-6 border-2 ${activeTab === template.id
                    ? "bg-white dark:bg-[#15203c] border-purple-500 shadow-2xl shadow-purple-100 dark:shadow-purple-900/50"
                    : "bg-slate-50 dark:bg-[#15203c]/50 border-transparent hover:bg-slate-100 dark:hover:bg-[#15203c]"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === template.id
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-[#0d1117] text-slate-400"
                    }`}
                >
                  <template.icon size={28} className="" />
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-base! font-black mb-1 ${activeTab === template.id
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-slate-800 dark:text-slate-200"
                      }`}
                  >
                    {isRTL ? template.titleAr : template.titleEn}
                  </h4>
                  <p className="text-sm font-medium text-slate-400">
                    {isRTL ? template.labelAr : template.labelEn}
                  </p>
                </div>
                {activeTab === template.id && (
                  <div className="w-1.5 h-10 bg-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="lg:w-2/3 w-full relative">
            <div className="bg-slate-50 dark:bg-[#15203c]/50 rounded-[50px] p-4 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div key={activeTab} className="space-y-8">
                <div className="px-2">
                  <div
                    className={`bg-white dark:bg-[#0d1117] p-6 rounded-[25px] border border-slate-100 dark:border-slate-800 shadow-sm inline-block max-w-full ${isRTL ? "text-right" : "text-left"
                      }`}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {isRTL ? activeTemplate.textAr : activeTemplate.textEn}
                    </p>
                  </div>
                </div>

                <div className="relative aspect-square overflow-hidden rounded-[40px] border-4 border-white shadow-2xl dark:border-[#0d1117] lg:aspect-video">
                  <Image
                    src={activeTemplate.image}
                    alt={
                      isRTL ? activeTemplate.titleAr : activeTemplate.titleEn
                    }
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover object-center"
                    priority={activeTab === 0}
                  />

                  <div className="absolute inset-0 z-10 flex items-end bg-linear-to-t from-slate-900/60 to-transparent p-5 sm:p-8 lg:p-10">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md sm:h-12 sm:w-12">
                        <BsCheckCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                      </div>
                      <span className="text-base font-black text-white sm:text-lg lg:text-xl">
                        {isRTL
                          ? activeTemplate.textAltAr
                          : activeTemplate.textAltEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplateShow;
