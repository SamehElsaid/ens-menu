"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { translatePlanFeaturesWithMenuLimit } from "@/lib/planFeatureI18n";
import { BsQrCode } from "react-icons/bs";
import { HiCheck, HiOutlineChat, HiX, HiLightningBolt, HiStar } from "react-icons/hi";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const WHATSAPP_URL = "https://wa.me/971586551491";
const STATIC_PRO_YEARLY_USD = 100;

const STATIC_FREE_PLAN = {
  maxMenus: 1,
  maxProductsPerMenu: 50,
  allowCustomDomain: false,
  hasAds: false,
  features: ["50 منتج", "بدون تعديلات"],
} as const;

const STATIC_PRO_PLAN = {
  maxMenus: 4,
  maxProductsPerMenu: 200,
  allowCustomDomain: true,
  hasAds: true,
  features: [
    "200 منتج لكل قائمة",
    "شامل التعديلات",
    "تحكم في الإعلانات",
  ],
} as const;

type CellVal = boolean | string | number;

/** Softer violet column — readable in light & dark without heavy saturation. */
const COL_PRO =
  "relative overflow-hidden border-x border-violet-200/80 dark:border-violet-500/18 bg-gradient-to-b from-violet-500/[0.05] via-fuchsia-500/[0.03] to-violet-600/[0.045] dark:from-violet-500/10 dark:via-fuchsia-500/06 dark:to-violet-950/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] px-2 align-middle [transform:scaleY(1.01)] origin-top sm:px-5";

const COL_SEP = "border-r border-slate-200/85 dark:border-slate-700/80";

function yesNoIcon(
  value: boolean | undefined,
  tYes: string,
  tNo: string,
): ReactNode {
  if (value === undefined) {
    return <span className="text-slate-400">—</span>;
  }
  return value ? (
    <div className="flex justify-center">
      <div className="rounded-full bg-emerald-100/90 p-1 dark:bg-emerald-500/15">
        <HiCheck className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4 dark:text-emerald-400" aria-hidden />
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <div className="rounded-full bg-red-100 p-1 dark:bg-red-500/20">
        <HiX className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4 dark:text-red-400" aria-hidden />
      </div>
    </div>
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

function HeroMenuMockup({ reduceMotion }: { reduceMotion: boolean }) {
  const phoneFloat = reduceMotion
    ? undefined
    : {
        animate: { y: [0, -9, 0], rotate: [-4, -2.8, -4] },
        transition: {
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const qrFloat = reduceMotion
    ? undefined
    : {
        animate: { y: [0, 7, 0], rotate: [7, 5.5, 7] },
        transition: {
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: 0.35,
        },
      };

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px] lg:max-w-none"
      aria-hidden
      initial={reduceMotion ? undefined : { opacity: 0, y: 28, scale: 0.96 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.12, ease: EASE_OUT }}
    >
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-violet-200/35 via-slate-200/20 to-transparent blur-2xl dark:from-violet-900/15 dark:via-slate-800/20 dark:to-transparent" />
      <motion.div
        className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-2.5 shadow-xl shadow-slate-900/6 backdrop-blur-md will-change-transform dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/35 sm:p-3"
        animate={phoneFloat?.animate}
        transition={phoneFloat?.transition}
      >
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/90 ring-1 ring-slate-900/[0.04] dark:from-slate-800 dark:to-slate-900 dark:ring-white/8">
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
      </motion.div>
      <motion.div
        className="absolute -bottom-1 end-0 z-10 translate-x-[6%] rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-lg backdrop-blur-sm will-change-transform dark:border-slate-600/50 dark:bg-slate-900/80 dark:shadow-black/30 sm:-end-3 sm:translate-x-0 sm:p-4"
        animate={qrFloat?.animate}
        transition={qrFloat?.transition}
      >
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className="rounded-lg bg-slate-800 p-1.5 text-white dark:bg-violet-700/90 sm:p-2">
            <BsQrCode className="h-11 w-11 sm:h-14 sm:w-14" />
          </div>
          <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-600 sm:w-12" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PricingComparisonPage() {
  const t = useTranslations("PricingPage");
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const reduceMotion = useReducedMotion() === true;

  const freeFeatures = useMemo(
    () =>
      translatePlanFeaturesWithMenuLimit(
        [...STATIC_FREE_PLAN.features],
        STATIC_FREE_PLAN.maxMenus,
        tProfile,
      ),
    [tProfile],
  );

  const proFeatures = useMemo(() => {
    const base = translatePlanFeaturesWithMenuLimit(
      [...STATIC_PRO_PLAN.features],
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

  /** Custom-tier features (labels from Landing.pricing.customFeatures). */
  const CUSTOM_TABLE_FEATURE_KEYS = [
    "onlineOrdering",
    "deliveryMaps",
    "newLanguages",
  ] as const;

  const rows: { label: string; free: CellVal; pro: CellVal; custom: CellVal }[] = [
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

  const cellBase =
    "px-2 py-3.5 text-center align-middle sm:px-4 sm:py-5";
  const cellProText = "text-slate-800 dark:text-slate-100";

  return (
    <div
      className="relative overflow-hidden bg-[#f8f9fc] py-16 dark:bg-[#070a0f] sm:py-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-[0.14] blur-3xl dark:opacity-[0.2]">
        <div className="aspect-[4/3] w-[min(100vw,42rem)] bg-gradient-to-tr from-slate-200/90 via-violet-100/50 to-slate-100/40 dark:from-slate-900/80 dark:via-violet-950/25 dark:to-slate-950/40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mb-14 grid items-center gap-10 lg:mb-20 lg:grid-cols-2 lg:gap-14"
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-80px" }}
          variants={
            reduceMotion
              ? undefined
              : {
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
                  },
                }
          }
        >
          <motion.div
            className="text-center lg:text-start"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { opacity: 0, y: 22, x: isRTL ? 0 : 0 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: EASE_OUT },
                    },
                  }
            }
          >
            <motion.div
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-800 dark:border-violet-500/20 dark:bg-violet-950/35 dark:text-violet-200 sm:text-xs"
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, scale: 0.94 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.4, ease: EASE_OUT },
                      },
                    }
              }
            >
              <HiLightningBolt className="shrink-0 opacity-80" aria-hidden />
              {t("eyebrow")}
            </motion.div>
            <motion.h1
              className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 18 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.52, ease: EASE_OUT },
                      },
                    }
              }
            >
              {t("title")}
            </motion.h1>
            <motion.p
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg lg:mx-0"
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 14 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.48, ease: EASE_OUT },
                      },
                    }
              }
            >
              {t("subtitle")}
            </motion.p>
          </motion.div>
          <HeroMenuMockup reduceMotion={reduceMotion} />
        </motion.div>

        <motion.div
          className="relative max-w-full"
          initial={reduceMotion ? undefined : { opacity: 0, y: 32 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-400/[0.06] via-transparent to-fuchsia-400/[0.05] dark:from-violet-500/10 dark:to-fuchsia-500/06"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-violet-300/25 to-transparent dark:via-violet-500/15" />

          <div className="relative max-w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-md shadow-slate-900/[0.04] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/25 sm:rounded-3xl">
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
                    <h3 className="break-words font-bold leading-tight text-slate-900 dark:text-white sm:text-lg lg:text-xl">
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
                  <th className={`${COL_PRO} ${cellBase} z-[1] py-9 text-center align-bottom sm:py-11`}>
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
                        <div className={`relative text-2xl font-black tracking-tight sm:text-4xl ${cellProText}`}>
                          {STATIC_PRO_YEARLY_USD}$
                          <span className="ms-0.5 align-top text-[9px] font-medium text-violet-800/70 dark:text-violet-200/75 sm:text-xs">
                            /{tLanding("perYear")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className={`${cellBase} bg-white/50 py-8 align-bottom dark:bg-slate-900/25 sm:py-10`}>
                    <div className="mb-1.5 break-words font-semibold text-slate-900 dark:text-white sm:mb-2 sm:text-base">
                      {tLanding("planCustom")}
                    </div>
                    <div className="break-words text-base font-bold text-slate-500 dark:text-slate-400 sm:text-lg">
                      {tLanding("customPrice")}
                    </div>
                  </th>
                </tr>
              </thead>
              <motion.tbody
                initial={reduceMotion ? undefined : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={{ once: true, margin: "-32px" }}
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: {},
                        show: {
                          transition: { staggerChildren: 0.035, delayChildren: 0.08 },
                        },
                      }
                }
              >
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
                    <motion.tr
                      key={row.label}
                      className="border-b border-slate-100/90 last:border-b-0 dark:border-slate-800/55"
                      variants={
                        reduceMotion
                          ? undefined
                          : {
                              hidden: { opacity: 0, y: 8 },
                              show: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.32, ease: EASE_OUT },
                              },
                            }
                      }
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
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        <motion.section
          className="relative z-[2] mx-auto mt-20 max-w-5xl sm:mt-28"
          initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }}
        >
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md dark:rounded-3xl dark:border-slate-700/80 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:p-8 dark:shadow-xl dark:shadow-black/30 dark:ring-1 dark:ring-violet-500/15 sm:p-9">
            <p className="mb-6 text-center text-xs font-medium leading-relaxed text-slate-600 sm:mb-8 sm:text-sm dark:text-slate-400">
              {t("ctaStripIntro")}
            </p>
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
              initial={reduceMotion ? undefined : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: true }}
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: {},
                      show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                    }
              }
            >
              <motion.div
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
                      }
                }
              >
                <Link
                  href="/auth/register"
                  className="block rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-center text-xs font-bold text-slate-900 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/14 sm:px-8 sm:text-sm"
                >
                  {t("ctaRegister")}
                </Link>
              </motion.div>
              <motion.div
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
                      }
                }
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-8 py-3.5 text-center text-xs font-bold text-white shadow-md shadow-violet-500/25 transition hover:shadow-violet-500/35 sm:text-sm"
                >
                  <HiStar className="text-amber-200" aria-hidden />
                  {t("ctaUpgrade")}
                </Link>
              </motion.div>
              <motion.div
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
                      }
                }
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-xs font-bold text-white transition hover:bg-emerald-500 sm:text-sm"
                >
                  <HiOutlineChat className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {t("ctaContact")}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          className="mt-20 grid gap-6 sm:gap-8 lg:mt-28 lg:grid-cols-3"
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-60px" }}
          variants={
            reduceMotion
              ? undefined
              : {
                  hidden: {},
                  show: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
                }
          }
        >
          {[
            {
              title: tLanding("planFree"),
              desc: t("staticFreeDescription"),
              features: freeFeatures,
              premium: false,
            },
            {
              title: tLanding("planPro"),
              desc: t("staticProDescription"),
              features: proFeatures,
              premium: true,
            },
            {
              title: tLanding("planCustom"),
              desc: tLanding("customDescription"),
              features: (
                [
                  "waiterRequest",
                  "billRequest",
                  "onlineOrdering",
                  "deliveryMaps",
                  "newLanguages",
                  "onlinePayment",
                ] as const
              ).map((k) => tLanding(`customFeatures.${k}`)),
              premium: false,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl border p-6 transition-all sm:rounded-3xl sm:p-8 ${
                card.premium
                  ? "border-violet-200/80 bg-violet-50/50 shadow-md dark:border-violet-500/18 dark:bg-violet-500/[0.06] lg:scale-[1.02]"
                  : "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60"
              }`}
              variants={
                reduceMotion
                  ? undefined
                  : {
                      hidden: { opacity: 0, y: 28 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.48, ease: EASE_OUT },
                      },
                    }
              }
              whileHover={reduceMotion || !card.premium ? undefined : { y: -4 }}
            >
              <h3
                className={`text-lg font-black sm:text-xl ${
                  card.premium ? "text-violet-700 dark:text-violet-300" : "text-slate-900 dark:text-white"
                }`}
              >
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">{card.desc}</p>
              <ul className="mt-6 space-y-3 sm:mt-8">
                {card.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm"
                  >
                    <HiCheck
                      className={`mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
                        card.premium ? "text-violet-500 dark:text-violet-400" : "text-emerald-500 dark:text-emerald-400"
                      }`}
                      aria-hidden
                    />
                    {feat}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mx-auto mt-20 max-w-3xl lg:mt-28"
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <motion.h2
            className="mb-8 text-center text-2xl font-black text-slate-900 dark:text-white sm:mb-10 sm:text-3xl"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            {t("faqTitle")}
          </motion.h2>
          <motion.div
            className="space-y-3 sm:space-y-4"
            initial={reduceMotion ? undefined : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, margin: "-20px" }}
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: {},
                    show: { transition: { staggerChildren: 0.1 } },
                  }
            }
          >
            {(["faq1", "faq2", "faq3"] as const).map((id) => (
              <motion.div
                key={id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 transition-colors hover:border-violet-200/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-violet-500/20 sm:p-6"
                variants={
                  reduceMotion
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: isRTL ? -16 : 16 },
                        show: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.42, ease: EASE_OUT },
                        },
                      }
                }
              >
                <dt className="text-base font-bold text-slate-900 transition-colors hover:text-violet-700 dark:text-white dark:hover:text-violet-300 sm:text-lg">
                  {t(`${id}q`)}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  {t(`${id}a`)}
                </dd>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
