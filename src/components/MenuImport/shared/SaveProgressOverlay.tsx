"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IoSparklesOutline } from "react-icons/io5";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl px-8 py-8 shadow-2xl max-w-sm w-full mx-4 text-center border border-slate-200/80 dark:border-slate-700">
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-40" />
          <div className="absolute inset-1 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-1 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          <div
            className="absolute inset-3 rounded-full border-[3px] border-transparent border-b-primary/50 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <IoSparklesOutline className="text-2xl text-primary animate-pulse" />
          </div>
        </div>

        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          {t("saving")}
        </p>
        <p className="text-sm text-primary font-semibold min-h-[1.35rem] mb-3 leading-relaxed">
          {phases[phase]}
        </p>

        <div className="flex justify-center gap-1.5 mb-4">
          {phases.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === phase
                  ? "w-8 bg-primary"
                  : i < phase
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-slate-200 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {t("saveProgressElapsed", { seconds: elapsedSec })}
        </p>
      </div>
    </div>
  );
}
