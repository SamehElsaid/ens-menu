"use client";

import LinkTo from "@/components/Global/LinkTo";
import { useTranslations } from "next-intl";
import { IoSparklesOutline, IoCameraOutline } from "react-icons/io5";

type Variant = "primary" | "secondary" | "card";

interface MenuImportEntryButtonProps {
  menuId: string;
  variant?: Variant;
  className?: string;
}

export default function MenuImportEntryButton({
  menuId,
  variant = "secondary",
  className = "",
}: MenuImportEntryButtonProps) {
  const t = useTranslations("MenuImport");

  const href = `/dashboard/${menuId}/import`;

  if (variant === "card") {
    return (
      <LinkTo
        href={href}
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-linear-to-br from-primary/5 via-white to-violet-50 dark:from-primary/10 dark:via-slate-800 dark:to-slate-800 rounded-2xl border-2 border-primary/20 dark:border-primary/30 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 group ${className}`}
      >
        <div className="min-w-0 flex-1 text-start">
          <div className="inline-flex items-center gap-2 mb-2">
            <IoSparklesOutline className="text-primary text-lg shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("badge")}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {t("emptyMenuTitle")}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t("emptyMenuDescription")}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold shadow-md group-hover:opacity-90 transition-all shrink-0">
          <IoCameraOutline className="text-xl" />
          {t("entryButton")}
        </span>
      </LinkTo>
    );
  }

  const styles =
    variant === "primary"
      ? "inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      : "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary/30 dark:border-primary/40 text-primary dark:text-primary bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 font-semibold text-sm transition-all";

  return (
    <LinkTo href={href} className={`${styles} ${className}`}>
      <IoSparklesOutline className="text-lg shrink-0" />
      {t("entryButton")}
    </LinkTo>
  );
}
