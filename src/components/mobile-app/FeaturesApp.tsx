"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FiPlusCircle,
  FiGrid,
  FiActivity,
  FiCheckSquare,
  FiGlobe,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import LoadImage from "../ImageLoad";
import {
  MarketingHeading,
  MarketingSection,
  MarketingText,
} from "@/components/marketing";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

const icons = [
  FiPlusCircle,
  FiGrid,
  FiActivity,
  FiCheckSquare,
  FiGlobe,
  FiFileText,
];

const showcaseImages = [
  "/images/showcase/p-(2).jpg",
  "/images/showcase/p-(5).jpg",
  "/images/showcase/p-(1).jpg",
  "/images/showcase/p-(3).jpg",
  "/images/showcase/p-(4).jpg",
  "/images/showcase/p-(6).jpg",
];

type FeatureItem = { title: string; desc: string };

export default function FeaturesApp() {
  const t = useTranslations("Landing.FeaturesApp");
  const tMobile = useTranslations("Landing.mobileApp");

  const items = useMemo(() => {
    const raw = t.raw("items");
    return Array.isArray(raw) ? (raw as FeatureItem[]) : [];
  }, [t]);
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const ActiveIcon = icons[active % icons.length];

  return (
    <MarketingSection variant="default" className="overflow-hidden">
      <div className="container max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <MarketingText variant="label" className="mb-3 text-purple-600 dark:text-purple-400">
            {tMobile("whyOurApp")}
          </MarketingText>
          <MarketingHeading as="h2" level="section" className="mb-3">
            {t("title")}
          </MarketingHeading>
          <MarketingText
            variant="subtitle"
            className="mx-auto max-w-2xl text-center"
          >
            {t("subtitle")}
          </MarketingText>
        </div>

        <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-14">
          <div className="w-full space-y-2 lg:w-1/2">
            {items.map((item, i) => {
              const Icon = icons[i % icons.length];
              const isActive = active === i;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={cn(
                    "group w-full rounded-2xl border p-4 text-start transition-all duration-200 sm:p-5",
                    isActive
                      ? "border-purple-200 bg-white shadow-sm shadow-purple-100/50 dark:border-purple-500/30 dark:bg-slate-900/60 dark:shadow-none"
                      : "border-transparent hover:border-slate-200/80 hover:bg-slate-50/80 dark:hover:border-slate-800 dark:hover:bg-slate-900/30",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "shrink-0 rounded-xl p-2.5 transition-colors",
                        isActive
                          ? "bg-purple-600 text-white dark:bg-purple-500"
                          : "bg-slate-100 text-purple-600 dark:bg-slate-800 dark:text-purple-400",
                      )}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          "mb-0.5 text-sm font-semibold sm:text-base",
                          isActive
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300",
                        )}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={cn(
                          "text-xs leading-relaxed sm:text-sm",
                          isActive
                            ? "text-slate-500 dark:text-slate-400"
                            : "line-clamp-2 text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {item.desc}
                      </p>
                    </div>

                    {isActive && (
                      <FiCheck
                        size={18}
                        className="shrink-0 text-purple-600 dark:text-purple-400"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden w-full lg:sticky lg:top-32 lg:block lg:w-1/2">
            <div
              className={cn(
                ds.card.base,
                ds.card.elevated,
                "relative overflow-hidden p-8 sm:p-10",
              )}
            >
              <div className={ds.glow} aria-hidden />

              <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
                <span className={cn(ds.pill, "inline-flex items-center gap-2")}>
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                  {tMobile("livePreview")}
                </span>
                <span className="text-xs font-semibold tabular-nums text-slate-400">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative z-10 mx-auto aspect-770/1280 w-full max-w-[420px] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-700/60">
                <LoadImage
                  src={showcaseImages[active % showcaseImages.length]}
                  alt={items[active].title}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-top"
                />
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-center">
                <ActiveIcon
                  size={16}
                  className="shrink-0 text-purple-600 dark:text-purple-400"
                />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {items[active].title}
                </p>
              </div>

              <div className="relative z-10 mt-4 flex justify-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Go to feature ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === active
                        ? "w-6 bg-purple-600 dark:bg-purple-400"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
