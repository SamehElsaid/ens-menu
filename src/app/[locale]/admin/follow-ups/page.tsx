"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  IoArrowBack,
  IoCallOutline,
  IoListOutline,
  IoRefreshOutline,
  IoSearchOutline,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import UserFollowUpCallsModal from "@/components/Admin/UserFollowUpCallsModal";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import FollowUpTeamPerformance from "@/components/Admin/FollowUpTeamPerformance";
import {
  createFollowUpCall,
  fetchFollowUpQueue,
  fetchFollowUpReport,
  followUpReportPeriodStart,
  formatFollowUpDateTime,
} from "@/lib/fetchAdminFollowUp";
import type {
  FollowUpQueueSegment,
  FollowUpQueueUser,
} from "@/types/AdminFollowUp";
import { toast } from "react-toastify";

const SEGMENTS: FollowUpQueueSegment[] = [
  "all",
  "new",
  "no-menu",
  "expiring",
  "inactive",
  "overdue",
  "free",
  "pro",
];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function matchesQueueSearch(user: FollowUpQueueUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (user.name.toLowerCase().includes(q)) return true;

  const phone = user.phoneNumber ?? "";
  if (phone.toLowerCase().includes(q)) return true;

  const qDigits = digitsOnly(q);
  if (qDigits && digitsOnly(phone).includes(qDigits)) return true;

  return false;
}

export default function AdminFollowUpsPage() {
  const locale = useLocale();
  const t = useTranslations("adminFollowUps");
  const router = useRouter();
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [segment, setSegment] = useState<FollowUpQueueSegment>("all");
  const [reportPeriod, setReportPeriod] = useState<"7d" | "30d">("7d");
  const [queue, setQueue] = useState<FollowUpQueueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [report, setReport] = useState<Awaited<
    ReturnType<typeof fetchFollowUpReport>
  > | null>(null);

  const [logTarget, setLogTarget] = useState<FollowUpQueueUser | null>(null);
  const [callsTarget, setCallsTarget] = useState<FollowUpQueueUser | null>(null);
  const [agentTarget, setAgentTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [queueData, reportData] = await Promise.all([
      fetchFollowUpQueue(locale, segment),
      fetchFollowUpReport(locale, reportPeriod),
    ]);
    setQueue(queueData.users);
    setIsDemo(Boolean(queueData._isDemoData || reportData._isDemoData));
    setReport(reportData);
    setLoading(false);
  }, [locale, segment, reportPeriod]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQueue = useMemo(
    () => queue.filter((user) => matchesQueueSearch(user, searchQuery)),
    [queue, searchQuery],
  );

  const handleLogSubmit = async (
    payload: Parameters<typeof createFollowUpCall>[1],
  ) => {
    if (!logTarget) return;
    setSubmitting(true);
    try {
      await createFollowUpCall(locale, payload, logTarget.name);
      toast.success(t("callSaved"));
      setLogTarget(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const mutedTextClass = "text-slate-500 dark:text-slate-400";
  const dashClass = "text-slate-400 dark:text-slate-500";

  const columnDefs = useMemo<ColDef<FollowUpQueueUser>[]>(
    () => [
      {
        headerName: t("columns.name"),
        field: "name",
        flex: 1,
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams<FollowUpQueueUser>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <button
              type="button"
              className="font-medium text-primary hover:underline text-start"
              onClick={() => router.push(`/admin/users/${row.id}`)}
            >
              {row.name}
            </button>
          );
        },
      },
      {
        headerName: t("columns.phone"),
        field: "phoneNumber",
        width: 140,
        cellRenderer: (params: ICellRendererParams<FollowUpQueueUser>) => {
          const phone = params.data?.phoneNumber;
          if (!phone) return <span className={dashClass}>—</span>;
          return (
            <PhoneDisplay
              value={phone}
              className="text-primary hover:underline"
              copyOnClick
              title={t("copyPhone")}
              onCopied={() => toast.success(t("phoneCopied"))}
              onCopyFailed={() => toast.error(t("copyFailed"))}
            />
          );
        },
      },
      {
        headerName: t("columns.plan"),
        field: "planName",
        width: 100,
      },
      {
        headerName: t("columns.menus"),
        field: "menusCount",
        width: 80,
      },
      {
        headerName: t("columns.lastCall"),
        width: 150,
        cellRenderer: (params: ICellRendererParams<FollowUpQueueUser>) => {
          const call = params.data?.lastCall;
          if (!call) return <span className={dashClass}>—</span>;
          return (
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {formatFollowUpDateTime(call.calledAt, locale).slice(0, 12)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.nextFollowUp"),
        field: "nextFollowUpAt",
        width: 120,
        cellRenderer: (params: ICellRendererParams<FollowUpQueueUser>) => {
          const date = params.data?.nextFollowUpAt;
          if (!date) return <span className={dashClass}>—</span>;
          const overdue = new Date(date).getTime() < Date.now();
          return (
            <span
              className={
                overdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-slate-700 dark:text-slate-300"
              }
            >
              {date}
            </span>
          );
        },
      },
      {
        headerName: t("columns.actions"),
        width: 220,
        sortable: false,
        pinned: locale === "ar" ? "left" : "right",
        cellRenderer: (params: ICellRendererParams<FollowUpQueueUser>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCallsTarget(row)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <IoListOutline />
                {t("viewCalls")}
              </button>
              <button
                type="button"
                onClick={() => setLogTarget(row)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
              >
                <IoCallOutline />
                {t("logCall")}
              </button>
            </div>
          );
        },
      },
    ],
    [dashClass, locale, router, t],
  );

  return (
    <div
      className="space-y-6 py-5 animate-fadeIn text-slate-800 dark:text-slate-100"
      dir={textDir}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary mb-2"
          >
            <IoArrowBack
              className={locale === "ar" ? "rotate-180" : undefined}
            />
            {t("backToAdmin")}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <IoRefreshOutline />
          {t("refresh")}
        </button>
      </div>

      {isDemo && <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />}

      {report && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-[280px]">
              <CardDashBoard>
                <p className={`text-xs ${mutedTextClass} mb-1`}>
                  {t("report.callsToday")}
                </p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {report.callsToday}
                </p>
              </CardDashBoard>
              <CardDashBoard>
                <p className={`text-xs ${mutedTextClass} mb-1`}>
                  {t("report.callsWeek")}
                </p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {report.callsThisWeek}
                </p>
              </CardDashBoard>
              <CardDashBoard>
                <p className={`text-xs ${mutedTextClass} mb-1`}>
                  {t("report.overdue")}
                </p>
                <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  {report.overdueCount}
                </p>
              </CardDashBoard>
              <CardDashBoard>
                <p className={`text-xs ${mutedTextClass} mb-1`}>
                  {t("report.answeredRate")}
                </p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {report.answeredRate}%
                </p>
              </CardDashBoard>
            </div>
            <div className="flex gap-2 shrink-0">
              {(["7d", "30d"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReportPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    reportPeriod === p
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {t(`teamReport.period.${p}`)}
                </button>
              ))}
            </div>
          </div>

          <FollowUpTeamPerformance
            report={report}
            dir={textDir}
            onAgentClick={(adminName) => setAgentTarget(adminName)}
          />
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSegment(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              segment === s
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {t(`segments.${s}`)}
          </button>
        ))}
      </div>

      <CardDashBoard>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t("queueTitle")}
        </h2>
        <div className="relative mb-4">
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-lg text-slate-400 ${locale === "ar" ? "right-3" : "left-3"}`}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("queueSearchPlaceholder")}
            dir={textDir}
            className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
              locale === "ar" ? "pr-10 pl-4 text-start" : "pl-10 pr-4"
            }`}
          />
        </div>
        {!loading && searchQuery.trim() && filteredQueue.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("queueNoResults")}
          </p>
        ) : (
          <DataTable<FollowUpQueueUser>
            rowData={filteredQueue}
            columnDefs={columnDefs}
            loading={loading}
            locale={locale}
            showRowNumbers
          />
        )}
      </CardDashBoard>

      {callsTarget && (
        <UserFollowUpCallsModal
          open
          onClose={() => setCallsTarget(null)}
          onChanged={() => void load()}
          filters={{ userId: callsTarget.id }}
          userName={callsTarget.name}
          phoneNumber={callsTarget.phoneNumber}
        />
      )}

      {agentTarget && (
        <UserFollowUpCallsModal
          open
          onClose={() => setAgentTarget(null)}
          onChanged={() => void load()}
          filters={{
            adminName: agentTarget,
            from: followUpReportPeriodStart(reportPeriod),
          }}
          adminName={agentTarget}
          showCustomer
        />
      )}

      {logTarget && (
        <LogFollowUpCallModal
          open
          onClose={() => setLogTarget(null)}
          userId={logTarget.id}
          userName={logTarget.name}
          phoneNumber={logTarget.phoneNumber}
          onSubmit={handleLogSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
