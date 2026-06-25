import { useLocale, useTranslations } from "next-intl";
import { IoTimeOutline } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { DomainTransferRequest } from "@/types/DomainTransfer";

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function historyBadgeClass(item: DomainTransferRequest): string {
  if (item.status === "completed") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

function historyOutcomeKey(item: DomainTransferRequest): string {
  if (item.status === "completed") return "accepted";
  if (item.cancelledBy === "user") return "cancelledByUser";
  return "cancelledByAdmin";
}

type DomainTransferHistoryProps = {
  history: DomainTransferRequest[];
};

export default function DomainTransferHistory({
  history,
}: DomainTransferHistoryProps) {
  const locale = useLocale();
  const t = useTranslations("domainTransfer.history");

  return (
    <CardDashBoard>
      <div className="mb-4 flex items-center gap-2">
        <IoTimeOutline className="text-lg text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t("title")}
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((item) => {
            const resolvedAt =
              item.status === "completed"
                ? item.completedAt
                : item.cancelledAt;

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-mono text-sm font-medium text-slate-900 dark:text-white"
                    dir="ltr"
                  >
                    {item.domainUrl}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${historyBadgeClass(item)}`}
                >
                  {t(`outcome.${historyOutcomeKey(item)}`)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CardDashBoard>
  );
}
