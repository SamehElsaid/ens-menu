"use client";

import { useTranslations } from "next-intl";
import ExperienceScene from "../ExperienceScene";

export default function ArrivalScene() {
  const t = useTranslations("experienceHome");

  return (
    <ExperienceScene
      index={0}
      height="compact"
      className="items-center justify-center bg-[#faf8f5] dark:bg-[#0a0a0c]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgb(124_58_237/0.07),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgb(124_58_237/0.12),transparent)]"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-600/70 dark:text-purple-400/80">
          ENSmenu
        </p>
        <h1 className="mb-3 font-bold tracking-tight text-slate-900 text-4xl sm:text-5xl lg:text-6xl dark:text-white">
          {t("restaurantName")}
        </h1>
        <p className="mb-10 max-w-sm text-base text-slate-500 sm:text-lg dark:text-slate-400">
          {t("tagline")}
        </p>
        <p className="animate-pulse text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
          {t("arrivalHint")}
        </p>
        <div
          aria-hidden
          className="mt-8 h-8 w-px bg-gradient-to-b from-purple-500/50 to-transparent"
        />
      </div>
    </ExperienceScene>
  );
}
