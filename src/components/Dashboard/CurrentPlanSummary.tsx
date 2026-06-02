"use client";



import { useLocale, useTranslations } from "next-intl";

import { HiOutlineGift, HiOutlineSparkles } from "react-icons/hi";

import type { Subscription } from "@/types/Subscription";



type CurrentPlanSummaryProps = {

  subscriptionInfo: Subscription | null;

  loading: boolean;

  currentPlanName: string;

  className?: string;

};



export default function CurrentPlanSummary({

  subscriptionInfo,

  loading,

  currentPlanName,

  className = "",

}: CurrentPlanSummaryProps) {

  const locale = useLocale();

  const isRTL = locale === "ar";

  const t = useTranslations("personalProfile");



  const formatPlanDate = (d: string | null | undefined) => {

    if (d == null || d === "") return "—";

    try {

      return new Date(d).toLocaleDateString(locale, {

        year: "numeric",

        month: "short",

        day: "numeric",

      });

    } catch {

      return "—";

    }

  };



  const displayPlanName = currentPlanName

    ? (() => {

        const n = String(currentPlanName).toLowerCase();

        if (n === "free") return t("planFree");

        if (n === "pro") return t("planPro");

        return currentPlanName;

      })()

    : t("planFree");



  const isPro = String(currentPlanName).toLowerCase() === "pro";



  if (loading) {

    return (

      <div

        className={`rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-6 animate-pulse space-y-4 ${className}`}

        aria-hidden

      >

        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />

        <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />

        <div className="grid grid-cols-2 gap-3">

          {[1, 2, 3, 4].map((i) => (

            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />

          ))}

        </div>

      </div>

    );

  }



  return (

    <div

      className={`relative overflow-hidden rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/8 via-white to-slate-50 dark:from-primary/15 dark:via-slate-900 dark:to-slate-950 p-5 md:p-6 shadow-sm ${isRTL ? "text-right" : "text-left"} ${className}`}

    >

      <div

        className={`absolute top-0 ${isRTL ? "left-0 rounded-br-[80px]" : "right-0 rounded-bl-[80px]"} h-24 w-24 bg-primary/10 dark:bg-primary/15 pointer-events-none`}

        aria-hidden

      />



      <p className="relative text-xs font-semibold uppercase tracking-wider text-primary/80 dark:text-primary mb-3">

        {t("currentPlanSummary")}

      </p>



      <div

        className={`relative flex flex-wrap items-center gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}

      >

        <div

          className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}

        >

          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">

            {isPro ? (

              <HiOutlineSparkles className="h-5 w-5" />

            ) : (

              <HiOutlineGift className="h-5 w-5" />

            )}

          </span>

          <span className="text-xl font-bold text-slate-900 dark:text-slate-50">

            {displayPlanName}

          </span>

        </div>

        {subscriptionInfo?.status && (

          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">

            {t("status")}: {String(subscriptionInfo.status)}

          </span>

        )}

      </div>



      <dl className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">

        {[

          {

            label: t("billingCycle"),

            value: (() => {

              const c = String(subscriptionInfo?.billingCycle ?? "").toLowerCase();

              if (c === "yearly" || c === "annual") return t("yearly");

              if (c === "monthly") return t("monthly");

              if (c === "free" || !c) return t("freePrice");

              return subscriptionInfo?.billingCycle ?? "—";

            })(),

          },

          {

            label: t("renewalDate"),

            value: formatPlanDate(subscriptionInfo?.endDate as string | undefined),

          },

          {

            label: t("maxMenusLabel"),

            value: subscriptionInfo?.maxMenus ?? "—",

          },

          {

            label: t("maxProductsLabel"),

            value: subscriptionInfo?.maxProductsPerMenu ?? "—",

          },

        ].map((item) => (

          <div

            key={item.label}

            className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 px-3 py-2.5"

          >

            <dt className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">

              {item.label}

            </dt>

            <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">

              {item.value}

            </dd>

          </div>

        ))}

      </dl>

    </div>

  );

}

