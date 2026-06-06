"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  formatFollowUpDateTime,
  formatFollowUpPurpose,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";

type FollowUpCallsListProps = {
  calls: FollowUpCall[];
  detailed?: boolean;
};

export default function FollowUpCallsList({
  calls,
  detailed = false,
}: FollowUpCallsListProps) {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");

  if (calls.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("noCallsYet")}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {calls.map((call) => (
        <li
          key={call.id}
          className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t(`outcomes.${call.outcome}`)}
              {call.purpose && (
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {" · "}
                  {formatFollowUpPurpose(call.purpose, t)}
                </span>
              )}
            </span>
            <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {formatFollowUpDateTime(call.calledAt, locale)}
            </span>
          </div>

          {detailed && (
            <dl className="mb-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
              {call.adminName && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("agentName")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {call.adminName}
                  </dd>
                </div>
              )}
              {call.purpose && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("purpose")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {formatFollowUpPurpose(call.purpose, t)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  {t("outcome")}
                </dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {t(`outcomes.${call.outcome}`)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">
                  {t("nextFollowUp")}
                </dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {call.nextFollowUpAt ?? "—"}
                </dd>
              </div>
            </dl>
          )}

          {call.notes ? (
            <div className={detailed ? "mt-2" : "mb-1"}>
              {detailed && (
                <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("notes")}
                </p>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {call.notes}
              </p>
            </div>
          ) : detailed ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("noNotes")}
            </p>
          ) : null}

          {!detailed && (
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              {call.adminName && (
                <span>
                  {t("agentName")}: {call.adminName}
                </span>
              )}
              {call.nextFollowUpAt && (
                <span>
                  {t("nextFollowUp")}: {call.nextFollowUpAt}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
