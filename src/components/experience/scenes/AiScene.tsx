"use client";

import { useTranslations } from "next-intl";
import ExperienceScene from "../ExperienceScene";
import MenuAiBar from "./MenuAiBar";

/** Desktop scroll-story beat — AI moment as its own scene */
export default function AiScene() {
  const t = useTranslations("experienceHome");

  return (
    <ExperienceScene
      index={3}
      height="compact"
      className="hidden items-center justify-center bg-gradient-to-b from-[#f7f5f2] to-white lg:flex dark:from-[#0d1117] dark:to-[#0a0a0c]"
    >
      <div className="container max-w-lg px-6 text-center">
        <div className="mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/AiAvatar.png"
            alt="Lina"
            className="h-20 w-20 rounded-full border-2 border-purple-200 object-cover shadow-lg dark:border-purple-500/30"
          />
        </div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
          {t("aiLabel")}
        </p>
        <p className="mb-8 text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl dark:text-slate-100">
          {t("aiMessage")}
        </p>
        <div className="mx-auto max-w-md">
          <MenuAiBar className="rounded-2xl border border-purple-100 dark:border-purple-500/20" />
        </div>
      </div>
    </ExperienceScene>
  );
}
