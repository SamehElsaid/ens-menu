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
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import UserFollowUpCallsModal from "@/components/Admin/UserFollowUpCallsModal";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import FollowUpTeamPerformance from "@/components/Admin/FollowUpTeamPerformance";
import {
  Button,
  NoResultsState,
  PageHeader,
  SearchInput,
  SectionHeader,
  SegmentedControl,
  buttonClasses,
} from "@/components/ui";
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
  const tCommon = useTranslations("common");
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
      const result = await createFollowUpCall(locale, payload, logTarget.name);
      if (!result.call) {
        toast.error(t("callSaveError"));
        return;
      }
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
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                <IoListOutline />
                {t("viewCalls")}
              </button>
              <button
                type="button"
                onClick={() => setLogTarget(row)}
                className={buttonClasses({ variant: "subtle", size: "sm" })}
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
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              startIcon={<IoArrowBack className="rtl:rotate-180" />}
              onClick={() => router.push("/admin")}
            >
              {t("backToAdmin")}
            </Button>
            <Button
              variant="secondary"
              startIcon={<IoRefreshOutline />}
              onClick={() => void load()}
            >
              {t("refresh")}
            </Button>
          </>
        }
      />

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
            <SegmentedControl
              label={t("title")}
              value={reportPeriod}
              onChange={setReportPeriod}
              size="sm"
              options={(["7d", "30d"] as const).map((p) => ({
                value: p,
                label: t(`teamReport.period.${p}`),
              }))}
            />
          </div>

          <FollowUpTeamPerformance
            report={report}
            dir={textDir}
            onAgentClick={(adminName) => setAgentTarget(adminName)}
          />
        </>
      )}

      <SegmentedControl
        label={t("queueTitle")}
        value={segment}
        onChange={setSegment}
        options={SEGMENTS.map((s) => ({
          value: s,
          label: t(`segments.${s}`),
        }))}
      />

      <CardDashBoard>
        <SectionHeader title={t("queueTitle")} className="mb-4" />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("queueSearchPlaceholder")}
          label={t("queueSearchPlaceholder")}
          className="mb-4"
        />
        {!loading && searchQuery.trim() && filteredQueue.length === 0 ? (
          <NoResultsState
            title={t("queueNoResults")}
            onClear={() => setSearchQuery("")}
            clearLabel={tCommon("clearSearch")}
          />
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
