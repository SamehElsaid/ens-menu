"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { axiosGet } from "@/shared/axiosCall";
import { FaSpinner } from "react-icons/fa";
import { HiCheck, HiOutlineChat } from "react-icons/hi";
import { Link } from "@/i18n/navigation";

export type ApiPlan = {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxMenus: number;
  maxProductsPerMenu: number;
  allowCustomDomain: boolean;
  hasAds: boolean;
  features: string[];
};

type PlansResponse = {
  success?: boolean;
  plans?: ApiPlan[];
};

const CUSTOM_PLAN_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;

const WHATSAPP_URL = "https://wa.me/971586551491";

export default function PricingSection() {
  const t = useTranslations("Landing.pricing");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async (): Promise<ApiPlan[]> => {
    const result = await axiosGet<PlansResponse>(
      "/public/plans",
      locale,
      undefined,
      undefined,
      true,
    );
    if (result.status && result.data?.plans?.length) {
      return result.data.plans.filter(
        (p) =>
          p.name?.toLowerCase() === "free" || p.name?.toLowerCase() === "pro",
      );
    }
    return [];
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((data) => {
        if (!cancelled) {
          setPlans(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPlans]);

  const freePlan = plans.find((p) => p.name?.toLowerCase() === "free");
  const proPlan = plans.find((p) => p.name?.toLowerCase() === "pro");

  const customFeatures = CUSTOM_PLAN_FEATURE_KEYS.map((key) =>
    t(`customFeatures.${key}`),
  );

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-[#0d1117]">
      <div className="container mx-auto px-6">
        <div
          className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-6 ${
            isRTL ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="flex gap-2">
            <div className="w-12 h-1.5 rounded-full bg-purple-600" />
            <div className="w-4 h-1.5 rounded-full bg-purple-200 dark:bg-purple-800" />
            <div className="w-4 h-1.5 rounded-full bg-purple-200 dark:bg-purple-800" />
          </div>
          <div
            className={`max-w-2xl ${isRTL ? "text-right md:text-right" : "text-left md:text-left"}`}
          >
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              {t("title")}
            </h2>
            <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-[35px] bg-white dark:bg-[#15203c] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-slate-900/50 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("planFree")}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-purple-600" />
              </div>
            ) : freePlan ? (
              <>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {freePlan.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    0
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
                    {t("currency")} {t("perYear")}
                  </span>
                </div>
                <ul className="space-y-3 flex-1">
                  {(freePlan.features || []).slice(0, 5).map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm"
                    >
                      <HiCheck className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${locale}/auth/register`}
                  className="mt-8 w-full py-4 rounded-full font-bold text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {t("getStarted")}
                </Link>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
                {t("noPlans")}
              </p>
            )}
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-[35px] bg-white dark:bg-[#15203c] border-2 border-purple-500 dark:border-purple-500 shadow-xl shadow-purple-100/50 dark:shadow-purple-900/30 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
              {t("popular")}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 mt-2">
              {t("planPro")}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-purple-600" />
              </div>
            ) : proPlan ? (
              <>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {proPlan.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {proPlan.priceYearly ?? proPlan.priceMonthly * 12}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
                    {t("currency")} {t("perYear")}
                  </span>
                </div>
                <ul className="space-y-3 flex-1">
                  {(proPlan.features || []).slice(0, 5).map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm"
                    >
                      <HiCheck className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${locale}/auth/register`}
                  className="mt-8 w-full py-4 rounded-full font-bold text-center bg-purple-600 text-white hover:bg-purple-700 transition-all"
                >
                  {t("getStarted")}
                </Link>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4">
                {t("noPlans")}
              </p>
            )}
          </div>

          {/* Custom Plan - Static */}
          <div className="p-8 rounded-[35px] bg-white dark:bg-[#15203c] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-slate-900/50 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("planCustom")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {t("customDescription")}
            </p>
            <div className="mb-6">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {t("customPrice")}
              </span>
            </div>
            <ul className="space-y-3 flex-1">
              {customFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm"
                >
                  <HiCheck className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-4 rounded-full font-bold text-center bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <HiOutlineChat className="w-5 h-5" />
              {t("contactWhatsApp")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
