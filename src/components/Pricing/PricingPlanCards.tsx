"use client";

import { Link } from "@/i18n/navigation";
import { HiCheck, HiOutlineChat, HiStar } from "react-icons/hi";
import { sectionHeadingClassName } from "@/components/HomePage/SectionBadge";
import type { PricingPlanCard } from "./usePricingPlanCards";

type PricingPlanCardsProps = {
  cards: PricingPlanCard[];
  popularLabel: string;
  title?: string;
  className?: string;
};

export default function PricingPlanCards({
  cards,
  popularLabel,
  title,
  className = "",
}: PricingPlanCardsProps) {
  return (
    <div className={className}>
      {title ? (
        <h2 className={`${sectionHeadingClassName} text-center`}>
          {title}
        </h2>
      ) : null}

      <div
        className="pricing-cards-stagger grid gap-6 lg:grid-cols-3 lg:items-end lg:gap-5 xl:gap-6"
        role="list"
      >
        {cards.map((card) => {
          const isPro = card.premium;
          const isCustom = card.id === "custom";
          const isFree = card.id === "free";

          return (
            <article
              key={card.id}
              role="listitem"
              className={`flex flex-col ${isPro ? "z-10 lg:-translate-y-2" : ""}`}
            >
              {isPro && (
                <div className="mb-3 flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 px-3.5 py-1 text-[11px] font-bold whitespace-nowrap text-white shadow-md shadow-violet-600/30">
                    <HiStar className="h-3 w-3 shrink-0" aria-hidden />
                    {popularLabel}
                  </span>
                </div>
              )}

              <div
                className={`group relative flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border p-6 transition-all duration-300 sm:p-7 ${
                  isPro
                    ? "border-violet-400/50 bg-white shadow-xl shadow-violet-500/15 hover:-translate-y-1 hover:shadow-violet-500/25 dark:border-violet-500/50 dark:bg-[#151b30] dark:shadow-violet-900/25"
                    : isCustom
                      ? "border-dashed border-slate-300/90 bg-white/80 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-slate-600 dark:bg-slate-900/80"
                      : "border-slate-200/90 bg-white shadow-md shadow-slate-900/5 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/30"
                }`}
              >
              {/* Pro glow */}
              {isPro && (
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-br from-violet-500/[0.07] via-transparent to-indigo-500/[0.06] dark:from-violet-500/10 dark:to-indigo-500/8"
                  aria-hidden
                />
              )}

              {/* Custom top accent */}
              {isCustom && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500/70 to-transparent"
                  aria-hidden
                />
              )}

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                      isPro
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : isCustom
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isFree ? "01" : isPro ? "02" : "03"}
                  </span>
                  <h3
                    className={`text-lg font-extrabold ${
                      isPro
                        ? "text-violet-800 dark:text-violet-200"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {card.desc}
                </p>
              </div>

              <div
                className={`relative mt-5 rounded-2xl px-4 py-3.5 ${
                  isPro
                    ? "bg-violet-50 dark:bg-violet-500/10"
                    : "bg-slate-50 dark:bg-slate-800/60"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                  <span
                    className={`text-[1.75rem] font-extrabold leading-none sm:text-3xl ${
                      isPro
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {card.price}
                  </span>
                  {card.priceNote && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {card.priceNote}
                    </span>
                  )}
                </div>
              </div>

              {/* flex-1 keeps everything lined up perfectly */}
              <ul className="relative mt-5 flex-1 space-y-2.5">
                {card.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-[13px] font-medium leading-snug text-slate-700 dark:text-slate-200 sm:text-sm"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isPro
                          ? "bg-violet-600 text-white dark:bg-violet-500"
                          : "bg-emerald-500 text-white dark:bg-emerald-600"
                      }`}
                    >
                      <HiCheck className="h-3 w-3" aria-hidden />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="relative mt-6">
                {card.cta.external ? (
                  <a
                    href={card.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:shadow-lg hover:shadow-emerald-600/30"
                  >
                    <HiOutlineChat className="h-4 w-4" aria-hidden />
                    {card.cta.label}
                  </a>
                ) : (
                  <Link
                    href={card.cta.href}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition ${
                      isPro
                        ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/35"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-violet-300 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:border-violet-500/50 dark:hover:bg-violet-950/50"
                    }`}
                  >
                    {card.cta.label}
                  </Link>
                )}
              </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}