"use client";

import { useTranslations, useLocale } from "next-intl";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FeatureCardProps } from "@/types/types";
import { features } from "@/modules/FeatureSection/data";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
  sectionHighlightClassName,
} from "@/components/HomePage/SectionBadge";

const MOBILE_FEATURE_COUNT = 6;

type FeatureCardComponentProps = FeatureCardProps & {
  className?: string;
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardComponentProps) => (
  <article
    role="listitem"
    className={`group relative h-full overflow-hidden rounded-[28px] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-100/50 transition-all hover:shadow-2xl hover:shadow-purple-100/50 sm:p-6 dark:border-slate-800 dark:bg-[#15203c] dark:shadow-slate-900/50 dark:hover:shadow-purple-900/50 ${className}`.trim()}
  >
    <div
      className="absolute -me-10 -mt-10 end-0 top-0 h-20 w-20 rounded-bl-[100px] bg-purple-50/50 transition-all group-hover:scale-150 group-hover:bg-purple-100/50 dark:bg-purple-500/10 dark:group-hover:bg-purple-500/20"
      aria-hidden
    />
    <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-500/20 dark:text-purple-400">
      <Icon size={22} aria-hidden />
    </div>
    <h3 className="relative z-10 mb-3 text-base font-black text-slate-900 dark:text-white">
      {title}
    </h3>
    <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </article>
);

export const Features = () => {
  const t = useTranslations("Landing.features");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const featuresList = features.map((feature) => ({
    id: feature.id,
    title: t(`items.${feature.translationKey}.title`),
    description: t(`items.${feature.translationKey}.description`),
    icon: feature.icon,
  }));

  return (
    <section
      id="features"
      className="relative bg-white py-20 dark:bg-[#0d1117] sm:py-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-16 max-w-3xl text-center">
          <SectionBadge
            icon={<HiOutlineSparkles className="h-4 w-4" aria-hidden />}
          >
            {t("badge")}
          </SectionBadge>

          <h2 className={sectionHeadingClassName}>
            {t("title")}{" "}
            <span className={sectionHighlightClassName}>{t("subtitle")}</span>
          </h2>

          <p className={sectionDescriptionClassName}>{t("description")}</p>

          <div
            className="mt-6 flex justify-center gap-1.5"
            aria-hidden
          >
            <span className="h-1 w-10 rounded-full bg-violet-600 dark:bg-violet-500" />
            <span className="h-1 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="h-1 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </header>

        <div
          className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6"
          role="list"
        >
          {featuresList.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className={
                index >= MOBILE_FEATURE_COUNT ? "hidden sm:block" : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
