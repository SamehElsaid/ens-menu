"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  FiGrid,
  FiImage,
  FiGlobe,
  FiRefreshCw,
  FiLock,
  FiCpu,
  FiSmartphone,
  FiUpload,
} from "react-icons/fi";

const featureIcons = [
  FiSmartphone,
  FiCpu,
  FiGrid,
  FiImage,
  FiUpload,
  FiGlobe,
  FiRefreshCw,
  FiLock,
];

const featureColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-red-500",
  "from-slate-600 to-slate-700",
];

const featureKeys = [
  "qrMenu",
  "aiAssistant",
  "menuManagement",
  "uploadPhotos",
  "uploadLogo",
  "multiLanguage",
  "realtimeUpdates",
  "securePlatform",
] as const;

const FeaturesOwnerApp = () => {
  const t = useTranslations("Landing.OwnerApp");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="relative py-20 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-[5%] ${isRTL ? "left-[5%]" : "right-[5%]"} w-[35%] h-[35%] bg-violet-500/8 blur-[120px] rounded-full`}
        />
        <div
          className={`absolute bottom-[5%] ${isRTL ? "right-[5%]" : "left-[5%]"} w-[30%] h-[30%] bg-green-500/8 blur-[100px] rounded-full`}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-600 dark:text-violet-400 font-bold text-sm tracking-widest uppercase mb-3">
            {t("featuresSectionTitle")}
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mt-2">
            {t("featuresSectionSubtitle")}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            const gradient = featureColors[i];

            return (
              <div
                key={key}
                className="group relative bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1"
              >
                {/* Icon */}
                <div
                  className={`size-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={22} className="text-white" />
                </div>

                {/* Text */}
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  {t(`features.${key}`)}
                </h3>

                {/* Decorative dot */}
                <div className="absolute bottom-4 end-4 size-2 rounded-full bg-violet-400/30 group-hover:bg-violet-500/60 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesOwnerApp;
