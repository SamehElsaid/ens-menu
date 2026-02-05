"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
// import Image from "next/image";       
import { BsCheckCircle } from "react-icons/bs";
import { templates } from "@/modules/TemplateShow";
import LoadImage from "../ImageLoad";

export const TemplateShow = () => {
  const [activeTab, setActiveTab] = useState(0);
  const locale = useLocale();
  const isRTL = locale === "ar";

  const activeTemplate = templates[activeTab];

  return (
    <section className="py-24 bg-white dark:bg-[#0d1117] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">
            {isRTL ? "اختر القالب " : "Choose the "}
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {isRTL ? "المناسب لك" : "Right Template"}
            </span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            {isRTL
              ? "مجموعة متنوعة من القوالب الاحترافية المصممة خصيصًا لتناسب كل أنواع المطاعم والكافيهات"
              : "A variety of professional templates designed specifically to suit all types of restaurants and cafes"}
          </p>
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
                    className={`text-[17px]! font-black mb-1 ${activeTab === template.id
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
                    <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                      {isRTL ? activeTemplate.textAr : activeTemplate.textEn}
                    </p>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-[40px] shadow-2xl border-4 border-white dark:border-[#0d1117] aspect-video">

                  <LoadImage
                    src={activeTemplate.image}
                    alt={
                      isRTL ? activeTemplate.titleAr : activeTemplate.titleEn
                    }
                    disableLazy={true}
                    className="w-full h-full object-cover"
                  />
                
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent flex items-end p-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                        <BsCheckCircle size={24} />
                      </div>
                      <span className="text-white text-xl font-black">
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
