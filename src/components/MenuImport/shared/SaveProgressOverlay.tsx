"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Modal, Spinner } from "@/components/ui";

interface SaveProgressOverlayProps {
  visible: boolean;
}

const PHASE_INTERVAL_MS = 3500;

export default function SaveProgressOverlay({
  visible,
}: SaveProgressOverlayProps) {
  const t = useTranslations("MenuImport");
  const [phase, setPhase] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const phases = [
    t("saveProgressFetching"),
    t("saveProgressCategories"),
    t("saveProgressItems"),
  ];

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      setElapsedSec(0);
      return;
    }

    const phaseTimer = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, PHASE_INTERVAL_MS);

    const elapsedTimer = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(elapsedTimer);
    };
  }, [visible, phases.length]);

  if (!visible) return null;

  return (
    // Saving is in flight, so the dialog refuses Escape and backdrop dismissal.
    <Modal
      open
      onClose={() => {}}
      dismissible={false}
      showClose={false}
      size="xs"
    >
      <div className="flex flex-col items-center gap-4 text-center" role="status">
        <Spinner size="xl" className="text-brand" />

        <div>
          <p className="text-base font-semibold text-fg">{t("saving")}</p>
          <p
            className="mt-1 min-h-[1.35rem] text-[13px] font-medium leading-relaxed text-brand"
            aria-live="polite"
          >
            {phases[phase]}
          </p>
        </div>

        <div className="flex justify-center gap-1.5" aria-hidden>
          {phases.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 motion-reduce:transition-none",
                i === phase
                  ? "w-8 bg-brand"
                  : i < phase
                    ? "w-2 bg-brand/50"
                    : "w-2 bg-surface-3",
              )}
            />
          ))}
        </div>

        <p className="text-xs tabular-nums text-fg-muted">
          {t("saveProgressElapsed", { seconds: elapsedSec })}
        </p>
      </div>
    </Modal>
  );
}
