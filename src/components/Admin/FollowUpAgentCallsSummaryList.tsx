"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import {
  formatFollowUpDate,
  getFollowUpCallDisplayName,
  getFollowUpCallDisplayPhone,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";

type FollowUpAgentCallsSummaryListProps = {
  calls: FollowUpCall[];
  onSelect: (call: FollowUpCall) => void;
};

export default function FollowUpAgentCallsSummaryList({
  calls,
  onSelect,
}: FollowUpAgentCallsSummaryListProps) {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");
  const isRtl = locale === "ar";

  if (calls.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("noCallsYet")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <span>{t("columns.date")}</span>
        <span>{t("columns.name")}</span>
        <span>{t("columns.phone")}</span>
        <span className="sr-only">{t("viewCallDetails")}</span>
      </div>
      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {calls.map((call) => {
          const phone = getFollowUpCallDisplayPhone(call);
          return (
            <li key={call.id}>
              <button
                type="button"
                onClick={() => onSelect(call)}
                className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 text-start transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  {formatFollowUpDate(call.calledAt, locale)}
                </span>
                <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {getFollowUpCallDisplayName(call)}
                </span>
                <span className="min-w-0">
                  {phone ? (
                    <PhoneDisplay
                      value={phone}
                      className="text-xs text-primary"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t("noPhone")}
                    </span>
                  )}
                </span>
                {isRtl ? (
                  <IoChevronBack className="shrink-0 text-slate-400 dark:text-slate-500" />
                ) : (
                  <IoChevronForward className="shrink-0 text-slate-400 dark:text-slate-500" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
