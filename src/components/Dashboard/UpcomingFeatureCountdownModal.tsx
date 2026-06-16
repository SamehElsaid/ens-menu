"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FaClock, FaTimes } from "react-icons/fa";
import type { UpcomingFeatureConfig } from "@/lib/upcomingFeatures";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdownParts(targetDate: string): CountdownParts {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

type UpcomingFeatureCountdownModalProps = {
  feature: UpcomingFeatureConfig;
  open: boolean;
  onClose: () => void;
};

function CountdownUnit({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-[4.5rem] flex-1 flex-col items-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/60">
      <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default function UpcomingFeatureCountdownModal({
  feature,
  open,
  onClose,
}: UpcomingFeatureCountdownModalProps) {
  const t = useTranslations("Dashboard.upcomingFeatures");
  const [countdown, setCountdown] = useState(() =>
    getCountdownParts(feature.launchAt),
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const next = getCountdownParts(feature.launchAt);
      setCountdown(next);
      if (
        next.days === 0 &&
        next.hours === 0 &&
        next.minutes === 0 &&
        next.seconds === 0
      ) {
        onClose();
      }
    };

    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [feature.launchAt, open, onClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#12161f]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upcoming-feature-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={t("close")}
        >
          <FaTimes className="size-4" />
        </button>

        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-600 ring-1 ring-violet-200/60 dark:from-violet-950/50 dark:to-fuchsia-900/30 dark:text-violet-400 dark:ring-violet-800/40">
          <FaClock className="size-5" aria-hidden />
        </div>

        <h2
          id="upcoming-feature-title"
          className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100"
        >
          {t(`features.${feature.messageKey}.title`)}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t(`features.${feature.messageKey}.description`)}
        </p>

        <div className="mb-6 flex gap-2">
          <CountdownUnit label={t("countdownDays")} value={countdown.days} />
          <CountdownUnit label={t("countdownHours")} value={countdown.hours} />
          <CountdownUnit
            label={t("countdownMinutes")}
            value={countdown.minutes}
          />
          <CountdownUnit
            label={t("countdownSeconds")}
            value={countdown.seconds}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
