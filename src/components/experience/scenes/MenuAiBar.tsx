"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/localeDirection";
import { AI_SUGGESTION_IDS, CAFE_LINA_MENU } from "../cafeLinaMenu";
import { useExperience } from "../ExperienceContext";

type MenuAiBarProps = {
  className?: string;
};

export default function MenuAiBar({ className }: MenuAiBarProps) {
  const t = useTranslations("experienceHome");
  const locale = useLocale();
  const isRTL = isRtlLocale(locale);
  const { addItemsById } = useExperience();

  const getName = (id: string) => {
    const item = CAFE_LINA_MENU.find((m) => m.id === id);
    if (!item) return id;
    return isRTL ? item.nameAr : item.nameEn;
  };

  return (
    <div
      className={cn(
        "shrink-0 border-t border-purple-100 bg-purple-50/90 px-5 py-3 backdrop-blur-md dark:border-purple-500/20 dark:bg-purple-950/40",
        className,
      )}
    >
      <div className="container flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
          AI
        </span>
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
            {t("aiLabel")}
          </p>
          <p className="text-[13px] leading-snug text-slate-700 dark:text-slate-200">
            {t("aiMessage")}
          </p>
          <button
            type="button"
            onClick={() =>
              addItemsById([...AI_SUGGESTION_IDS], getName)
            }
            className="mt-2 rounded-full bg-purple-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-700"
          >
            {t("aiAddBoth")}
          </button>
        </div>
      </div>
    </div>
  );
}
