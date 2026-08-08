"use client";

import { useTranslations } from "next-intl";
import type { ImportStep } from "@/types/menuImport";
import {
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoRadioButtonOn,
} from "react-icons/io5";
import { cn } from "@/lib/cn";

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
    <ol className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const isComplete = index < stepIndex;
        const isCurrent = index === stepIndex;

        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              {/* Completed steps carry a checkmark, so state is never colour alone. */}
              {isComplete ? (
                <IoCheckmarkCircle
                  className="shrink-0 text-xl text-success"
                  aria-hidden
                />
              ) : isCurrent ? (
                <IoRadioButtonOn
                  className="shrink-0 text-xl text-brand"
                  aria-hidden
                />
              ) : (
                <IoEllipseOutline
                  className="shrink-0 text-xl text-fg-subtle"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "truncate text-xs font-medium sm:text-sm",
                  isCurrent
                    ? "text-brand"
                    : isComplete
                      ? "text-success"
                      : "text-fg-subtle",
                )}
              >
                {labels[index]}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "hidden h-0.5 flex-1 rounded-full sm:block",
                  index < stepIndex ? "bg-success" : "bg-line-strong",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
