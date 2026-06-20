"use client";

import type { ReactNode } from "react";
import { Fragment, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ProPlanPriceSelector, {
  type ProBillingChoice,
} from "@/components/Pricing/ProPlanPriceSelector";
import PricingMobilePlanCards from "@/components/Pricing/PricingMobilePlanCards";
import type { CellVal } from "@/components/Pricing/pricingComparisonTypes";
import { usePlans } from "@/hooks/usePlans";
import {
  buildPricingComparisonRows,
  CUSTOM_TABLE_FEATURE_KEYS,
} from "@/lib/pricingComparison";
import useSubscriptionUpgradeHref from "@/hooks/useSubscriptionUpgradeHref";
import { BsQrCode } from "react-icons/bs";
import {
  HiCheck,
  HiOutlineChat,
  HiX,
  HiLightningBolt,
  HiStar,
  HiShieldCheck,
} from "react-icons/hi";

const WHATSAPP_URL = "https://wa.me/201500800050";
const STATIC_PRO_MONTHLY_EGP = 499;
const STATIC_PRO_YEARLY_EGP = 5988;

const PAYMENT_METHODS = [
  {
    id: "visa",
    imageSrc: "/payment/VISA-logo-768x432.png",
    imageWidth: 160,
    imageHeight: 90,
  },
  {
    id: "vodafoneCash",
    imageSrc: "/payment/clipart1517832.png",
    imageWidth: 96,
    imageHeight: 96,
  },
  {
    id: "orangeMoney",
    imageSrc: "/payment/Orange_Money_29.webp",
    imageWidth: 140,
    imageHeight: 48,
  },
  {
    id: "etisalatCash",
    imageSrc: "/payment/etisalat-logo.svg",
    imageWidth: 120,
    imageHeight: 40,
  },
] as const;

const COL_PRO =
  "pricing-pro-col-glow relative overflow-hidden border-x border-violet-200/80 dark:border-violet-500/18 bg-gradient-to-b from-violet-500/[0.06] via-fuchsia-500/[0.04] to-violet-600/[0.05] dark:from-violet-500/12 dark:via-fuchsia-500/08 dark:to-violet-950/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] px-2 align-middle sm:px-5";

const COL_SEP = "border-r border-slate-200/85 dark:border-slate-700/80";

const STICKY_FEATURE =
  "sticky start-0 z-20 bg-inherit shadow-[4px_0_12px_-4px_rgba(15,23,42,0.08)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.35)]";

function yesNoIcon(
  value: boolean | undefined,
  tYes: string,
  tNo: string,
): ReactNode {
  if (value === undefined) {
    return (
      <span className="text-slate-400" aria-hidden>
        —
      </span>
    );
  }
  const label = value ? tYes : tNo;
  const wrap = (className: string, icon: ReactNode) => (
    <div className="flex justify-center">
      <span className={`inline-flex ${className}`}>
        {icon}
        <span className="sr-only">{label}</span>
      </span>
    </div>
  );
  return value
    ? wrap(
        "rounded-full bg-emerald-100/95 p-1 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:ring-emerald-500/25",
        <HiCheck
          className="pricing-check-pop h-3.5 w-3.5 text-emerald-700 sm:h-4 sm:w-4 dark:text-emerald-300"
          aria-hidden
        />,
      )
    : wrap(
        "rounded-full bg-rose-50/90 p-1 ring-1 ring-rose-100/80 dark:bg-rose-500/10 dark:ring-rose-500/20",
        <HiX
          className="h-3.5 w-3.5 text-rose-400 sm:h-4 sm:w-4 dark:text-rose-400/80"
          aria-hidden
        />,
      );
}

function renderCell(value: CellVal, tYes: string, tNo: string): ReactNode {
  if (typeof value === "boolean") {
    return yesNoIcon(value, tYes, tNo);
  }
  return (
    <span className="inline-block max-w-full hyphens-auto break-words text-center text-[11px] font-medium leading-snug text-slate-600 sm:text-sm dark:text-slate-400">
      {value}
    </span>
  );
}

type PlanCtaVariant = "free" | "pro" | "custom";

function PlanColumnCta({
  href,
  label,
  variant,
  external = false,
  className = "",
}: {
  href: string;
  label: string;
  variant: PlanCtaVariant;
  external?: boolean;
  className?: string;
}) {
  const base =
    "w-full rounded-xl py-2.5 text-[11px] font-bold transition active:scale-[0.98] sm:py-3 sm:text-xs";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 ${base} ${className}`}
      >
        <HiOutlineChat className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </a>
    );
  }

  if (variant === "pro") {
    return (
      <Link
        href={href}
        className={`flex items-center justify-center gap-1.5 bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/35 ring-1 ring-violet-400/25 hover:scale-[1.02] hover:shadow-violet-500/45 ${base} ${className}`}
      >
        <HiStar className="text-amber-200" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`block text-center border border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 ${base} ${className}`}
    >
      {label}
    </Link>
  );
}

function PlanColumnShell({
  children,
  align = "start",
  className = "",
}: {
  children: React.ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col ${
        align === "center" ? "items-center text-center" : "text-start"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function HeroMenuMockup() {
  return (
    <div
      className="pricing-reveal-hero relative mx-auto w-full max-w-[300px] lg:max-w-none"
      aria-hidden
    >
      <div className="pointer-events-none absolute -inset-6 rounded-4xl bg-linear-to-tr from-violet-200/35 via-slate-200/20 to-transparent blur-2xl dark:from-violet-900/15 dark:via-slate-800/20 dark:to-transparent" />
      <div className="animate-pricing-phone-float relative rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-2.5 shadow-xl shadow-slate-900/6 backdrop-blur-md will-change-transform dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/35 sm:p-3">
        <div className="overflow-hidden rounded-2xl bg-linear-to-b from-slate-100 to-slate-200/90 ring-1 ring-slate-900/4 dark:from-slate-800 dark:to-slate-900 dark:ring-white/8">
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="h-2 w-14 rounded-full bg-slate-300/80 dark:bg-slate-600 sm:w-16" />
            <div className="h-2 w-7 rounded-full bg-violet-400/45 dark:bg-violet-400/35 sm:w-8" />
          </div>
          <div className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="h-12 rounded-xl bg-white/90 shadow-sm dark:bg-slate-800/90 sm:h-14" />
            <div className="h-12 rounded-xl bg-white/75 shadow-sm dark:bg-slate-800/75 sm:h-14" />
            <div className="h-12 rounded-xl bg-white/55 shadow-sm dark:bg-slate-800/55 sm:h-14" />
          </div>
        </div>
      </div>
      <div className="animate-pricing-qr-float absolute -bottom-1 end-0 z-10 translate-x-[6%] rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-lg backdrop-blur-sm will-change-transform dark:border-slate-600/50 dark:bg-slate-900/80 dark:shadow-black/30 sm:-end-3 sm:translate-x-0 sm:p-4">
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className="rounded-lg bg-slate-800 p-1.5 text-white dark:bg-violet-700/90 sm:p-2">
            <BsQrCode className="h-11 w-11 sm:h-14 sm:w-14" />
          </div>
          <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-600 sm:w-12" />
        </div>
      </div>
    </div>
  );
}

export default function PricingComparisonPage() {
  const t = useTranslations("PricingPage");
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [proBillingChoice, setProBillingChoice] =
    useState<ProBillingChoice>("monthly");
  const { proPlan } = usePlans();
  const subscriptionUpgradeHref = useSubscriptionUpgradeHref();

  const proPriceMonthly = proPlan?.priceMonthly ?? STATIC_PRO_MONTHLY_EGP;
  const proPriceYearly = proPlan?.priceYearly ?? STATIC_PRO_YEARLY_EGP;
  const proFirstMonthlyPrice = proPlan?.firstMonthlyPrice;
  const proFirstYearlyPrice = proPlan?.firstYearlyPrice;

  const tYes = t("yes");
  const tNo = t("no");

  const rows = buildPricingComparisonRows({ t, tLanding });

  const desktopSections: Array<{ startId: string; title: string }> = [
    { startId: "rowBillingCycle", title: t("sectionCoreFeatures") },
    { startId: "rowAiMenuImport", title: t("sectionAiFeatures") },
    { startId: "rowTableOrderingQr", title: t("sectionLiveOrdering") },
    { startId: "rowDesign", title: t("sectionPremiumFeatures") },
    {
      startId: "customFeature.waiterRequest",
      title: t("sectionAdvancedBusiness"),
    },
  ];
  const desktopSectionByStartId = new Map<string, string>(
    desktopSections.map((section) => [section.startId, section.title]),
  );

  const freeHighlights = [
    t("freeHighlightForever"),
    t("freeHighlightNoCard"),
    t("freeHighlightFast"),
  ] as const;

  const cellBase = "px-2 py-3.5 text-center align-middle sm:px-4 sm:py-4";
  const cellProText = "text-slate-800 dark:text-slate-100";

  return (
    <div
      className="pricing-page relative min-h-0 overflow-x-clip overflow-y-visible bg-[#f8f9fc] pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] pt-14 dark:bg-[#070a0f] md:overflow-hidden md:pb-32 md:pt-24 lg:min-h-screen lg:py-32"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute top-1/3 end-0 h-64 w-64 rounded-full bg-fuchsia-200/15 blur-3xl dark:bg-fuchsia-900/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-10 grid items-center gap-8 md:mb-14 lg:mb-20 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-start">
            <div className="pricing-hero-text">
              <div className="pricing-hero-line mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-violet-800 dark:border-violet-500/20 dark:bg-violet-950/35 dark:text-violet-200 sm:text-xs">
                <HiLightningBolt className="shrink-0 opacity-80" aria-hidden />
                {t("eyebrow")}
              </div>
              <h1 className="pricing-hero-line text-[1.75rem] font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]">
                {t("title")}
              </h1>
              <p className="pricing-hero-line mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 sm:mt-5 sm:text-lg lg:mx-0">
                {t("subtitle")}
              </p>
              <div className="pricing-hero-line mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                {freeHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-purple-100/90 bg-white/80 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm shadow-purple-500/5 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="pricing-hero-line mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start md:hidden">
                <Link
                  href="/auth/register"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-500/25"
                >
                  {t("ctaRegister")}
                </Link>
                <Link
                  href={subscriptionUpgradeHref}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  {t("ctaUpgrade")}
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <HeroMenuMockup />
          </div>
        </div>

        {/* Plans — mobile cards / desktop table */}
        <section
          className="relative max-w-full"
          aria-labelledby="pricing-compare-heading"
        >
          <h2
            id="pricing-compare-heading"
            className="mb-5 text-center text-xl font-black text-slate-900 dark:text-white md:mb-8 md:text-2xl lg:sr-only"
          >
            {t("compareTitle")}
          </h2>

          <PricingMobilePlanCards
            rows={rows}
            proBillingChoice={proBillingChoice}
            onBillingChange={setProBillingChoice}
            proPriceMonthly={proPriceMonthly}
            proPriceYearly={proPriceYearly}
            proFirstMonthlyPrice={proFirstMonthlyPrice}
            proFirstYearlyPrice={proFirstYearlyPrice}
            isRTL={isRTL}
            subscriptionUpgradeHref={subscriptionUpgradeHref}
            freeHighlights={freeHighlights}
          />

          <div
            className="pointer-events-none absolute -inset-px hidden rounded-3xl bg-linear-to-br from-violet-400/6 via-transparent to-fuchsia-400/5 dark:from-violet-500/10 dark:to-fuchsia-500/06 md:block"
            aria-hidden
          />

          <div className="hidden md:block">
            <div className="pricing-compare-table-wrap relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80">
              <table className="w-full table-fixed border-collapse text-[11px] sm:text-sm">
                <colgroup>
                  <col style={{ width: "27%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "23%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200/90 dark:border-slate-700/75">
                    <th
                      className={`${cellBase} py-8 text-start align-bottom sm:px-5 sm:py-10 ${COL_SEP} bg-slate-50/50 dark:bg-slate-900/50`}
                    >
                      <h3 className="break-words font-bold text-slate-900 dark:text-white sm:text-lg lg:text-xl">
                        {t("compareTitle")}
                      </h3>
                    </th>
                    <th
                      className={`${cellBase} align-top py-6 sm:px-4 sm:py-8 ${COL_SEP} bg-white/60 dark:bg-slate-900/30`}
                    >
                      <PlanColumnShell>
                        <div className="mb-1.5 break-words font-semibold text-slate-500 dark:text-slate-400 sm:mb-2 sm:text-base">
                          {tLanding("planFree")}
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                          {tProfile("freePrice")}
                        </div>
                      </PlanColumnShell>
                    </th>
                    <th
                      className={`${COL_PRO} ${cellBase} z-[1] align-top py-7 sm:px-4 sm:py-9`}
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-violet-400/18 via-fuchsia-400/10 to-transparent blur-xl dark:from-violet-500/12 dark:via-fuchsia-500/08" />
                      <PlanColumnShell
                        align="center"
                        className="relative w-full"
                      >
                        <div className="flex w-full max-w-[12rem] flex-col items-center">
                          <span className="mb-2 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-white shadow-sm shadow-violet-500/20 sm:mb-2.5 sm:px-3 sm:text-[10px] sm:shadow-violet-500/25">
                            {tLanding("popular")}
                          </span>
                          <div className="mb-1.5 break-words text-sm font-semibold text-violet-700 dark:text-violet-300 sm:text-base">
                            {t("planProName")}
                          </div>
                          <div className="relative w-full">
                            <div
                              className="absolute -inset-x-6 -top-2 bottom-0 rounded-full bg-gradient-to-t from-transparent via-violet-300/20 to-fuchsia-300/25 opacity-80 blur-xl dark:via-violet-500/12 dark:to-fuchsia-500/10"
                              aria-hidden
                            />
                            <ProPlanPriceSelector
                              billingChoice={proBillingChoice}
                              onBillingChange={setProBillingChoice}
                              priceMonthly={proPriceMonthly}
                              priceYearly={proPriceYearly}
                              firstMonthlyPrice={proFirstMonthlyPrice}
                              firstYearlyPrice={proFirstYearlyPrice}
                              isRTL={isRTL}
                              compact
                              className="relative"
                            />
                          </div>
                        </div>
                      </PlanColumnShell>
                    </th>
                    <th
                      className={`${cellBase} align-top bg-white/50 py-6 dark:bg-slate-900/25 sm:px-4 sm:py-8`}
                    >
                      <PlanColumnShell>
                        <div className="mb-1.5 break-words font-semibold text-slate-900 dark:text-white sm:mb-2 sm:text-base">
                          {tLanding("planCustom")}
                        </div>
                        <div className="break-words text-base font-bold text-slate-500 dark:text-slate-400 sm:text-lg">
                          {tLanding("customPrice")}
                        </div>
                      </PlanColumnShell>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const sectionTitle = desktopSectionByStartId.get(row.id);
                    const alt = idx % 2 === 1;
                    const rowTintFree = alt
                      ? "bg-slate-50/80 dark:bg-slate-800/28"
                      : "bg-white/55 dark:bg-slate-900/18";
                    const rowTintCustom = alt
                      ? "bg-slate-50/65 dark:bg-slate-800/22"
                      : "bg-white/45 dark:bg-slate-900/12";
                    const proStripe =
                      "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-gradient-to-b before:from-transparent before:via-violet-400/[0.04] before:to-fuchsia-400/[0.05] dark:before:via-violet-400/08 dark:before:to-fuchsia-500/08";
                    const proStripeAlt =
                      "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-slate-900/[0.025] dark:before:bg-black/12";

                    return (
                      <Fragment key={row.id}>
                        {sectionTitle ? (
                          <tr className="border-b border-slate-200/70 dark:border-slate-700/70">
                            <th
                              colSpan={4}
                              className="bg-slate-100/75 px-4 py-2.5 text-start text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800/45 dark:text-slate-300 sm:px-6 sm:text-[11px]"
                            >
                              {sectionTitle}
                            </th>
                          </tr>
                        ) : null}
                        <tr className="pricing-row-item border-b border-slate-100/90 last:border-b-0 dark:border-slate-800/55">
                          <th
                            className={`${cellBase} ${STICKY_FEATURE} hyphens-auto break-words text-start text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-300 sm:px-5 sm:text-sm ${COL_SEP} ${rowTintFree}`}
                          >
                            {row.label}
                          </th>
                          <td
                            className={`${cellBase} ${COL_SEP} ${rowTintFree}`}
                          >
                            {renderCell(row.free, tYes, tNo)}
                          </td>
                          <td
                            className={`${COL_PRO} ${cellBase} z-[1] font-semibold sm:px-5 [&_span]:text-slate-800 dark:[&_span]:text-slate-200 ${alt ? proStripeAlt : proStripe} ${cellProText}`}
                          >
                            {renderCell(row.pro, tYes, tNo)}
                          </td>
                          <td className={`${cellBase} ${rowTintCustom}`}>
                            {renderCell(row.custom, tYes, tNo)}
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200/90 dark:border-slate-700/75">
                    <th
                      className={`${cellBase} py-6 sm:px-5 sm:py-7 ${COL_SEP} bg-slate-50/50 dark:bg-slate-900/50`}
                      aria-hidden
                    />
                    <td
                      className={`${cellBase} py-6 sm:px-4 sm:py-7 ${COL_SEP} bg-white/60 dark:bg-slate-900/30`}
                    >
                      <PlanColumnCta
                        href="/auth/register"
                        label={t("ctaRegister")}
                        variant="free"
                      />
                    </td>
                    <td
                      className={`${COL_PRO} ${cellBase} z-[1] py-6 sm:px-4 sm:py-7`}
                    >
                      <PlanColumnCta
                        href={subscriptionUpgradeHref}
                        label={t("ctaUpgrade")}
                        variant="pro"
                        className="mx-auto w-full max-w-[12rem]"
                      />
                    </td>
                    <td
                      className={`${cellBase} bg-white/50 py-6 dark:bg-slate-900/25 sm:px-4 sm:py-7`}
                    >
                      <PlanColumnCta
                        href={WHATSAPP_URL}
                        label={t("ctaContact")}
                        variant="custom"
                        external
                      />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* Payment methods */}
        <section
          className="mt-10 sm:mt-14 lg:mt-20"
          aria-labelledby="pricing-payment-heading"
        >
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 sm:rounded-3xl sm:p-7">
            <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
              <div className="flex items-center gap-2">
                <HiShieldCheck
                  className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                <h2
                  id="pricing-payment-heading"
                  className="text-base font-bold text-slate-900 dark:text-white sm:text-lg"
                >
                  {t("paymentMethodsTitle")}
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t("paymentMethodsDescription")}
              </p>
              <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const label = t(`paymentMethod.${method.id}`);
                  return (
                    <li key={method.id}>
                      <div className="flex h-14 min-w-28 items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 py-2 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/80 sm:h-16 sm:min-w-32 sm:px-5">
                        {method.imageSrc.endsWith(".svg") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={method.imageSrc}
                            alt={label}
                            className="h-8 max-w-28 object-contain sm:h-9 sm:max-w-32"
                          />
                        ) : (
                          <Image
                            src={method.imageSrc}
                            alt={label}
                            width={method.imageWidth}
                            height={method.imageHeight}
                            className="h-8 w-auto max-w-28 object-contain sm:h-9 sm:max-w-32"
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t("paymentMethodsSecureNote")}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="pricing-mobile-sticky-cta pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#070a0f]/95 md:hidden">
        <Link
          href="/auth/register"
          className="pointer-events-auto flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 text-base font-bold text-white shadow-lg shadow-violet-500/25"
        >
          {t("mobileStickyCta")}
        </Link>
      </div>
    </div>
  );
}
