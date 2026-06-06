"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoCloseOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import FollowUpCallsList from "@/components/Admin/FollowUpCallsList";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import { fetchFollowUpCalls } from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";

type UserFollowUpCallsModalProps = {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  phoneNumber: string | null;
};

export default function UserFollowUpCallsModal({
  open,
  onClose,
  userId,
  userName,
  phoneNumber,
}: UserFollowUpCallsModalProps) {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [calls, setCalls] = useState<FollowUpCall[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFollowUpCalls(locale, { userId });
      setCalls(data.calls);
    } finally {
      setLoading(false);
    }
  }, [locale, userId]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="user-calls-title"
        dir={textDir}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2
              id="user-calls-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {t("viewCallsTitle")}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
              {userName}
            </p>
            {phoneNumber ? (
              <PhoneDisplay
                value={phoneNumber}
                className="mt-0.5 text-sm text-slate-500 dark:text-slate-400"
              />
            ) : (
              <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">
                {t("noPhone")}
              </p>
            )}
            {!loading && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("callsCount", { count: calls.length })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t("close")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-2xl text-primary" />
            </div>
          ) : (
            <FollowUpCallsList calls={calls} detailed />
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
