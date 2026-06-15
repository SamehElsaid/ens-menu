"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import CallNowPhoneModal from "@/components/Admin/CallNowPhoneModal";
import FollowUpOutcomeIcon from "@/components/Admin/FollowUpOutcomeIcon";
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
  const [phoneModal, setPhoneModal] = useState<{
    phone: string;
    name: string;
  } | null>(null);

  if (calls.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("noCallsYet")}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <span className="w-6 text-center">{t("outcome")}</span>
          <span>{t("columns.date")}</span>
          <span>{t("columns.name")}</span>
          <span>{t("columns.phone")}</span>
          <span className="sr-only">{t("viewCallDetails")}</span>
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {calls.map((call) => {
            const phone = getFollowUpCallDisplayPhone(call);
            const displayName = getFollowUpCallDisplayName(call);
            return (
              <li
                key={call.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3"
              >
                <div className="flex w-6 justify-center">
                  <FollowUpOutcomeIcon outcome={call.outcome} size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(call)}
                  className="col-span-1 text-start text-xs tabular-nums text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  {formatFollowUpDate(call.calledAt, locale)}
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(call)}
                  className="col-span-1 truncate text-start text-sm font-medium text-slate-900 transition-colors hover:text-primary dark:text-slate-100"
                >
                  {displayName}
                </button>
                <div className="min-w-0">
                  {phone ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPhoneModal({ phone, name: displayName });
                      }}
                      className="text-start hover:underline"
                      title={t("callNow")}
                    >
                      <PhoneDisplay
                        value={phone}
                        className="text-xs text-primary cursor-pointer"
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t("noPhone")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(call)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-500 dark:hover:bg-slate-800"
                  aria-label={t("viewCallDetails")}
                >
                  {isRtl ? (
                    <IoChevronBack className="text-base" />
                  ) : (
                    <IoChevronForward className="text-base" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {phoneModal && (
        <CallNowPhoneModal
          open
          onClose={() => setPhoneModal(null)}
          phoneNumber={phoneModal.phone}
          customerName={phoneModal.name}
        />
      )}
    </>
  );
}
