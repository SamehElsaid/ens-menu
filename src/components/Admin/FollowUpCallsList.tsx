"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { Button, Card, EmptyState } from "@/components/ui";
import CallNowPhoneModal from "@/components/Admin/CallNowPhoneModal";
import FollowUpOutcomeIcon from "@/components/Admin/FollowUpOutcomeIcon";
import {
  formatFollowUpDateTime,
  formatFollowUpPurpose,
  getFollowUpCallDisplayPhone,
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
  const [phoneModal, setPhoneModal] = useState<{
    phone: string;
    name: string;
  } | null>(null);

  if (calls.length === 0) {
    return <EmptyState title={t("noCallsYet")} size="sm" />;
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {calls.map((call) => {
          const displayPhone = getFollowUpCallDisplayPhone(call);
          const displayName =
            call.customerName?.trim() ||
            call.userName?.trim() ||
            `#${call.userId}`;

          return (
            <Card as="li" key={call.id} padded="md">
              {(onEdit || onDelete) && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="xs"
                        startIcon={<IoPencilOutline />}
                        onClick={() => onEdit(call)}
                      >
                        {t("editCall")}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="dangerGhost"
                        size="xs"
                        startIcon={<IoTrashOutline />}
                        onClick={() => onDelete(call)}
                      >
                        {t("deleteCall")}
                      </Button>
                    )}
                  </div>
                  <span className="text-xs tabular-nums text-fg-muted">
                    {formatFollowUpDateTime(call.calledAt, locale)}
                  </span>
                </div>
              )}

              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {showCustomer && call.userName && (
                    <p className="mb-1 text-xs font-semibold text-brand">
                      {call.userName}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
                    <FollowUpOutcomeIcon outcome={call.outcome} size="sm" />
                    {t(`outcomes.${call.outcome}`)}
                    {call.purpose && (
                      <span className="font-normal text-fg-muted">
                        {" · "}
                        {formatFollowUpPurpose(call.purpose, t)}
                      </span>
                    )}
                  </span>
                </div>
                {!onEdit && !onDelete && (
                  <span className="shrink-0 text-xs tabular-nums text-fg-muted">
                    {formatFollowUpDateTime(call.calledAt, locale)}
                  </span>
                )}
              </div>

              {detailed && (
                <dl className="mb-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                  {displayPhone && (
                    <div className="sm:col-span-2">
                      <dt className="text-fg-muted">{t("columns.phone")}</dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        <PhoneDisplay
                          value={displayPhone}
                          copyOnClick
                          className="font-medium text-brand hover:underline"
                          title={t("copyPhone")}
                          onCopied={() => toast.success(t("phoneCopied"))}
                          onCopyFailed={() => toast.error(t("copyFailed"))}
                        />
                        <Button
                          variant="link"
                          size="xs"
                          onClick={() =>
                            setPhoneModal({
                              phone: displayPhone,
                              name: displayName,
                            })
                          }
                        >
                          {t("callNow")}
                        </Button>
                      </dd>
                    </div>
                  )}
                  {call.customerName && (
                    <div>
                      <dt className="text-fg-muted">{t("customerName")}</dt>
                      <dd className="font-medium text-fg">
                        {call.customerName}
                      </dd>
                    </div>
                  )}
                  {call.governorate && (
                    <div>
                      <dt className="text-fg-muted">{t("governorate")}</dt>
                      <dd className="font-medium text-fg">
                        {call.governorate}
                      </dd>
                    </div>
                  )}
                  {call.cafeName && (
                    <div>
                      <dt className="text-fg-muted">{t("cafeName")}</dt>
                      <dd className="font-medium text-fg">{call.cafeName}</dd>
                    </div>
                  )}
                  {call.otherContactNumbers && (
                    <div className="sm:col-span-2">
                      <dt className="text-fg-muted">
                        {t("otherContactNumbers")}
                      </dt>
                      <dd>
                        <PhoneDisplay
                          value={call.otherContactNumbers}
                          as="a"
                          className="font-medium text-brand hover:underline"
                        />
                      </dd>
                    </div>
                  )}
                  {call.adminName && (
                    <div>
                      <dt className="text-fg-muted">{t("agentName")}</dt>
                      <dd className="font-medium text-fg">{call.adminName}</dd>
                    </div>
                  )}
                  {showCustomer && call.userName && (
                    <div>
                      <dt className="text-fg-muted">{t("columns.name")}</dt>
                      <dd className="font-medium text-fg">{call.userName}</dd>
                    </div>
                  )}
                  {call.purpose && (
                    <div>
                      <dt className="text-fg-muted">{t("purpose")}</dt>
                      <dd className="font-medium text-fg">
                        {formatFollowUpPurpose(call.purpose, t)}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-fg-muted">{t("outcome")}</dt>
                    <dd className="font-medium text-fg">
                      {t(`outcomes.${call.outcome}`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-fg-muted">{t("nextFollowUp")}</dt>
                    <dd className="font-medium text-fg">
                      {call.nextFollowUpAt ?? "—"}
                    </dd>
                  </div>
                </dl>
              )}

              {call.notes ? (
                <div className={detailed ? "mt-2" : "mb-1"}>
                  {detailed && (
                    <p className="mb-1 text-xs text-fg-muted">{t("notes")}</p>
                  )}
                  <p className="whitespace-pre-wrap text-sm text-fg-muted">
                    {call.notes}
                  </p>
                </div>
              ) : detailed ? (
                <p className="text-xs text-fg-subtle">{t("noNotes")}</p>
              ) : null}

              {!detailed && (
                <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
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
                        className="text-brand hover:underline"
                      />
                    </span>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </ul>

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
