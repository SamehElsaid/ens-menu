"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { translatePlanFeaturesWithMenuLimit } from "@/lib/planFeatureI18n";
import { BsQrCode } from "react-icons/bs";
import {
  HiCheck,
  HiOutlineChat,
  HiX,
  HiLightningBolt,
  HiStar,
  HiChevronDown,
  HiInformationCircle,
} from "react-icons/hi";

const WHATSAPP_URL = "https://wa.me/201500800050";
const STATIC_PRO_YEARLY_USD = 100;
const FAQ_IDS = ["faq1", "faq2", "faq3"] as const;

const STATIC_FREE_PLAN = {
  maxMenus: 1,
  maxProductsPerMenu: 50,
  allowCustomDomain: false,
  hasAds: false,
} as const;

const STATIC_PRO_PLAN = {
  maxMenus: 4,
  maxProductsPerMenu: 200,
  allowCustomDomain: true,
  hasAds: true,
} as const;

const CUSTOM_TABLE_FEATURE_KEYS = [
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
] as const;

const CUSTOM_CARD_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;

type CellVal = boolean | string | number;
type ComparisonRow = {
  label: string;
  free: CellVal;
  pro: CellVal;
  custom: CellVal;
};

const COL_PRO =
  "relative overflow-hidden border-x border-violet-200/80 dark:border-violet-500/18 bg-gradient-to-b from-violet-500/[0.05] via-fuchsia-500/[0.03] to-violet-600/[0.045] dark:from-violet-500/10 dark:via-fuchsia-500/06 dark:to-violet-950/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] px-2 align-middle sm:px-5";

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
        "rounded-full bg-emerald-100/90 p-1 dark:bg-emerald-500/15",
        <HiCheck
          className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4 dark:text-emerald-400"
          aria-hidden
        />,
      )
    : wrap(
        "rounded-full bg-red-100 p-1 dark:bg-red-500/20",
        <HiX
          className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4 dark:text-red-400"
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

function PricingFaqItem({
  id,
  isOpen,
  onToggle,
  isRTL,
}: {
  id: (typeof FAQ_IDS)[number];
  isOpen: boolean;
  onToggle: () => void;
  isRTL: boolean;
}) {
  const t = useTranslations("PricingPage");

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors sm:rounded-2xl ${
        isOpen
          ? "border-violet-200/90 bg-violet-50/40 dark:border-violet-500/25 dark:bg-violet-500/08"
          : "border-slate-200/90 bg-white hover:border-violet-200/70 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-violet-500/20"
      }`}
    >
      <button
        type="button"
        id={`pricing-faq-${id}`}
        aria-expanded={isOpen}
        aria-controls={`pricing-faq-panel-${id}`}
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-start sm:px-6 sm:py-5 ${
          isRTL ? "flex-row-reverse text-end" : ""
        }`}
      >
        <span
          className={`flex-1 text-base font-bold sm:text-lg ${
            isOpen
              ? "text-violet-700 dark:text-violet-300"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {t(`${id}q`)}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
            isOpen
              ? "rotate-180 bg-violet-600 text-white dark:bg-violet-500"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
          aria-hidden
        >
          <HiChevronDown className="h-5 w-5" />
        </span>
      </button>
      <div
        id={`pricing-faq-panel-${id}`}
        role="region"
        aria-labelledby={`pricing-faq-${id}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-xs leading-relaxed text-slate-600 sm:px-6 sm:pb-5 sm:text-sm dark:text-slate-400">
            {t(`${id}a`)}
          </p>
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const freeFeatures = useMemo(
    () =>
      translatePlanFeaturesWithMenuLimit(
        [t("staticFreeFeature1"), t("staticFreeFeature2")],
        STATIC_FREE_PLAN.maxMenus,
        tProfile,
      ),
    [t, tProfile],
  );

  const proFeatures = useMemo(() => {
    const base = translatePlanFeaturesWithMenuLimit(
      [
        t("staticProFeature1"),
        t("staticProFeature2"),
        t("staticProFeature3"),
      ],
      STATIC_PRO_PLAN.maxMenus,
      tProfile,
    );
    return [
      ...base,
      tLanding("proExtraFeatures.staffSystem"),
      tLanding("proExtraFeatures.tablesSystem"),
      t("proStaffMobileAppBullet"),
    ];
  }, [tProfile, tLanding, t]);

  const tYes = t("yes");
  const tNo = t("no");

  const rows: ComparisonRow[] = [
    {
      label: t("rowBillingCycle"),
      free: t("billingFree"),
      pro: t("billingProShort"),
      custom: t("billingCustom"),
    },
    {
      label: t("rowMenus"),
      free: STATIC_FREE_PLAN.maxMenus,
      pro: STATIC_PRO_PLAN.maxMenus,
      custom: t("cellUnlimited"),
    },
    {
      label: t("rowProducts"),
      free: STATIC_FREE_PLAN.maxProductsPerMenu,
      pro: STATIC_PRO_PLAN.maxProductsPerMenu,
      custom: t("cellNegotiable"),
    },
    {
      label: t("rowGuestMenu"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      label: t("rowTableOrderingQr"),
      free: false,
      pro: true,
      custom: true,
    },
    {
      label: t("rowDashboard"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      label: t("rowPlatformUpdates"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      label: t("rowHostingSecurity"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      label: t("rowAds"),
      free: STATIC_FREE_PLAN.hasAds,
      pro: STATIC_PRO_PLAN.hasAds,
      custom: true,
    },
    {
      label: t("rowStaffTables"),
      free: false,
      pro: true,
      custom: true,
    },
    {
      label: t("rowStaffMobileApp"),
      free: false,
      pro: true,
      custom: true,
    },
    {
      label: t("rowDesign"),
      free: t("designFree"),
      pro: t("designPro"),
      custom: t("designCustom"),
    },
    {
      label: t("rowSupport"),
      free: t("supportFree"),
      pro: t("supportPro"),
      custom: t("supportCustom"),
    },
    ...CUSTOM_TABLE_FEATURE_KEYS.map((key) => ({
      label: tLanding(`customFeatures.${key}`),
      free: false,
      pro: false,
      custom: true,
    })),
  ];

  const cellBase = "px-2 py-3.5 text-center align-middle sm:px-4 sm:py-4";
  const cellProText = "text-slate-800 dark:text-slate-100";

  const planCards = [
    {
      id: "free",
      title: tLanding("planFree"),
      desc: t("staticFreeDescription"),
      price: `0${tLanding("currencyUsd")}`,
      priceNote: tLanding("perYear"),
      features: freeFeatures,
      premium: false,
      cta: {
        href: "/auth/register" as const,
        label: t("ctaRegister"),
        external: false,
      },
    },
    {
      id: "pro",
      title: tLanding("planPro"),
      desc: t("staticProDescription"),
      price: `${STATIC_PRO_YEARLY_USD}${tLanding("currencyUsd")}`,
      priceNote: tLanding("perYear"),
      features: proFeatures,
      premium: true,
      cta: {
        href: "/auth/register" as const,
        label: t("ctaUpgrade"),
        external: false,
      },
    },
    {
      id: "custom",
      title: tLanding("planCustom"),
      desc: tLanding("customDescription"),
      price: tLanding("customPrice"),
      priceNote: null,
      features: CUSTOM_CARD_FEATURE_KEYS.map((k) =>
        tLanding(`customFeatures.${k}`),
      ),
      premium: false,
      cta: { href: WHATSAPP_URL, label: t("ctaContact"), external: true },
    },
  ];

  const notes = [
    { key: "noteProAnnual", icon: HiStar },
    { key: "noteLimits", icon: HiInformationCircle },
    { key: "noteCustom", icon: HiOutlineChat },
  ] as const;

  return (
    <div
      className="pricing-page relative overflow-hidden bg-[#f8f9fc] py-14 dark:bg-[#070a0f] sm:py-20 lg:py-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute top-1/3 end-0 h-64 w-64 rounded-full bg-fuchsia-200/15 blur-3xl dark:bg-fuchsia-900/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className=" mb-12 grid items-center gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-14">
          <div className=" text-center lg:text-start">
            <div className="pricing-hero-text">
              <div className="pricing-hero-line mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-800 dark:border-violet-500/20 dark:bg-violet-950/35 dark:text-violet-200 sm:text-xs">
                <HiLightningBolt className="shrink-0 opacity-80" aria-hidden />
                {t("eyebrow")}
              </div>
              <h1 className="pricing-hero-line text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {t("title")}
              </h1>
              <p className="pricing-hero-line mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:mt-5 sm:text-lg lg:mx-0">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <div className=" hidden sm:block">
            <HeroMenuMockup />
          </div>
        </div>

        {/* Comparison table */}
        <section
          className="relative max-w-full"
          aria-labelledby="pricing-compare-heading"
        >
          <h2 id="pricing-compare-heading" className="sr-only">
            {t("compareTitle")}
          </h2>

          <div
            className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-violet-400/6 via-transparent to-fuchsia-400/5 dark:from-violet-500/10 dark:to-fuchsia-500/06"
            aria-hidden
          />

          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="relative min-w-[min(100%,36rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-900/4 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/25 sm:min-w-0 sm:rounded-3xl">
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
                      className={`${cellBase} py-8 align-bottom sm:py-10 ${COL_SEP} bg-white/60 dark:bg-slate-900/30`}
                    >
                      <div className="mb-1.5 break-words font-semibold text-slate-500 dark:text-slate-400 sm:mb-2 sm:text-base">
                        {tLanding("planFree")}
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                        0$
                      </div>
                    </th>
                    <th
                      className={`${COL_PRO} ${cellBase} z-[1] py-9 text-center align-bottom sm:py-11`}
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-violet-400/18 via-fuchsia-400/10 to-transparent blur-xl dark:from-violet-500/12 dark:via-fuchsia-500/08" />
                      <div className="relative flex flex-col items-center">
                        <span className="mb-2 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-white shadow-sm shadow-violet-500/20 sm:mb-2.5 sm:px-3 sm:text-[10px] sm:shadow-violet-500/25">
                          {tLanding("popular")}
                        </span>
                        <div className="mb-1.5 break-words text-sm font-semibold text-violet-700 dark:text-violet-300 sm:text-base">
                          {tLanding("planPro")}
                        </div>
                        <div className="relative inline-block">
                          <div
                            className="absolute -inset-x-6 -top-2 bottom-0 rounded-full bg-gradient-to-t from-transparent via-violet-300/20 to-fuchsia-300/25 opacity-80 blur-xl dark:via-violet-500/12 dark:to-fuchsia-500/10"
                            aria-hidden
                          />
                          <div
                            className={`relative text-2xl font-black tracking-tight sm:text-4xl ${cellProText}`}
                          >
                            {STATIC_PRO_YEARLY_USD}$
                            <span className="ms-0.5 align-top text-[9px] font-medium text-violet-800/70 dark:text-violet-200/75 sm:text-xs">
                              /{tLanding("perYear")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </th>
                    <th
                      className={`${cellBase} bg-white/50 py-8 align-bottom dark:bg-slate-900/25 sm:py-10`}
                    >
                      <div className="mb-1.5 break-words font-semibold text-slate-900 dark:text-white sm:mb-2 sm:text-base">
                        {tLanding("planCustom")}
                      </div>
                      <div className="break-words text-base font-bold text-slate-500 dark:text-slate-400 sm:text-lg">
                        {tLanding("customPrice")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
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
                      <tr
                        key={row.label}
                        className="pricing-row-item border-b border-slate-100/90 last:border-b-0 dark:border-slate-800/55"
                      >
                        <th
                          className={`${cellBase} hyphens-auto break-words text-start text-[11px] font-semibold leading-snug text-slate-700 dark:text-slate-300 sm:px-5 sm:text-sm ${COL_SEP} ${rowTintFree}`}
                        >
                          {row.label}
                        </th>
                        <td className={`${cellBase} ${COL_SEP} ${rowTintFree}`}>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="relative z-2 mx-auto mt-14 max-w-5xl sm:mt-20">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md dark:rounded-3xl dark:border-slate-700/80 dark:bg-linear-to-b dark:from-slate-900 dark:to-slate-950 dark:p-8 dark:shadow-xl dark:shadow-black/30 dark:ring-1 dark:ring-violet-500/15 sm:p-9">
            <p className="mb-5 text-center text-sm font-medium leading-relaxed text-slate-600 sm:mb-7 dark:text-slate-400">
              {t("ctaStripIntro")}
            </p>
            <div className=" flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-4">
              <div className=" order-1 sm:order-2 sm:flex-1 sm:max-w-xs">
                <Link
                  href="/auth/register"
                  className="flex h-full min-h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:scale-[1.02] hover:shadow-violet-500/35 active:scale-[0.98]"
                >
                  <HiStar className="text-amber-200" aria-hidden />
                  {t("ctaUpgrade")}
                </Link>
              </div>
              <div className=" order-2 sm:order-1 sm:flex-1 sm:max-w-xs">
                <Link
                  href="/auth/register"
                  className="flex h-full min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/14"
                >
                  {t("ctaRegister")}
                </Link>
              </div>
              <div className=" order-3 sm:flex-1 sm:max-w-xs">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
                >
                  <HiOutlineChat className="h-5 w-5 shrink-0" aria-hidden />
                  {t("ctaContact")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Plan cards */}
        <section
          className="mt-16 sm:mt-20 lg:mt-24"
          aria-labelledby="pricing-plans-heading"
        >
          <h2
            id="pricing-plans-heading"
            className="mb-8 text-center text-2xl font-black text-slate-900 dark:text-white sm:text-3xl"
          >
            {tLanding("title")}
          </h2>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {planCards.map((card) => (
              <article
                key={card.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all sm:rounded-3xl sm:p-8 ${
                  card.premium
                    ? "border-violet-200/80 bg-violet-50/50 shadow-lg shadow-violet-500/10 hover:-translate-y-1 dark:border-violet-500/20 dark:bg-violet-500/[0.07] lg:scale-[1.02]"
                    : "border-slate-200/80 bg-white shadow-sm hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                {card.premium && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                    {tLanding("popular")}
                  </span>
                )}
                <h3
                  className={`text-lg font-black sm:text-xl ${
                    card.premium
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-slate-900 dark:text-white"
                  } ${card.premium ? "mt-2" : ""}`}
                >
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {card.desc}
                </p>
                <div className="mt-5 border-b border-slate-200/80 pb-5 dark:border-slate-700/60">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {card.price}
                  </span>
                  {card.priceNote && (
                    <span className="ms-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.priceNote}
                    </span>
                  )}
                </div>
                <ul className="mt-5 flex-1 space-y-2.5 sm:space-y-3">
                  {card.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      <HiCheck
                        className={`mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
                          card.premium
                            ? "text-violet-500 dark:text-violet-400"
                            : "text-emerald-500 dark:text-emerald-400"
                        }`}
                        aria-hidden
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 sm:mt-8">
                  {card.cta.external ? (
                    <a
                      href={card.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500"
                    >
                      <HiOutlineChat className="h-5 w-5" aria-hidden />
                      {card.cta.label}
                    </a>
                  ) : (
                    <Link
                      href={card.cta.href}
                      className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold transition ${
                        card.premium
                          ? "bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/30"
                          : "border border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/14"
                      }`}
                    >
                      {card.cta.label}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          className="mx-auto mt-16 max-w-3xl sm:mt-20"
          aria-labelledby="pricing-faq-heading"
        >
          <h2
            id="pricing-faq-heading"
            className="mb-6 text-center text-2xl font-black text-slate-900 dark:text-white sm:mb-8 sm:text-3xl"
          >
            {t("faqTitle")}
          </h2>
          <div className="space-y-3">
            {FAQ_IDS.map((id, idx) => (
              <PricingFaqItem
                key={id}
                id={id}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                isRTL={isRTL}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
