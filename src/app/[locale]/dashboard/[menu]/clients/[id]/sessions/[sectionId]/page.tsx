"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ProgressBarFormModal, {
  ProgressBarFormValues,
} from "@/components/Custom/ProgressBarFormModal";
import { FaFileAlt, FaPlus } from "react-icons/fa";
import CustomInput from "@/components/Custom/CustomInput";


// Define the progress bar data type
export interface ProgressBar {
  id: string;
  nameEn: string;
  nameAr: string;
  progressRate: number;
}

interface SectionPageProps {
  params: Promise<{ id: string; sectionId: string }>;
}

export default function SectionPage({ params }: SectionPageProps) {
  const locale = useLocale();
  const t = useTranslations("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  console.log(clientId, sectionId);

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
      setSectionId(resolvedParams.sectionId);
    });
  }, [params]);

  // Sample data - replace with actual API call
  const [progressBars, setProgressBars] = useState<ProgressBar[]>([
    {
      id: "1",
      nameEn: "Improvement",
      nameAr: "التحسن",
      progressRate: 75,
    },
    {
      id: "2",
      nameEn: "Communication Skills",
      nameAr: "مهارات التواصل",
      progressRate: 75,
    },
    {
      id: "3",
      nameEn: "Social Interaction",
      nameAr: "التفاعل الاجتماعي",
      progressRate: 60,
    },
    {
      id: "4",
      nameEn: "Behavior Management",
      nameAr: "إدارة السلوك",
      progressRate: 85,
    },
  ]);

  const handleAddProgressBar = (values: ProgressBarFormValues) => {
    const newProgressBar: ProgressBar = {
      id: Date.now().toString(),
      ...values,
    };
    setProgressBars((prev) => [...prev, newProgressBar]);
    setIsModalOpen(false);
  };

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
      <div className="space-y-6">
        {/* Progress Bars Section */}
        <CardDashBoard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("section.progressBars") || "Progress Bars"}
              </h1>
              <p className="text-gray-500 mt-1">
                {t("section.progressBarsDescription") ||
                  "Track and manage progress indicators"}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <FaPlus className="text-sm" />
              <span>
                {t("progressBar.addProgressBar") || "Add Progress Bar"}
              </span>
            </button>
          </div>

          <div className="space-y-6">
            {progressBars.map((bar) => (
              <div key={bar.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {locale === "ar" ? bar.nameAr : bar.nameEn}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">
                    {bar.progressRate}%
                  </span>
                </div>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={100}
                    value={bar.progressRate}
                    onChange={(value) => handleProgressChange(bar.id, value)}
                    trackStyle={{
                      backgroundColor: getProgressColor(bar.progressRate),
                      height: 12,
                    }}
                    handleStyle={{
                      borderColor: getProgressColor(bar.progressRate),
                      backgroundColor: "#fff",
                      width: 20,
                      height: 20,
                      marginTop: -4,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                    railStyle={{
                      backgroundColor: "#e5e7eb",
                      height: 12,
                    }}
                  />
                </div>
              </div>
            ))}
            {progressBars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {t("section.noProgressBars") || "No progress bars added yet"}
                </p>
                <p className="text-sm mt-1">
                  {t("section.addFirstProgressBar") ||
                    "Click 'Add Progress Bar' to get started"}
                </p>
              </div>
            )}
          </div>
        </CardDashBoard>

        {/* Notes Section */}
        <CardDashBoard>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {t("section.notes") || "Notes"}
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {t("section.notesDescription") ||
                "Add your notes and observations here"}
            </p>
          </div>
          <div>
            <CustomInput
              icon={<FaFileAlt />}
              id="notes"
              rows={8}
              type="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                t("section.notesPlaceholder") || "Enter your notes here..."
              }
            />
          </div>
        </CardDashBoard>
      </div>

      <ProgressBarFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProgressBar}
      />
    </>
  );
}
