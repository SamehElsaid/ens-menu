"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  FiArrowLeft as ArrowLeft,
  FiArrowRight as ArrowRight,
  FiMenu as Menu,
  FiShoppingCart as ShoppingCart,
} from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { menuItemsData } from "@/modules/menuItems";
import { MenuItem } from "@/types/types";
import Background from "../Global/Background";
import LoadImage from "../ImageLoad";

// Interactive Phone Component
const InteractivePhone = () => {
  const [step, setStep] = useState(0);
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    const timer = setInterval(() => setStep((prev) => (prev + 1) % 3), 4500);
    return () => clearInterval(timer);
  }, []);

  const menuItems: MenuItem[] = menuItemsData.map((item) => ({
    name: isRTL ? item.nameAr : item.nameEn,
    price: item.price,
    image: item.image,
    desc: isRTL ? item.descAr : item.descEn,
    category: item.category,
  }));

  const categories = isRTL
    ? ["الكل", "مشروبات", "مخبوزات", "حلويات"]
    : ["All", "Drinks", "Bakery", "Desserts"];

  return (
    <div
      className="relative w-full max-w-[340px] bg-slate-900 dark:bg-slate-950 rounded-[50px] border-12 border-slate-800 dark:border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(124,58,237,0.3)] overflow-hidden"
      style={{ height: "680px", minHeight: "680px", aspectRatio: "340/680" }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-900 rounded-b-2xl z-50"></div>
      <div className="relative h-full bg-white dark:bg-gray-50 overflow-hidden w-full">
        <>
          {step === 0 && (
            <div
              key="qr"
              className="h-full flex flex-col items-center justify-center p-8 bg-purple-50 dark:bg-purple-100"
            >
              <div className="bg-white p-7 rounded-[40px] shadow-2xl border-2 border-purple-100 mb-8">
                <BsQrCode size={160} className="text-slate-900" />
              </div>
              <p className="text-purple-700 font-bold text-lg text-center leading-relaxed">
                {isRTL
                  ? "قم بمسح الرمز لتصفح المنيو"
                  : "Scan code to browse menu"}
              </p>
            </div>
          )}
          {step === 1 && (
            <div
              key="scanning"
              className="h-full flex flex-col items-center justify-center p-8 bg-black relative"
            >
              <div className="w-full aspect-square border-2 border-white/20 rounded-[40px] flex items-center justify-center overflow-hidden relative">
                <BsQrCode size={140} className="text-white/40" />
                <div className="absolute left-6 right-6 top-0 h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.9)] z-10" />
              </div>
              <p className="mt-8 text-white text-lg font-medium tracking-wide">
                {isRTL
                  ? "جاري مسح المنيو الالكتروني..."
                  : "Scanning the electronic menu..."}
              </p>
            </div>
          )}
          {step === 2 && (
            <div
              key="menu"
              className="h-full flex flex-col bg-white"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="p-7 pt-10 bg-linear-to-br from-purple-600 to-indigo-700 text-white rounded-b-[40px] shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <Menu size={22} />
                  <p className="text-sm font-black tracking-tight">
                    {isRTL ? "أسم نشاطك التجاري" : "Your Business Name"}
                  </p>
                  <ShoppingCart size={22} />
                </div>
              </div>
              <div className="px-7 py-4 flex gap-3 overflow-x-auto no-scrollbar">
                {categories.map((cat, i) => (
                  <div
                    key={i}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${i === 0
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
              <div className="px-7 pb-8 space-y-4 overflow-y-auto no-scrollbar flex-1">
                {menuItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-purple-100 transition-all cursor-pointer"
                  >
                    <div className="w-[56px] h-[56px]">
                      <LoadImage
                        src={item.image}
                        alt={item.name}
                        disableLazy={true}
                        className="w-full h-full object-cover rounded-xl shadow-sm"
                      />
                    </div>



                    <div className="flex-1">
                      <h4 className="text-md font-black text-slate-800">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                    <div className="text-purple-600 font-black text-[12px] bg-white px-2 py-1 rounded-lg border border-purple-50 shadow-sm">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const t = useTranslations("heroSection");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative pt-44 pb-24 overflow-hidden min-h-[95vh] flex items-center bg-white dark:bg-[#0d1117]">
      <Background />
      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 ${isRTL ? "lg:flex-row-reverse" : ""
            }`}
        >
          <div className={`lg:w-1/2  order-2 `}>
            <div className="inline-block px-5 py-2 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold text-sm mb-8 border border-purple-100 dark:border-purple-500/30 shadow-sm">
              {t("badge")} 🚀
            </div>
            <h1 className="text-3xl  font-extrabold leading-[1.1] mb-8 text-slate-900 dark:text-white">
              {t("title1")}{" "}
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {t("title2")}
              </span>
            </h1>
            <p
              className={`text-lg  text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl font-medium ${isRTL ? "ml-auto" : ""
                }`}
            >
              {t("description")}
            </p>
            <div
              className={`flex flex-wrap items-center gap-5 ${isRTL ? "justify-end" : "justify-start"
                }`}
            >
              <div>
                <Link
                  href={`/${locale}/authentication/sign-up`}
                  className="px-10 py-5 rounded-full bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white font-bold text-md shadow-2xl shadow-purple-200 dark:shadow-purple-900/50 flex items-center gap-3"
                >
                  <span>{t("cta")}</span>
                  <ArrowIcon size={24} />
                </Link>
              </div>
              <button className="px-10 py-5 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                {t("watchDemo")}
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 relative flex justify-center order-1 ">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 blur-[100px] opacity-15 dark:opacity-25" />
              <InteractivePhone />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
