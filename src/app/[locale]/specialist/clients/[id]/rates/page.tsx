"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import CardDashBoard from "@/components/Card/CardDashBoard";
import {
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaChartLine,
} from "react-icons/fa";

// Define the progress bar with session info
export interface ProgressBarWithSession {
  id: string;
  nameEn: string;
  nameAr: string;
  progressRate: number;
  sectionName: string;
  date: string;
  time: string;
  notes: string;
}

interface RatesPageProps {
  params: Promise<{ id: string }>;
}

export default function RatesPage({ params }: RatesPageProps) {
  const locale = useLocale();
  const t = useTranslations("");
  const [clientId, setClientId] = useState<string>("");

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
    });
  }, [params]);

  // Sample data - replace with actual API call
  // This should combine sessions data with progress bars
  const [progressBars, setProgressBars] = useState<ProgressBarWithSession[]>([
    {
      id: "1",
      nameEn: "Improvement",
      nameAr: "التحسن",
      progressRate: 75,
      sectionName: "Initial Assessment",
      date: "2024-01-15",
      time: "10:00",
      notes: "Initial assessment completed. Patient shows good progress.",
    },
    {
      id: "2",
      nameEn: "Communication Skills",
      nameAr: "مهارات التواصل",
      progressRate: 75,
      sectionName: "Initial Assessment",
      date: "2024-01-15",
      time: "10:00",
      notes: "Initial assessment completed. Patient shows good progress.",
    },
    {
      id: "3",
      nameEn: "Social Interaction",
      nameAr: "التفاعل الاجتماعي",
      progressRate: 60,
      sectionName: "Therapy Session 1",
      date: "2024-01-20",
      time: "14:30",
      notes: "First therapy session. Focused on communication skills.",
    },
    {
      id: "4",
      nameEn: "Behavior Management",
      nameAr: "إدارة السلوك",
      progressRate: 85,
      sectionName: "Follow-up Session",
      date: "2024-01-25",
      time: "11:00",
      notes: "Follow-up session to review progress and adjust treatment plan.",
    },
    {
      id: "5",
      nameEn: "Emotional Regulation",
      nameAr: "تنظيم المشاعر",
      progressRate: 70,
      sectionName: "Progress Review",
      date: "2024-02-01",
      time: "15:00",
      notes: "Progress review session. Significant improvements noted.",
    },
  ]);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "#10b981"; // green-500
    if (rate >= 50) return "#3b82f6"; // blue-500
    if (rate >= 30) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const handleProgressChange = (barId: string, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setProgressBars((prev) =>
      prev.map((bar) =>
        bar.id === barId ? { ...bar, progressRate: newValue } : bar
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <style jsx global>{`
        .rc-slider {
          padding: 8px 0;
        }
        .rc-slider-handle {
          border: 2px solid;
          cursor: grab;
        }
        .rc-slider-handle:active {
          cursor: grabbing;
        }
        .rc-slider-handle:hover {
          border-color: #0bb7b4 !important;
        }
        .rc-slider-handle-dragging {
          border-color: #0bb7b4 !important;
          box-shadow: 0 0 0 5px rgba(11, 183, 180, 0.2) !important;
        }
      `}</style>
      <CardDashBoard>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("rates.title") || "Rates"}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("rates.description") ||
              "View and manage all progress rates across sessions"}
          </p>
        </div>

        <div className="space-y-4">
          {progressBars.map((bar) => (
            <div
              key={bar.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              {/* Header Section */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${getProgressColor(bar.progressRate)}20`,
                      }}
                    >
                      <FaChartLine
                        className="text-base"
                        style={{ color: getProgressColor(bar.progressRate) }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">
                        {locale === "ar" ? bar.nameAr : bar.nameEn}
                      </h3>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="ml-13 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-primary/70 text-xs" />
                      <span className="font-medium text-gray-500">
                        {t("rates.section") || "Section"}:
                      </span>
                      <span className="text-gray-700">{bar.sectionName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-primary/70 text-xs" />
                      <span className="font-medium text-gray-500">
                        {t("rates.date") || "Date"}:
                      </span>
                      <span className="text-gray-700">{formatDate(bar.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-primary/70 text-xs" />
                      <span className="font-medium text-gray-500">
                        {t("rates.time") || "Time"}:
                      </span>
                      <span className="text-gray-700">{formatTime(bar.time)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Rate Badge */}
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-md"
                    style={{
                      backgroundColor: getProgressColor(bar.progressRate),
                    }}
                  >
                    {bar.progressRate}%
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="mb-4 px-1">
                <Slider
                  min={0}
                  max={100}
                  value={bar.progressRate}
                  onChange={(value) => handleProgressChange(bar.id, value)}
                  trackStyle={{
                    backgroundColor: getProgressColor(bar.progressRate),
                    height: 14,
                    borderRadius: "8px",
                  }}
                  handleStyle={{
                    borderColor: getProgressColor(bar.progressRate),
                    backgroundColor: "#fff",
                    width: 24,
                    height: 24,
                    marginTop: -5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    borderWidth: 3,
                  }}
                  railStyle={{
                    backgroundColor: "#e5e7eb",
                    height: 14,
                    borderRadius: "8px",
                  }}
                />
              </div>

              {/* Notes Section */}
              {bar.notes && (
                <div className="mt-4 rounded-lg bg-gray-50/80 p-4 border border-gray-100">
                  <div className="mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-primary text-sm" />
                    <p className="text-sm font-semibold text-gray-700">
                      {t("rates.notes") || "Notes"}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                    {bar.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
          {progressBars.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>{t("rates.noRates") || "No rates available yet"}</p>
            </div>
          )}
        </div>
      </CardDashBoard>
    </>
  );
}

