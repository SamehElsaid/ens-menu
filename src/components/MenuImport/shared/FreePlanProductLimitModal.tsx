"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import { IoCloseOutline, IoWarningOutline } from "react-icons/io5";

interface FreePlanProductLimitModalProps {
  menuId: string;
  maxProducts: number;
  currentCount: number;
  importCount: number;
  totalAfter: number;
  exceedsLimit: boolean;
  mode: "info" | "confirm";
  onClose: () => void;
  onContinue?: () => void;
}

export default function FreePlanProductLimitModal({
  menuId,
  maxProducts,
  currentCount,
  importCount,
  totalAfter,
  exceedsLimit,
  mode,
  onClose,
  onContinue,
}: FreePlanProductLimitModalProps) {
  const t = useTranslations("MenuImport");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-[fadeIn_0.2s_ease-out]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <IoCloseOutline className="text-2xl" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              exceedsLimit
                ? "bg-red-50 dark:bg-red-900/20"
                : "bg-amber-50 dark:bg-amber-900/20"
            }`}
          >
            <IoWarningOutline
              className={`text-3xl ${
                exceedsLimit
                  ? "text-red-500"
                  : "text-amber-500 dark:text-amber-400"
              }`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("freePlanLimitTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("freePlanLimitDescription", {
                max: maxProducts,
                current: currentCount,
              })}
            </p>
            {importCount > 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("freePlanLimitImport", {
                  import: importCount,
                  total: totalAfter,
                })}
              </p>
            )}
            {exceedsLimit && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {t("freePlanLimitExceeded")}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            {exceedsLimit ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {t("freePlanLimitClose")}
                </button>
                <LinkTo
                  href={`/dashboard/${menuId}/subscription`}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold text-center hover:opacity-90"
                >
                  {t("freePlanLimitUpgrade")}
                </LinkTo>
              </>
            ) : mode === "confirm" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {t("freePlanLimitClose")}
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90"
                >
                  {t("freePlanLimitContinue")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90"
              >
                {t("freePlanLimitClose")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
