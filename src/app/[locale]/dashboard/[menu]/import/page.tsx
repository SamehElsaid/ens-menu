"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import MenuImportWizard from "@/components/MenuImport/MenuImportWizard";
import LinkTo from "@/components/Global/LinkTo";
import { IoWarningOutline, IoArrowBackOutline } from "react-icons/io5";

type BulkImportCanUseResponse = {
  canuse: boolean;
  used?: number;
  limit?: number;
  remaining?: number;
};

export default function MenuImportPage() {
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");
  const locale = useLocale();
  const t = useTranslations("MenuImport");

  const [loading, setLoading] = useState(true);
  const [canUse, setCanUse] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState(false);

  const refreshCanUse = useCallback(async (): Promise<boolean> => {
    if (!menuId) return false;

    try {
      const response = await axiosGet<BulkImportCanUseResponse>(
        `/menus/${menuId}/categories/bulk/canuse`,
        locale,
      );

      if (response.status && response.data) {
        setCanUse(response.data.canuse);
        setCheckError(false);
        return response.data.canuse;
      }

      setCanUse(null);
      setCheckError(true);
      return false;
    } catch (err) {
      console.error("[MenuImportPage] Failed to check canuse limit:", err);
      setCanUse(null);
      setCheckError(true);
      return false;
    }
  }, [menuId, locale]);

  useEffect(() => {
    if (!menuId) return;

    let isMounted = true;

    const checkLimit = async () => {
      await refreshCanUse();
      if (isMounted) {
        setLoading(false);
      }
    };

    checkLimit();

    return () => {
      isMounted = false;
    };
  }, [menuId, refreshCanUse]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {locale === "ar" ? "جاري التحقق من الاشتراك..." : "Verifying subscription status..."}
        </p>
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="max-w-md mx-auto my-12 px-6 sm:px-8 py-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {locale === "ar"
            ? "تعذّر التحقق من صلاحية الاستيراد. حاول مرة أخرى."
            : "Could not verify import eligibility. Please try again."}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all gap-1.5"
        >
          <IoArrowBackOutline className={`${locale === "ar" ? "rotate-180" : ""} text-base`} />
          {t("backToOverview")}
        </LinkTo>
      </div>
    );
  }

  if (canUse === false) {
    return (
      <div className="max-w-md mx-auto my-12 px-6 sm:px-8 py-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl text-center animate-fadeIn">
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
            <IoWarningOutline className="text-3xl text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          {t("freeLimitReachedTitle")}
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          {t("freeLimitReachedDescription")}
        </p>

        <div className="flex flex-col gap-3">
          <LinkTo
            href={`/dashboard/${menuId}/subscription`}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-primary text-white rounded-2xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all hover:bg-primary/95"
          >
            {t("freePlanLimitUpgrade")}
          </LinkTo>
          
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.98] transition-all gap-1.5"
          >
            <IoArrowBackOutline className={`${locale === "ar" ? "rotate-180" : ""} text-base`} />
            {t("backToOverview")}
          </LinkTo>
        </div>
      </div>
    );
  }

  return <MenuImportWizard onCheckCanUse={refreshCanUse} />;
}
