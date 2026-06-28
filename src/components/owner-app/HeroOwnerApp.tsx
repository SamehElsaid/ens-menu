"use client";

import { useTranslations, useLocale } from "next-intl";
import { FiZap, FiBell, FiSmartphone } from "react-icons/fi";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import Image from "next/image";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.ensmenu.ens_owner_app";

const HeroOwnerApp = () => {
  const t = useTranslations("Landing.OwnerApp");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0d1117] pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] bg-violet-500/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-green-500/15 blur-[110px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-indigo-500/15 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}
        >
          {/* Content */}
          <div className="lg:w-3/5 text-center lg:text-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold text-xs mb-6 border border-green-100 dark:border-green-500/20 shadow-sm">
              <FaGooglePlay size={14} />
              <span className="tracking-wide">{t("badge")}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 text-slate-900 dark:text-white tracking-tight">
              {t("titleStart")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500">
                {t("titleHighlight")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t("description")}
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-12">
              {/* Google Play — standard badge */}
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-5 py-3 bg-black text-white rounded-xl hover:scale-[1.03] hover:brightness-110 transition-all shadow-lg active:scale-95 border border-white/10 min-w-[180px]"
              >
                <FaGooglePlay size={26} className="shrink-0 text-white" />
                <div className="text-start leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-75">
                    GET IT ON
                  </span>
                  <span className="block text-[17px] font-bold tracking-tight">
                    Google Play
                  </span>
                </div>
              </a>

              {/* Apple Store — coming soon, standard badge style */}
              <div className="relative inline-flex items-center gap-3 px-5 py-3 bg-black/40 text-white/40 rounded-xl cursor-not-allowed border border-white/10 min-w-[180px] select-none">
                <FaApple size={28} className="shrink-0" />
                <div className="text-start leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-75">
                    Download on the
                  </span>
                  <span className="block text-[17px] font-bold tracking-tight">
                    App Store
                  </span>
                </div>
                {/* Coming soon pill */}
                <span className="absolute -top-2.5 -end-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-amber-900 rounded-full shadow">
                  {t("appleComingSoon")}
                </span>
              </div>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
              {(
                [
                  { key: "qrMenu", color: "text-violet-500" },
                  { key: "aiAssistant", color: "text-blue-500" },
                  { key: "realtimeUpdates", color: "text-amber-500" },
                  { key: "multiLanguage", color: "text-green-500" },
                ] as const
              ).map(({ key, color }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  <FiZap size={16} className={color} />
                  <span className="text-sm font-bold">
                    {t(`features.${key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative w-full flex justify-center lg:w-2/5">
            <div className="relative w-[260px] sm:w-[290px] md:w-[310px] mx-auto">
              {/* Glow behind phone */}
              <div className="pointer-events-none absolute inset-0 -m-12 bg-gradient-to-br from-violet-500/30 via-transparent to-green-500/20 blur-3xl rounded-full -z-10" />

              {/* Phone frame */}
              <div className="relative animate-[float_4s_ease-in-out_infinite]">
                <div className="relative rounded-[3rem] border-[10px] border-slate-900 dark:border-slate-700 bg-slate-950 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5),0_0_50px_-15px_rgba(124,58,237,0.5)] overflow-hidden aspect-[9/19] ring-2 ring-slate-700/30">
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-2 border border-slate-800">
                    <div className="size-1.5 bg-slate-700 rounded-full" />
                    <div className="w-8 h-1 bg-slate-700 rounded-full opacity-40" />
                  </div>

                  {/* App screenshot placeholder — purple gradient with branding */}
                  <div className="w-full h-full bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-6 gap-4">
                    <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
                      <FiSmartphone size={32} className="text-white/80" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black text-lg leading-tight">
                        ENSMenu
                      </p>
                      <p className="text-violet-300 text-xs font-bold uppercase tracking-wider mt-1">
                        Owner
                      </p>
                    </div>
                    <div className="w-full space-y-2 mt-2">
                      {[80, 60, 70, 45].map((w, i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full bg-white/10"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card — Google Play */}
              <div
                className={`absolute top-10 hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 ${isRTL ? "-left-16" : "-right-16"}`}
              >
                <div className="size-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
                  <FaGooglePlay size={16} className="text-white" />
                </div>
                <div className="text-start">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                    {t("floatingCards.liveLabel")}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {t("floatingCards.liveText")}
                  </p>
                </div>
              </div>

              {/* Floating card — sync */}
              <div
                className={`absolute bottom-20 hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 ${isRTL ? "-right-14" : "-left-14"}`}
              >
                <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <FiBell size={16} className="text-white" />
                </div>
                <div className="text-start">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                    {t("floatingCards.syncLabel")}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {t("floatingCards.syncText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroOwnerApp;
