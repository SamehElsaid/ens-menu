"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FaClock } from "react-icons/fa";
import { Button, Modal } from "@/components/ui";
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

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[4.5rem] flex-1 flex-col items-center rounded-xl border border-brand-line bg-brand-soft px-3 py-3.5">
      <span className="ui-figure text-2xl text-brand-soft-fg">
        {String(value).padStart(2, "0")}
      </span>
      <span className="ui-label mt-1 text-fg-muted">{label}</span>
    </div>
  );
}

export default function UpcomingFeatureCountdownModal({
  feature,
  open,
  onClose,
}: UpcomingFeatureCountdownModalProps) {
  const t = useTranslations("Dashboard.upcomingFeatures");
  const tCommon = useTranslations("common");
  const [countdown, setCountdown] = useState(() =>
    getCountdownParts(feature.launchAt),
  );

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={t(`features.${feature.messageKey}.title`)}
      description={t(`features.${feature.messageKey}.description`)}
      icon={<FaClock className="size-4.5" />}
      closeLabel={tCommon("close")}
      footer={
        <Button variant="primary" onClick={onClose} data-autofocus>
          {t("close")}
        </Button>
      }
    >
      <div className="flex gap-2">
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
    </Modal>
  );
}
