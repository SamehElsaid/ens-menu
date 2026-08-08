"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IoChevronForward } from "react-icons/io5";
import {
  Button,
  DataTable,
  EmptyState,
  type DataColumn,
} from "@/components/ui";
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
  const [phoneModal, setPhoneModal] = useState<{
    phone: string;
    name: string;
  } | null>(null);

  const columns: DataColumn<FollowUpCall>[] = [
    {
      id: "outcome",
      header: t("outcome"),
      align: "center",
      cell: (call) => <FollowUpOutcomeIcon outcome={call.outcome} size="sm" />,
    },
    {
      id: "date",
      header: t("columns.date"),
      numeric: true,
      cell: (call) => formatFollowUpDate(call.calledAt, locale),
    },
    {
      id: "name",
      header: t("columns.name"),
      primary: true,
      cell: (call) => getFollowUpCallDisplayName(call),
    },
    {
      id: "phone",
      header: t("columns.phone"),
      cell: (call) => {
        const phone = getFollowUpCallDisplayPhone(call);
        if (!phone) {
          return <span className="text-fg-subtle">{t("noPhone")}</span>;
        }
        return (
          <Button
            variant="link"
            size="sm"
            title={t("callNow")}
            onClick={(event) => {
              event.stopPropagation();
              setPhoneModal({
                phone,
                name: getFollowUpCallDisplayName(call),
              });
            }}
          >
            <PhoneDisplay value={phone} />
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={calls}
        getRowKey={(call) => call.id}
        caption={t("agentCallsTitle")}
        onRowClick={onSelect}
        empty={<EmptyState title={t("noCallsYet")} size="sm" />}
        rowActions={(call) => (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t("viewCallDetails")}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(call);
            }}
          >
            <IoChevronForward className="rtl:rotate-180" />
          </Button>
        )}
      />

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
