"use client";

import { useTranslations } from "next-intl";
import type { ImportStep } from "@/types/menuImport";
import { IoCheckmarkCircle, IoEllipseOutline } from "react-icons/io5";

const STEPS: ImportStep[] = ["upload", "processing", "review"];

interface ImportStepperProps {
  currentStep: ImportStep;
}

export default function ImportStepper({ currentStep }: ImportStepperProps) {
  const t = useTranslations("MenuImport");

  const stepIndex = STEPS.indexOf(
    currentStep === "error" ? "processing" : currentStep,
  );

  const labels = [t("stepUpload"), t("stepProcessing"), t("stepReview")];

  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-xl mx-auto">
      {STEPS.map((step, index) => {
        const isComplete = index < stepIndex;
        const isCurrent = index === stepIndex;

        return (
          <li key={step} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {isComplete ? (
                <IoCheckmarkCircle className="text-emerald-500 text-xl shrink-0" />
              ) : (
                <IoEllipseOutline
                  className={`text-xl shrink-0 ${
                    isCurrent ? "text-primary" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              )}
              <span
                className={`text-xs sm:text-sm font-medium truncate ${
                  isCurrent
                    ? "text-primary"
                    : isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {labels[index]}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`hidden sm:block h-0.5 flex-1 rounded-full ${
                  index < stepIndex ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
