"use client";

import { useTranslations, useLocale } from "next-intl";
import { FiDownload as Download, FiShield as Shield, FiZap as Zap, FiMonitor as Monitor, FiBell as Bell } from "react-icons/fi";
import { FaAndroid } from "react-icons/fa";

const APP_VIDEO_SRC = "/app/order.mp4";
const APP_VIDEO_POSTER = "/app/order.jpg";

const AppLandingHero = () => {
    const t = useTranslations("Landing.Hero");
    const locale = useLocale();
    const isRTL = locale === "ar";

    return (
        <section className="relative overflow-hidden bg-white dark:bg-[#0d1117] pt-24 pb-16 md:pt-40 md:pb-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-40">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-violet-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/20 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRTL ? "lg:flex-row-reverse" : ""}`}>

                    <div className="lg:w-3/5 text-center lg:text-start">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-bold text-xs mb-6 border border-violet-100 dark:border-violet-500/20 shadow-sm">
                            <FaAndroid size={16} />
                            <span className="tracking-wide">{t("badge")}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black leading-[1.15] mb-6 text-slate-900 dark:text-white tracking-tight">
                            {t("titleStart")}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">
                                {t("titleHighlight")}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {t("description")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start mb-12">
                            <a
                                href="https://expo.dev/artifacts/eas/iXgE6EHRgCGLqf8HwRek6R.apk"
                                download
                                className="group relative flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-violet-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.03] transition-all shadow-xl shadow-violet-500/25 active:scale-95"
                            >
                                <Download size={24} className="group-hover:animate-bounce" />
                                <div className="text-start border-s border-white/20 ps-4">
                                    <span className="block text-[10px] opacity-70 font-bold uppercase tracking-[0.2em] leading-none mb-1">
                                        {t("downloadKicker")}
                                    </span>
                                    <span className="block text-xl tracking-tight">{t("downloadCta")}</span>
                                    <p className="text-[11px] text-slate-400 mt-2 text-center sm:text-start">
                                        {t("noSetupRequired")}
                                    </p>
                                </div>

                            </a>


                            <div className="flex flex-col items-center sm:items-start gap-1 px-2 border-s-2 border-slate-100 dark:border-slate-800 ms-2">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter italic">
                                    {t("optimizedFor")}
                                </span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t("platform")}
                                </span>
                                <p className="text-xs text-slate-400 mt-3">{t("safeInstall")}</p>
                                <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">
                                    {t("noBrowser")}
                                </span>

                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-6 border-t border-slate-100 dark:border-slate-800 pt-8">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Zap size={20} className="text-amber-500" />
                                <span className="text-sm font-bold">{t("features.liveAlerts")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Monitor size={20} className="text-blue-500" />
                                <span className="text-sm font-bold">{t("features.cashier")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Shield size={20} className="text-green-500" />
                                <span className="text-sm font-bold">{t("features.admin")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/5 w-full relative flex justify-center">
                        <div className="relative w-[260px] sm:w-[300px] md:w-[330px] mx-auto">
                            {/* Glow halo behind phone */}
                            <div className="pointer-events-none absolute inset-0 -m-10 bg-gradient-to-br from-violet-500/25 via-transparent to-blue-500/20 blur-3xl rounded-full -z-10" />

                            {/* Phone frame (floats up/down) */}
                            <div className="relative animate-float">
                                <div className="relative rounded-[3rem] border-[10px] border-slate-900 dark:border-slate-800 bg-slate-950 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4),0_0_50px_-15px_rgba(124,58,237,0.45)] overflow-hidden aspect-[9/19] ring-2 ring-slate-700/30">
                                    {/* Notch with speaker + camera */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-20 flex items-center justify-center gap-2">
                                        <div className="w-12 h-1 bg-slate-700 rounded-full" />
                                        <div className="size-1.5 bg-slate-700 rounded-full" />
                                    </div>

                                    {/* Side button highlights */}
                                    <div className="absolute -left-[14px] top-24 w-1 h-10 bg-slate-800 rounded-l-md" />
                                    <div className="absolute -left-[14px] top-40 w-1 h-16 bg-slate-800 rounded-l-md" />
                                    <div className="absolute -right-[14px] top-32 w-1 h-20 bg-slate-800 rounded-r-md" />

                                    <video
                                        src={APP_VIDEO_SRC}
                                        poster={APP_VIDEO_POSTER}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        aria-label={t("videoAlt")}
                                    />
                                </div>
                            </div>

                            {/* Floating Card — Top: Live Order */}
                            <div
                                className={`absolute top-12 hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 ring-1 ring-violet-500/10 animate-pulse-slow z-20 ${isRTL ? "-left-16" : "-right-16"
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Bell size={18} className="text-white" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 size-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-800 animate-ping" />
                                    <span className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
                                </div>
                                <div className="text-start">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                                        {t("floatingCards.liveOrderLabel")}
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                        {t("floatingCards.liveOrderText")}
                                    </p>
                                </div>
                            </div>

                            {/* Floating Card — Bottom: Response */}
                            <div
                                className={`absolute bottom-24 hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 ring-1 ring-blue-500/10 animate-pulse-slow [animation-delay:1.5s] z-20 ${isRTL ? "-right-14" : "-left-14"
                                    }`}
                            >
                                <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                                    <Zap size={18} className="text-white" />
                                </div>
                                <div className="text-start">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                                        {t("floatingCards.responseLabel")}
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                        0.2s <span className="text-emerald-500 text-xs">↗ 99%</span>
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

export default AppLandingHero;