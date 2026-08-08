"use client";

import { useTranslations } from "next-intl";
import {
  Badge,
  Button,
  EmptyState,
  SectionHeader,
  Table,
  TableShell,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import {
  AdminRankedList,
  AdminSectionCard,
} from "@/components/Admin/AdminAnalyticsWidgets";
import type { FollowUpReportSummary } from "@/types/AdminFollowUp";
import { formatFollowUpPurpose } from "@/lib/fetchAdminFollowUp";
import { IoPeopleOutline, IoStatsChartOutline } from "react-icons/io5";

type FollowUpTeamPerformanceProps = {
  report: FollowUpReportSummary;
  dir?: "rtl" | "ltr";
  onAgentClick?: (adminName: string) => void;
};

export default function FollowUpTeamPerformance({
  report,
  dir = "ltr",
  onAgentClick,
}: FollowUpTeamPerformanceProps) {
  const t = useTranslations("adminFollowUps.teamReport");
  const tFollowUps = useTranslations("adminFollowUps");

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
      label: formatFollowUpPurpose(item.purpose, tFollowUps),
      count: item.count,
    }));

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      <SectionHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          report.period ? (
            <Badge tone="neutral" size="md">
              {t(`period.${report.period}`)}
            </Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            onItemClick={
              onAgentClick
                ? (item) => onAgentClick(String(item.label))
                : undefined
            }
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

      <div className="flex flex-col gap-3">
        <SectionHeader title={t("tableTitle")} />

        {teamStats.length === 0 ? (
          <EmptyState title={t("noTeamData")} size="sm" />
        ) : (
          <TableShell>
            <Table caption={t("tableTitle")} className="min-w-[640px]">
              <thead>
                <tr>
                  <Th>{t("columns.agent")}</Th>
                  <Th align="center" numeric>
                    {t("columns.calls")}
                  </Th>
                  <Th align="center" numeric>
                    {t("columns.answeredRate")}
                  </Th>
                  <Th align="center" numeric>
                    {t("columns.overdue")}
                  </Th>
                  <Th align="center" numeric>
                    {t("columns.onboarding")}
                  </Th>
                  <Th align="center" numeric>
                    {t("columns.upgrade")}
                  </Th>
                  <Th align="center" numeric>
                    {t("columns.callbacks")}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((row) => (
                  <Tr key={row.adminName}>
                    <Td className="font-medium">
                      {onAgentClick ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onAgentClick(row.adminName)}
                        >
                          {row.adminName}
                        </Button>
                      ) : (
                        <span className="text-fg">{row.adminName}</span>
                      )}
                    </Td>
                    <Td align="center" numeric className="font-semibold">
                      {onAgentClick ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onAgentClick(row.adminName)}
                        >
                          {row.totalCalls}
                        </Button>
                      ) : (
                        row.totalCalls
                      )}
                    </Td>
                    <Td align="center" numeric>
                      <span
                        className={
                          row.answeredRate >= 50
                            ? "font-medium text-success"
                            : "text-fg-muted"
                        }
                      >
                        {row.answeredRate}%
                      </span>
                    </Td>
                    <Td align="center" numeric>
                      {row.overdueFollowUps > 0 ? (
                        <span className="font-medium text-danger">
                          {row.overdueFollowUps}
                        </span>
                      ) : (
                        <span className="text-fg-subtle">0</span>
                      )}
                    </Td>
                    <Td align="center" numeric>
                      {row.onboardingCalls}
                    </Td>
                    <Td align="center" numeric>
                      {row.upgradeCalls}
                    </Td>
                    <Td align="center" numeric>
                      {row.callbackRequested}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableShell>
        )}
      </div>
    </div>
  );
}
