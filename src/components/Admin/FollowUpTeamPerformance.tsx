"use client";

import { useTranslations } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import {
  AdminRankedList,
  AdminSectionCard,
} from "@/components/Admin/AdminAnalyticsWidgets";
import type { FollowUpReportSummary } from "@/types/AdminFollowUp";
import { IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";

type FollowUpTeamPerformanceProps = {
  report: FollowUpReportSummary;
  dir?: "rtl" | "ltr";
};

export default function FollowUpTeamPerformance({
  report,
  dir = "ltr",
}: FollowUpTeamPerformanceProps) {
  const t = useTranslations("adminFollowUps.teamReport");
  const isRTL = dir === "rtl";

  const teamStats = report.teamStats ?? [];
  const rankedItems = teamStats.map((row, index) => ({
    id: `${row.adminName}-${index}`,
    label: row.adminName,
    count: row.totalCalls,
  }));

  const purposeItems = (report.purposesBreakdown ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      id: item.purpose,
      label: t(`purposes.${item.purpose}`),
      count: item.count,
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        {report.period && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {t(`period.${report.period}`)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminSectionCard
          title={t("leaderboardTitle")}
          subtitle={t("leaderboardHint")}
          icon={<IoPeopleOutline />}
          dir={dir}
        >
          <AdminRankedList
            items={rankedItems}
            dir={dir}
            emptyMessage={t("noTeamData")}
          />
        </AdminSectionCard>

        <AdminSectionCard
          title={t("purposesTitle")}
          subtitle={t("purposesHint")}
          icon={<IoStatsChartOutline />}
          dir={dir}
        >
          <AdminRankedList
            items={purposeItems}
            dir={dir}
            emptyMessage={t("noPurposeData")}
          />
        </AdminSectionCard>
      </div>

      <CardDashBoard>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t("tableTitle")}
        </h3>

        {teamStats.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            {t("noTeamData")}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table
              className="w-full min-w-[640px] text-sm"
              dir={dir}
            >
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className={`py-2 font-medium ${isRTL ? "text-right" : "text-left"}`}>
                    {t("columns.agent")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.calls")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.answeredRate")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.overdue")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.onboarding")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.upgrade")}
                  </th>
                  <th className="py-2 font-medium text-center">
                    {t("columns.callbacks")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((row) => (
                  <tr
                    key={row.adminName}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <td className={`py-3 font-medium text-slate-900 dark:text-slate-100 ${isRTL ? "text-right" : "text-left"}`}>
                      {row.adminName}
                    </td>
                    <td className="py-3 text-center tabular-nums font-semibold text-primary">
                      {row.totalCalls}
                    </td>
                    <td className="py-3 text-center tabular-nums">
                      <span
                        className={
                          row.answeredRate >= 50
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      >
                        {row.answeredRate}%
                      </span>
                    </td>
                    <td className="py-3 text-center tabular-nums">
                      {row.overdueFollowUps > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {row.overdueFollowUps}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300">
                      {row.onboardingCalls}
                    </td>
                    <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300">
                      {row.upgradeCalls}
                    </td>
                    <td className="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300">
                      {row.callbackRequested}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardDashBoard>
    </div>
  );
}
