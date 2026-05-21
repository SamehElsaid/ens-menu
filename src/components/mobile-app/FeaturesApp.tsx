"use client";

import { useMemo, useState } from "react";

import { useTranslations, useLocale } from "next-intl";
import {
  FiCheckCircle,
  FiPlusCircle,
  FiGrid,
  FiActivity,
  FiCheckSquare,
  FiGlobe,
  FiFileText,
} from "react-icons/fi";
import LoadImage from "../ImageLoad";

const icons = [
  FiPlusCircle,
  FiGrid,
  FiActivity,
  FiCheckSquare,
  FiGlobe,
  FiFileText,
];

const showcaseImages = [
  "/images/showcase/p-(2).jpg",
  "/images/showcase/p-(5).jpg",
  "/images/showcase/p-(1).jpg",
  "/images/showcase/p-(3).jpg",
  "/images/showcase/p-(4).jpg",
  "/images/showcase/p-(6).jpg",
];

type FeatureItem = { title: string; desc: string };

const FeaturesApp = () => {
  const t = useTranslations("Landing.FeaturesApp");
  const tMobile = useTranslations("Landing.mobileApp");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const items = useMemo(() => {
    const raw = t.raw("items");
    return Array.isArray(raw) ? (raw as FeatureItem[]) : [];
  }, [t]);
  const [active, setActive] = useState(0);
  const ActiveIcon = icons[active % icons.length];

  if (items.length === 0) return null;

  return (
    <section className="relative py-20 bg-white dark:bg-[#0d1117] overflow-hidden">
      {/* Background Glow — matches other sections */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-[10%] ${isRTL ? "left-[5%]" : "right-[5%]"} w-[35%] h-[35%] bg-violet-500/10 blur-[120px] rounded-full`}
        />
        <div
          className={`absolute bottom-[10%] ${isRTL ? "right-[5%]" : "left-[5%]"} w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full`}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header — matches WorkflowApp/FaqApp */}
        <div className="text-center mb-20">
          <span className="inline-block text-violet-600 dark:text-violet-400 font-bold text-sm tracking-widest uppercase mb-3">
            {tMobile("whyOurApp")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div
          className={`flex flex-col lg:flex-row gap-12 lg:gap-16 items-start ${isRTL ? "lg:flex-row-reverse" : ""}`}
        >
          {/* LEFT — Features list */}
          <div className="w-full lg:w-1/2 space-y-3">
            {items.map((item: FeatureItem, i: number) => {
              const Icon = icons[i % icons.length];
              const isActive = active === i;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`group relative w-full cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-start ${
                    isActive
                      ? "bg-white dark:bg-slate-800 border-violet-500 shadow-xl shadow-violet-500/10"
                      : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Active accent bar */}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-linear-to-b from-violet-500 to-indigo-600 transition-opacity duration-300 ${
                      isRTL ? "right-0" : "left-0"
                    } ${isActive ? "opacity-100" : "opacity-0"}`}
                  />

                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/40 scale-110"
                          : "bg-slate-100 dark:bg-slate-800 text-violet-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base sm:text-lg font-bold mb-1 transition-colors ${
                          isActive
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                          isActive
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500 line-clamp-2"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>

                    {isActive && (
                      <div className="text-violet-500 shrink-0">
                        <FiCheckCircle size={20} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT — Phone mockup with screenshot */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <div className="relative bg-linear-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-500/5 dark:via-slate-900 dark:to-indigo-500/5 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-violet-500/10">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-violet-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-indigo-400/20 blur-3xl" />

              {/* Top: Live Preview badge */}
              <div
                className={`absolute top-5 z-20 inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/60 dark:border-slate-700/60 ${isRTL ? "right-5" : "left-5"}`}
              >
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {tMobile("livePreview")}
                </span>
              </div>

              {/* Top: Step counter */}
              <div
                className={`absolute top-5 z-20 inline-flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/60 dark:border-slate-700/60 ${isRTL ? "left-5" : "right-5"}`}
              >
                <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-bold text-slate-400">/</span>
                <span className="text-xs font-bold text-slate-400">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>

              {/* Tablet screenshot — clean rounded frame, no device chrome */}
              <div className="relative z-10 mx-auto w-full max-w-[480px] aspect-770/1280 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl shadow-violet-500/20 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                <div className="absolute inset-0">
                  <LoadImage
                    src={showcaseImages[active % showcaseImages.length]}
                    alt={items[active].title}
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Active feature title (under screenshot) */}
              <div className="relative z-10 mt-6 text-center px-4">
                <div className="flex items-center justify-center gap-2">
                  <ActiveIcon
                    size={18}
                    className="text-violet-600 dark:text-violet-400 shrink-0"
                  />
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {items[active].title}
                  </h4>
                </div>

                {/* Dots indicator (clickable) */}
                <div className="mt-4 flex justify-center gap-1.5">
                  {items.map((_: FeatureItem, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Go to feature ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === active
                          ? "w-6 bg-violet-600 dark:bg-violet-400"
                          : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesApp;
