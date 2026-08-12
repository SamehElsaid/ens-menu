import { useLocale, useTranslations } from "next-intl";
import { IoTimeOutline } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import type { StatusTone } from "@/components/ui";
import type { DomainTransferRequest } from "@/types/DomainTransfer";

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function historyOutcomeTone(item: DomainTransferRequest): StatusTone {
  return item.status === "completed" ? "success" : "danger";
}

function historyOutcomeKey(item: DomainTransferRequest): string {
  if (item.status === "completed") return "accepted";
  if (item.cancelledBy === "user") return "cancelledByUser";
  return "cancelledByAdmin";
}

type DomainTransferHistoryProps = {
  history: DomainTransferRequest[];
};

/**
 * Closed requests, as a ledger.
 *
 * The domain is the row's identity and stays in mono — it is a machine string
 * the reader compares character by character — and the dates sit under it as a
 * ticket line. The outcome is a badge with a dot rather than a tinted pill, so
 * accepted and cancelled are told apart by shape as well as hue.
 */
export default function DomainTransferHistory({
  history,
}: DomainTransferHistoryProps) {
  const locale = useLocale();
  const t = useTranslations("domainTransfer.history");

  return (
    <CardDashBoard>
      <SectionHeader
        ruled
        className="mb-3"
        title={
          <span className="inline-flex items-center gap-2">
            <IoTimeOutline className="shrink-0 text-fg-subtle" aria-hidden />
            {t("title")}
          </span>
        }
      />

      {history.length === 0 ? (
        <EmptyState size="sm" icon={<IoTimeOutline />} title={t("empty")} />
      ) : (
        <ul className="-mx-4 divide-y divide-line border-y border-line sm:-mx-5">
          {history.map((item) => {
            const resolvedAt =
              item.status === "completed" ? item.completedAt : item.cancelledAt;

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="ui-figure truncate text-[13px] text-fg"
                    dir="ltr"
                  >
                    {item.domainUrl}
                  </p>
                  <p className="ui-label mt-1">
                    {t("submitted", {
                      date: formatDateTime(item.createdAt, locale),
                    })}
                    {resolvedAt && (
                      <>
                        {" · "}
                        {t("resolved", {
                          date: formatDateTime(resolvedAt, locale),
                        })}
                      </>
                    )}
                  </p>
                </div>
                <Badge tone={historyOutcomeTone(item)} dot>
                  {t(`outcome.${historyOutcomeKey(item)}`)}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </CardDashBoard>
  );
}
