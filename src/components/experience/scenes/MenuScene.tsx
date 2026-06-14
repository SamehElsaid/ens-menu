"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiShoppingBag } from "react-icons/fi";
import LoadImage from "@/components/ImageLoad";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/localeDirection";
import {
  CAFE_LINA_MENU,
  type CafeLinaCategory,
} from "../cafeLinaMenu";
import ExperienceScene from "../ExperienceScene";
import { useExperience } from "../ExperienceContext";
import MenuAiBar from "./MenuAiBar";

const CATEGORIES: CafeLinaCategory[] = ["all", "drinks", "bakery", "food"];

export default function MenuScene() {
  const t = useTranslations("experienceHome");
  const locale = useLocale();
  const isRTL = isRtlLocale(locale);
  const { cartCount, cartTotal, addItem } = useExperience();
  const [category, setCategory] = useState<CafeLinaCategory>("all");

  const formatPrice = (price: number) =>
    isRTL ? `${price} ج.م` : `${price} EGP`;

  const items = useMemo(() => {
    if (category === "all") return CAFE_LINA_MENU;
    return CAFE_LINA_MENU.filter((item) => item.category === category);
  }, [category]);

  const getName = (item: (typeof CAFE_LINA_MENU)[0]) =>
    isRTL ? item.nameAr : item.nameEn;

  const getDesc = (item: (typeof CAFE_LINA_MENU)[0]) =>
    isRTL ? item.descAr : item.descEn;

  return (
    <ExperienceScene
      index={2}
      id="menu"
      height="tall"
      className="bg-[#f7f5f2] dark:bg-[#0d1117]"
    >
      <div className="flex min-h-[100dvh] flex-col pt-16 lg:pt-20">
        <header className="shrink-0 border-b border-slate-200/60 bg-white/90 px-5 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0d1117]/90">
          <div className="container flex items-center justify-between gap-4">
            <div className="text-start">
              <p className="text-[11px] font-medium text-slate-400">
                {t("menuGreeting")}
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("restaurantName")}
              </h2>
            </div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
              <FiShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold dark:bg-white dark:text-slate-900">
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          <div className="container mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors",
                  category === cat
                    ? "bg-purple-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700",
                )}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </header>

        <div className="container flex-1 overflow-y-auto px-5 py-5 pb-32 lg:pb-24">
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2 lg:max-w-4xl lg:gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-start shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <LoadImage
                    src={item.image}
                    alt={getName(item)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {getName(item)}
                  </h3>
                  <p className="line-clamp-1 text-[11px] text-slate-500">
                    {getDesc(item)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {formatPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        addItem(item.id, getName(item), item.price)
                      }
                      className="rounded-full bg-purple-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-purple-700"
                    >
                      {t("addToOrder")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <MenuAiBar className="shrink-0 lg:hidden" />

        {cartCount > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-[#0d1117]/95">
            <div className="container flex items-center justify-between gap-3 text-start">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("cartTitle")}
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(cartTotal)}
              </span>
            </div>
          </div>
        )}
      </div>
    </ExperienceScene>
  );
}
