"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ImportDraft } from "@/types/menuImport";
import { IoCloseOutline } from "react-icons/io5";

interface ConfirmSavePanelProps {
  draft: ImportDraft;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmSavePanel({
  draft,
  isSaving,
  onClose,
  onConfirm,
}: ConfirmSavePanelProps) {
  const t = useTranslations("MenuImport");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border border-slate-200 dark:border-slate-700 animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("confirmTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t("confirmDescription")}
        </p>

        <ul className="space-y-2 mb-4 text-sm">
          <li className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">
              {t("confirmCategories")}
            </span>
            <span className="font-semibold tabular-nums">
              {draft.stats.categoryCount}
            </span>
          </li>
          <li className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">
              {t("confirmItemsToCreate")}
            </span>
            <span className="font-semibold tabular-nums">
              {draft.stats.expandedItemCount}
            </span>
          </li>
        </ul>

        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-4">
          {t("confirmWarning")}
        </p>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={isSaving}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {t("confirmCheckbox")}
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            {t("backToEdit")}
          </button>
          <button
            type="button"
            disabled={!agreed || isSaving}
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("saving") : t("confirmSave")}
          </button>
        </div>
      </div>
    </div>
  );
}
