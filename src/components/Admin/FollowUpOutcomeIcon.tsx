"use client";

import { useTranslations } from "next-intl";
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoReturnUpBack,
  IoTimeOutline,
} from "react-icons/io5";
import type { FollowUpOutcome } from "@/types/AdminFollowUp";

type FollowUpOutcomeIconProps = {
  outcome: FollowUpOutcome;
  className?: string;
  size?: "sm" | "md";
};

const OUTCOME_STYLES: Record<
  FollowUpOutcome,
  { Icon: typeof IoCheckmarkCircle; className: string }
> = {
  answered: {
    Icon: IoCheckmarkCircle,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  no_answer: {
    Icon: IoCloseCircle,
    className: "text-red-500 dark:text-red-400",
  },
  busy: {
    Icon: IoTimeOutline,
    className: "text-amber-500 dark:text-amber-400",
  },
  wrong_number: {
    Icon: IoAlertCircle,
    className: "text-orange-500 dark:text-orange-400",
  },
  callback_requested: {
    Icon: IoReturnUpBack,
    className: "text-blue-500 dark:text-blue-400",
  },
};

export default function FollowUpOutcomeIcon({
  outcome,
  className = "",
  size = "md",
}: FollowUpOutcomeIconProps) {
  const t = useTranslations("adminFollowUps");
  const { Icon, className: colorClass } = OUTCOME_STYLES[outcome];
  const label = t(`outcomes.${outcome}`);
  const sizeClass = size === "sm" ? "text-base" : "text-lg";

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      title={label}
      aria-label={label}
    >
      <Icon className={`${sizeClass} ${colorClass}`} aria-hidden />
    </span>
  );
}
