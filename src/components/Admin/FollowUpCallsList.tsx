"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import {
  formatFollowUpDateTime,
  formatFollowUpPurpose,
} from "@/lib/fetchAdminFollowUp";
import type { FollowUpCall } from "@/types/AdminFollowUp";
import PhoneDisplay from "@/components/Global/PhoneDisplay";

type FollowUpCallsListProps = {
  calls: FollowUpCall[];
  detailed?: boolean;
  showCustomer?: boolean;
  onDelete?: (call: FollowUpCall) => void;
  onEdit?: (call: FollowUpCall) => void;
};

export default function FollowUpCallsList({
  calls,
  detailed = false,
  showCustomer = false,
  onDelete,
  onEdit,
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
          {(onEdit || onDelete) && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-1.5">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(call)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <IoPencilOutline className="text-sm" />
                    {t("editCall")}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(call)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <IoTrashOutline className="text-sm" />
                    {t("deleteCall")}
                  </button>
                )}
              </div>
              <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {formatFollowUpDateTime(call.calledAt, locale)}
              </span>
            </div>
          )}

          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {showCustomer && call.userName && (
                <p className="mb-1 text-xs font-semibold text-primary">
                  {call.userName}
                </p>
              )}
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t(`outcomes.${call.outcome}`)}
                {call.purpose && (
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    {" · "}
                    {formatFollowUpPurpose(call.purpose, t)}
                  </span>
                )}
              </span>
            </div>
            {!onEdit && !onDelete && (
              <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {formatFollowUpDateTime(call.calledAt, locale)}
              </span>
            )}
          </div>

          {detailed && (
            <dl className="mb-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
              {call.customerName && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("customerName")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {call.customerName}
                  </dd>
                </div>
              )}
              {call.governorate && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("governorate")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {call.governorate}
                  </dd>
                </div>
              )}
              {call.cafeName && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("cafeName")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {call.cafeName}
                  </dd>
                </div>
              )}
              {call.otherContactNumbers && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("otherContactNumbers")}
                  </dt>
                  <dd>
                    <PhoneDisplay
                      value={call.otherContactNumbers}
                      as="a"
                      className="font-medium text-primary hover:underline"
                    />
                  </dd>
                </div>
              )}
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
              {showCustomer && call.userName && (
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("columns.name")}
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {call.userName}
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
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
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
              {call.customerName && (
                <span>
                  {t("customerName")}: {call.customerName}
                </span>
              )}
              {call.cafeName && (
                <span>
                  {t("cafeName")}: {call.cafeName}
                </span>
              )}
              {call.governorate && (
                <span>
                  {t("governorate")}: {call.governorate}
                </span>
              )}
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
              {call.otherContactNumbers && (
                <span>
                  {t("otherContactNumbers")}:{" "}
                  <PhoneDisplay
                    value={call.otherContactNumbers}
                    as="a"
                    className="text-primary hover:underline"
                  />
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
