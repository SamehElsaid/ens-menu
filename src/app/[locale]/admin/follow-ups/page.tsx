"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  IoCallOutline,
  IoListOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import LogFollowUpCallModal from "@/components/Admin/LogFollowUpCallModal";
import UserFollowUpCallsModal from "@/components/Admin/UserFollowUpCallsModal";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import FollowUpTeamPerformance from "@/components/Admin/FollowUpTeamPerformance";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  NoResultsState,
  PageHeader,
  PageShell,
  SearchInput,
  SectionHeader,
  SegmentedControl,
  StatCard,
  StatGrid,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
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
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();
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
  const [callsTarget, setCallsTarget] = useState<FollowUpQueueUser | null>(
    null,
  );
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

  const dashClass = "text-fg-subtle";

  const columns = useMemo<DataColumn<FollowUpQueueUser>[]>(
    () => [
      {
        id: "name",
        header: t("columns.name"),
        primary: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <button
            type="button"
            className="text-start font-medium text-fg hover:underline"
            onClick={() => router.push(`/admin/users/${row.id}`)}
          >
            {row.name}
          </button>
        ),
      },
      {
        id: "phone",
        header: t("columns.phone"),
        cell: (row) =>
          row.phoneNumber ? (
            <PhoneDisplay
              value={row.phoneNumber}
              className="font-mono text-[12px] text-fg-muted hover:underline"
              copyOnClick
              title={t("copyPhone")}
              onCopied={() => toast.success(t("phoneCopied"))}
              onCopyFailed={() => toast.error(t("copyFailed"))}
            />
          ) : (
            <span className={dashClass}>—</span>
          ),
      },
      {
        id: "plan",
        header: t("columns.plan"),
        sortValue: (row) => row.planName,
        cell: (row) => (
          <span className="text-fg-muted">{row.planName ?? "—"}</span>
        ),
      },
      {
        id: "menus",
        header: t("columns.menus"),
        numeric: true,
        align: "end",
        sortValue: (row) => row.menusCount ?? 0,
        cell: (row) => (
          <span className="ui-figure text-[12px]" lang="en">
            {row.menusCount ?? 0}
          </span>
        ),
      },
      {
        id: "lastCall",
        header: t("columns.lastCall"),
        numeric: true,
        hideOnMobile: true,
        sortValue: (row) =>
          row.lastCall ? new Date(row.lastCall.calledAt) : null,
        cell: (row) =>
          row.lastCall ? (
            <span className="ui-figure text-[12px] text-fg-muted" lang="en">
              {formatFollowUpDateTime(row.lastCall.calledAt, locale).slice(
                0,
                12,
              )}
            </span>
          ) : (
            <span className={dashClass}>—</span>
          ),
      },
      {
        id: "nextFollowUp",
        header: t("columns.nextFollowUp"),
        numeric: true,
        sortValue: (row) =>
          row.nextFollowUpAt ? new Date(row.nextFollowUpAt) : null,
        cell: (row) => {
          const date = row.nextFollowUpAt;
          if (!date) return <span className={dashClass}>—</span>;
          const overdue = new Date(date).getTime() < Date.now();
          // An overdue date is the one thing on this row worth interrupting for,
          // so it is a badge rather than a differently coloured date.
          return overdue ? (
            <Badge tone="danger" dot>
              <span className="ui-figure" lang="en">
                {date}
              </span>
            </Badge>
          ) : (
            <span className="ui-figure text-[12px] text-fg-muted" lang="en">
              {date}
            </span>
          );
        },
      },
    ],
    [dashClass, locale, router, t],
  );

  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              <Button
                variant="secondary"
                startIcon={<IoRefreshOutline />}
                onClick={() => void load()}
              >
                {t("refresh")}
              </Button>
            }
          />

          {isDemo && (
            <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
          )}
        </>
      }
    >
      {/* Two regions, not one template: how the team is doing, then who to ring
          next. The period switch belongs to the first region only, so it sits in
          that section's own header rather than in a page-level filter bar that
          would appear to govern the queue below it as well. */}
      {loading || report ? (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title={t("report.title")}
            ruled
            actions={
              <SegmentedControl
                label={t("report.title")}
                value={reportPeriod}
                onChange={setReportPeriod}
                size="sm"
                disabled={loading}
                options={(["7d", "30d"] as const).map((p) => ({
                  value: p,
                  label: t(`teamReport.period.${p}`),
                }))}
              />
            }
          />

          <StatGrid columns={4} ruled>
            <StatCard
              label={t("report.callsToday")}
              loading={loading}
              value={<span lang="en">{report?.callsToday ?? 0}</span>}
            />
            <StatCard
              label={t("report.callsWeek")}
              loading={loading}
              value={<span lang="en">{report?.callsThisWeek ?? 0}</span>}
            />
            <StatCard
              label={t("report.overdue")}
              loading={loading}
              value={<span lang="en">{report?.overdueCount ?? 0}</span>}
              hint={
                (report?.overdueCount ?? 0) > 0 ? (
                  <Badge tone="danger" dot>
                    {t("segments.overdue")}
                  </Badge>
                ) : undefined
              }
            />
            <StatCard
              label={t("report.answeredRate")}
              loading={loading}
              value={<span lang="en">{report?.answeredRate ?? 0}%</span>}
            />
          </StatGrid>

          {report ? (
            <FollowUpTeamPerformance
              report={report}
              dir={textDir}
              onAgentClick={(adminName) => setAgentTarget(adminName)}
            />
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionHeader title={t("queueTitle")} ruled />
        <Toolbar
          search={
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("queueSearchPlaceholder")}
              label={t("queueSearchPlaceholder")}
            />
          }
          filters={
            <SegmentedControl
              label={t("queueTitle")}
              value={segment}
              onChange={setSegment}
              size="sm"
              options={SEGMENTS.map((s) => ({
                value: s,
                label: t(`segments.${s}`),
              }))}
            />
          }
        />
        <DataTable<FollowUpQueueUser>
          columns={columns}
          rows={filteredQueue}
          getRowKey={(row) => String(row.id)}
          caption={t("queueTitle")}
          loading={loading}
          defaultSortColumnId="nextFollowUp"
          sortLocale={locale}
          tableId="admin-follow-ups"
          stickyHeader
          densityControl
          labels={tableLabels}
          empty={
            /* An empty queue is good news — nobody is overdue — and saying "no
               results match your search" for it was both wrong and alarming. */
            searchQuery.trim() ? (
              <NoResultsState
                title={t("queueNoResults")}
                onClear={() => setSearchQuery("")}
                clearLabel={tCommon("clearSearch")}
              />
            ) : (
              <EmptyState
                title={t("queueEmpty")}
                description={t("queueEmptyDescription")}
                size="sm"
              />
            )
          }
          rowActions={(row) => (
            <span className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                startIcon={<IoListOutline />}
                onClick={() => setCallsTarget(row)}
              >
                {t("viewCalls")}
              </Button>
              <Button
                variant="subtle"
                size="sm"
                startIcon={<IoCallOutline />}
                onClick={() => setLogTarget(row)}
              >
                {t("logCall")}
              </Button>
            </span>
          )}
        />
      </section>

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
    </PageShell>
  );
}
