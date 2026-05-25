"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineQrCode,
} from "react-icons/hi2";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
  sectionHighlightClassName,
} from "@/components/HomePage/SectionBadge";

const MENU_IMAGES = {
  hero: "/images/temp/noir.webp",
  appetizers: "/images/temp/coffee.webp",
  drinks: "/images/temp/sky.webp",
  dish: "/images/temp/emerald.webp",
  salad: "/images/temp/neon.webp",
} as const;

const STEP_KEYS = ["scan", "browse", "enjoy"] as const;
type StepKey = (typeof STEP_KEYS)[number];

function MenuImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
    </div>
  );
}

export default function ScanBrowseEnjoySection() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Landing.scanBrowseEnjoy");
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % STEP_KEYS.length) + STEP_KEYS.length) % STEP_KEYS.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => goTo(activeIndex + 1), 4500);
    return () => clearInterval(interval);
  }, [activeIndex, goTo]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const PrevIcon = isRTL ? HiOutlineChevronRight : HiOutlineChevronLeft;
  const NextIcon = isRTL ? HiOutlineChevronLeft : HiOutlineChevronRight;

  return (
    <section
      id="scan-browse-enjoy"
      className="relative overflow-hidden bg-slate-50/50 py-16 dark:bg-[#0d1117] sm:py-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mx-auto mb-16 max-w-3xl text-center">
          <div className="flex justify-center">
            <SectionBadge icon={<HiOutlineQrCode className="h-4 w-4" aria-hidden />}>
              {t("badge")}
            </SectionBadge>
          </div>

          <h2 className={sectionHeadingClassName}>
            {t("title")}{" "}
            <span className={sectionHighlightClassName}>
              {t("subtitle")}
            </span>
          </h2>

          <p className={sectionDescriptionClassName}>
            {t("description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5" role="tablist">
            {STEP_KEYS.map((key, index) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                onClick={() => goTo(index)}
                className={`rounded-full border px-4 py-1.5 text-xs font-black transition-all duration-300 sm:text-sm ${
                  activeIndex === index
                    ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-600/25 dark:border-violet-500 dark:bg-violet-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#15203c] dark:text-slate-300"
                }`}
              >
                <span className="opacity-60 me-1">0{index + 1}.</span> {t(`steps.${key}`)}
              </button>
            ))}
          </div>
        </header>

        <div className="relative mx-auto flex max-w-5xl items-center justify-center h-[460px] sm:h-[540px]">
          
          <div className="absolute inset-x-0 z-40 flex justify-between px-2 sm:px-12 pointer-events-none">
            <button
              type="button"
              onClick={goPrev}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-xl backdrop-blur-xs transition hover:scale-105 active:scale-95 dark:border-slate-700 dark:bg-[#15203c]/90 dark:text-slate-200 sm:h-12 sm:w-12"
            >
              <PrevIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-xl backdrop-blur-xs transition hover:scale-105 active:scale-95 dark:border-slate-700 dark:bg-[#15203c]/90 dark:text-slate-200 sm:h-12 sm:w-12"
            >
              <NextIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div 
            className={`absolute hidden md:block w-[240px] lg:w-[260px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/40 transition-all duration-700 ease-out dark:border-slate-800 dark:bg-[#15203c] ${
              activeIndex === 1 
                ? "z-30 translate-x-0 scale-100 opacity-0 pointer-events-none" 
                : isRTL 
                  ? "translate-x-[180px] lg:translate-x-[220px] scale-90 opacity-40 z-10" 
                  : "-translate-x-[180px] lg:translate-x-[-220px] scale-90 opacity-40 z-10"
            }`}
          >
            <div className="relative h-28 w-full rounded-xl bg-slate-100">
              <MenuImage src={MENU_IMAGES.hero} alt="" className="rounded-xl" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-xl">
                <span className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-black text-slate-900 shadow-xs">Select a Menu</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50/80 p-1.5 text-center border border-slate-100/50 dark:bg-slate-900/50 dark:border-transparent">
                <div className="h-10 w-full rounded-lg"><MenuImage src={MENU_IMAGES.appetizers} alt="" className="rounded-lg" /></div>
                <p className="mt-1 text-[9px] font-black text-slate-700 dark:text-slate-300">Appetizers</p>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-1.5 text-center border border-slate-100/50 dark:bg-slate-900/50 dark:border-transparent">
                <div className="h-10 w-full rounded-lg"><MenuImage src={MENU_IMAGES.drinks} alt="" className="rounded-lg" /></div>
                <p className="mt-1 text-[9px] font-black text-slate-700 dark:text-slate-300">Drinks</p>
              </div>
            </div>
          </div>

          <div className="relative z-20 h-[440px] w-[220px] sm:h-[500px] sm:w-[250px] rounded-[2.5rem] border-[6px] border-slate-900 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/10 dark:border-slate-800 dark:bg-[#15203c]">
            <div className="absolute top-2.5 left-1/2 h-3.5 w-20 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-950 sm:top-3 sm:h-4 sm:w-24" />
            
            <div className="h-full w-full overflow-hidden rounded-[2.1rem] bg-slate-50 p-3 pt-9 dark:bg-slate-900/40">
              <div className="relative h-full w-full overflow-hidden">
                
                <div className={`absolute inset-0 flex flex-col justify-between py-4 transition-all duration-500 ease-in-out ${activeIndex === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                  <div className="text-center">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{t("slides.scan.title")}</h3>
                    <p className="mt-1 text-[9px] px-2 text-slate-400 font-medium">{t("slides.scan.description")}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-violet-400 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-950/40 animate-pulse">
                      <HiOutlineQrCode className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                      <span className="absolute -bottom-2 rounded-full bg-violet-600 px-2 py-0.5 text-[8px] font-bold text-white">QR</span>
                    </div>
                    <p className="mt-3 text-[9px] font-bold text-violet-600 dark:text-violet-400 tracking-wider animate-bounce">{t("slides.scan.scanning")}</p>
                  </div>
                </div>

             
                <div className={`absolute inset-0 flex flex-col gap-2 transition-all duration-500 ease-in-out ${activeIndex === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                  <div className="text-center mb-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{t("slides.browse.title")}</h3>
                  </div>
                  <div className="relative h-24 w-full rounded-xl"><MenuImage src={MENU_IMAGES.hero} alt="" className="rounded-xl" /></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-white p-1 text-center shadow-xs dark:bg-slate-800"><div className="h-9 w-full rounded-md"><MenuImage src={MENU_IMAGES.appetizers} alt="" className="rounded-md" /></div><span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">{t("slides.browse.appetizers")}</span></div>
                    <div className="rounded-lg bg-white p-1 text-center shadow-xs dark:bg-slate-800"><div className="h-9 w-full rounded-md"><MenuImage src={MENU_IMAGES.drinks} alt="" className="rounded-md" /></div><span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">{t("slides.browse.drinks")}</span></div>
                  </div>
                </div>

               
                <div className={`absolute inset-0 flex flex-col justify-between transition-all duration-500 ease-in-out ${activeIndex === 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                  <div className="text-center">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{t("slides.enjoy.title")}</h3>
                    <p className="mt-1 text-[9px] text-slate-400 font-medium px-1">{t("slides.enjoy.description")}</p>
                  </div>
                  <div className="my-2 flex-1 rounded-xl border border-slate-100 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-[#15203c]">
                    <div className="h-20 w-full rounded-lg"><MenuImage src={MENU_IMAGES.dish} alt="" className="rounded-lg" /></div>
                    <h4 className="mt-1.5 text-[10px] text-start font-black text-slate-800 dark:text-white">{t("slides.enjoy.dishName")}</h4>
                    <div className="mt-1 flex items-center justify-between text-[9px]">
                      <span className="font-black text-violet-600 dark:text-violet-400">{t("slides.enjoy.price")}</span>
                      <span className="rounded bg-slate-100 px-1 py-0.5 text-slate-500 dark:bg-slate-800">{t("slides.enjoy.quantity")}</span>
                    </div>
                  </div>
                  <button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-center text-[10px] font-bold text-white shadow-md shadow-indigo-600/20">
                    {t("slides.enjoy.addToOrder")}
                  </button>
                </div>

              </div>
            </div>
          </div>

       
          <div 
            className={`absolute hidden md:block w-[240px] lg:w-[260px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/40 transition-all duration-700 ease-out dark:border-slate-800 dark:bg-[#15203c] ${
              activeIndex === 2 
                ? "z-30 translate-x-0 scale-100 opacity-0 pointer-events-none" 
                : isRTL 
                  ? "-translate-x-[180px] lg:translate-x-[-220px] scale-90 opacity-40 z-10" 
                  : "translate-x-[180px] lg:translate-x-[220px] scale-90 opacity-40 z-10"
            }`}
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-50 text-[9px] font-black text-violet-600 dark:bg-violet-950">QR</span>
              <span className="truncate text-[10px] font-black text-slate-800 dark:text-white">{t("slides.enjoy.restaurantName")}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-7 w-7 rounded-lg"><MenuImage src={MENU_IMAGES.salad} alt="" className="rounded-lg" /></div>
                <span className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">{t("slides.enjoy.itemName")}</span>
              </div>
              <span className="text-[10px] font-black text-slate-900 dark:text-white">{t("slides.enjoy.itemPrice")}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}