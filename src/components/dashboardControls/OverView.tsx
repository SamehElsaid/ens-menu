"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { FaClock, FaChartLine, FaCheck, FaCalendarAlt } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";

// Define the overview session data type
export interface OverviewSession {
  id: string;
  sectionName: string;
  date: string;
  improvementRate: number;
  time: string;
  attended?: boolean; // Whether the session was attended/completed
  status?: "attended" | "pending"; // Session status
}

// Define timeline activity type
export interface TimelineActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "meeting" | "project" | "file" | "status";
  color: string;
  files?: { name: string; type: "document" | "spreadsheet" }[];
  person?: {
    name: string;
    role: string;
    company?: string;
    avatar?: string;
  };
}

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default function OverView({}: OverviewPageProps) {
  const locale = useLocale();
  const t = useTranslations("");

  // Sample data - replace with actual API call
  const [rowData] = useState<OverviewSession[]>([
    {
      id: "1",
      sectionName: "Initial Assessment",
      date: "2024-01-15",
      improvementRate: 78,
      time: "10:00",
      attended: true,
      status: "attended",
    },
    {
      id: "2",
      sectionName: "Therapy Session 1",
      date: "2024-01-20",
      improvementRate: 18,
      time: "14:30",
      attended: true,
      status: "attended",
    },
    {
      id: "3",
      sectionName: "Follow-up Session",
      date: "2024-01-25",
      improvementRate: 62,
      time: "11:00",
      attended: true,
      status: "attended",
    },
    {
      id: "4",
      sectionName: "Progress Review",
      date: "2024-02-01",
      improvementRate: 92,
      time: "15:00",
      attended: true,
      status: "attended",
    },
    {
      id: "5",
      sectionName: "Behavioral Therapy",
      date: "2024-02-05",
      improvementRate: 49,
      time: "09:30",
      attended: false,
      status: "pending",
    },
    {
      id: "6",
      sectionName: "Communication Skills",
      date: "2024-02-10",
      improvementRate: 88,
      time: "13:15",
      attended: true,
      status: "attended",
    },
    {
      id: "7",
      sectionName: "Social Skills Training",
      date: "2024-02-15",
      improvementRate: 75,
      time: "16:45",
      attended: false,
      status: "pending",
    },
  ]);

  // Convert sessions to timeline format
  const timelineSessions = useMemo(() => {
    return rowData
      .map((session) => {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timestamp = "";
        if (diffDays === 0) {
          timestamp = t("overview.timeline.today") || "Today";
        } else if (diffDays === 1) {
          timestamp = t("overview.timeline.yesterday") || "Yesterday";
        } else if (diffDays < 7) {
          timestamp = `${diffDays} ${
            t("overview.timeline.daysAgo") || "Days Ago"
          }`;
        } else {
          timestamp = sessionDate.toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
        }

        const [hours, minutes] = session.time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        const formattedTime = `${displayHour}:${minutes} ${ampm}`;

        return {
          id: session.id,
          title: session.sectionName,
          description: `${
            t("overview.timeline.sessionAt") || "Session at"
          } ${formattedTime}`,
          timestamp,
          date: session.date,
          time: session.time,
          improvementRate: session.improvementRate,
          attended: session.attended || false,
          color: session.attended ? "bg-green-500" : "bg-gray-400",
        };
      })
      .sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [rowData, locale, t]);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-blue-500";
    if (rate >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Column definitions
  const columnDefs: ColDef<OverviewSession>[] = useMemo(
    () => [
      {
        headerName: t("overview.sectionName") || "Section Name",
        field: "sectionName",
        sortable: true,
        flex: 1,
        minWidth: 200,
        cellStyle: {
          fontWeight: "600",
          color: "#1e293b",
        },
      },
      {
        headerName: t("overview.date") || "Date",
        field: "date",
        sortable: true,
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString(
            locale === "ar" ? "ar-SA" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
        },
      },
      {
        headerName: t("overview.improvement") || "Improvement",
        field: "improvementRate",
        sortable: true,
        flex: 1,
        minWidth: 300,
        cellRenderer: (params: ICellRendererParams<OverviewSession>) => {
          const session = params.data as OverviewSession;
          if (!session) return null;

          return (
            <div className="flex items-center gap-3 w-full h-full py-2">
              <div className="flex-1 min-w-0">
                <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner border border-gray-300/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(
                      session.improvementRate
                    )} flex items-center justify-end pr-2.5 shadow-sm`}
                    style={{ width: `${session.improvementRate}%` }}
                  >
                    {session.improvementRate > 15 && (
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {session.improvementRate}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {session.improvementRate <= 15 && (
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap px-2 py-1 bg-gray-100 rounded-md">
                  {session.improvementRate}%
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: t("overview.time") || "Time",
        field: "time",
        sortable: true,
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          const [hours, minutes] = params.value.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        },
      },
    ],
    [locale, t]
  );

  return (
    <div className="space-y-6">
      {/* Sessions Table */}
      <CardDashBoard className="shadow-lg">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaChartLine className="text-primary text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("overview.title") || "Overview"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {t("overview.description") ||
                  "View all sessions with their improvement rates"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg">
          <DataTable<OverviewSession>
            rowData={rowData}
            columnDefs={columnDefs}
            height="auto"
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowSelection={false}
            showRowNumbers={true}
            locale={locale}
          />
        </div>
      </CardDashBoard>

      {/* Timeline Section */}
      <CardDashBoard className="shadow-lg">
        <div className="flex items-center justify-between mb-6 pb-4 ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaCalendarAlt className="text-purple-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("overview.timeline.title") || "Sessions Timeline"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("overview.timeline.description") ||
                  "All sessions with attendance status"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Timeline Items */}
          <div className="space-y-6">
            {timelineSessions.map((session) => (
              <div
                key={session.id}
                className={`relative flex gap-5 rounded-lg p-4 ${
                  session.attended
                    ? "bg-green-50/30 border border-green-100"
                    : "bg-gray-50/30 border border-gray-200"
                }`}
              >
                {/* Dot with Check Mark */}
                <div className="relative z-10 shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full ${session.color} border-4 border-white shadow-lg flex items-center justify-center`}
                  >
                    {session.attended ? (
                      <FaCheck className="text-white text-lg font-bold" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {session.title}
                        </h3>
                        {session.attended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <FaCheck className="text-xs" />
                            {t("overview.timeline.attended") || "Attended"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {session.description}
                      </p>

                      {/* Session Details */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>
                            {new Date(session.date).toLocaleDateString(
                              locale === "ar" ? "ar-SA" : "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaClock className="text-gray-400" />
                          <span>
                            {(() => {
                              const [hours, minutes] = session.time.split(":");
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? "PM" : "AM";
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes} ${ampm}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                                session.improvementRate
                              )}`}
                              style={{ width: `${session.improvementRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {session.improvementRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 shadow-sm border border-gray-200">
                      <FaClock className="text-xs" />
                      <span>{session.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardDashBoard>

    </div>
  );
}
