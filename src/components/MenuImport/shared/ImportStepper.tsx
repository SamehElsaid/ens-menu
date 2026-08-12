"use client";

import { useTranslations } from "next-intl";
import type { ImportStep } from "@/types/menuImport";
import { IoCheckmarkSharp } from "react-icons/io5";
import { cn } from "@/lib/cn";

const STEPS: ImportStep[] = ["upload", "processing", "review"];

interface ImportStepperProps {
  currentStep: ImportStep;
}

/**
 * The progress strip above the wizard.
 *
 * Three cells divided inside one rounded, elevated strip, each carrying its own
 * ordinal. It replaced a pill-and-progress-bar widget because a wizard with
 * three steps does not need a percentage — it needs to say which step is live,
 * and a numbered cell in a divided strip says that without any moving parts.
 *
 * State is carried three ways so it survives greyscale: the live step is a
 * filled purple ordinal on a tinted cell with a semibold label; a finished step
 * keeps the fill but swaps its ordinal for a checkmark and mutes its label; a
 * step still to come is an outlined ordinal in subtle grey.
 *
 * On an advance the strip passes a baton rather than redrawing: the finished
 * cell's ordinal crossfades into its checkmark while its fill settles to brand,
 * and the new live cell's underscore draws from the inline start. Both are
 * `--dur-settle`, both are CSS, and the ordinals are stacked so no cell changes
 * width while it happens.
 */
export default function ImportStepper({ currentStep }: ImportStepperProps) {
  const t = useTranslations("MenuImport");

  const stepIndex = STEPS.indexOf(
    currentStep === "error" ? "processing" : currentStep,
  );

  const labels = [t("stepUpload"), t("stepProcessing"), t("stepReview")];

  return (
    <ol className="flex overflow-hidden rounded-xl border border-line bg-surface">
      {STEPS.map((step, index) => {
        const isComplete = index < stepIndex;
        const isCurrent = index === stepIndex;

        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "relative flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 sm:px-3",
              index > 0 && "border-s border-line",
              isCurrent && "bg-surface-2",
              /* A horizontal rail cannot carry the inline-start edge marker the
                 nav rows use, so the live cell is underscored instead — same
                 idea, rotated to the axis the rail runs on. */
              isCurrent &&
                "ui-step-live after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:content-['']",
            )}
          >
            <span
              className={cn(
                "ui-swap ui-figure size-6 shrink-0 rounded-sm text-[11px] leading-none",
                "transition-[background-color,color] duration-(--dur-settle) ease-(--ease-settle)",
                isComplete && "bg-brand text-on-brand",
                isCurrent && "bg-accent text-on-accent",
                !isComplete &&
                  !isCurrent &&
                  "border border-line text-fg-subtle",
              )}
              aria-hidden
            >
              <span className={isComplete ? "opacity-0" : "opacity-100"}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <IoCheckmarkSharp
                className={cn("size-3.5", isComplete ? "opacity-100" : "opacity-0")}
              />
            </span>

            <span
              className={cn(
                "truncate text-xs sm:text-[13px]",
                isCurrent
                  ? "font-semibold text-fg"
                  : isComplete
                    ? "font-medium text-fg-muted"
                    : "text-fg-subtle",
              )}
            >
              {labels[index]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
