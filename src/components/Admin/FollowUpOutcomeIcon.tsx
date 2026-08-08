"use client";

import { useTranslations } from "next-intl";
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoReturnUpBack,
  IoTimeOutline,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import type { FollowUpOutcome } from "@/types/AdminFollowUp";

type FollowUpOutcomeIconProps = {
  outcome: FollowUpOutcome;
  className?: string;
  size?: "sm" | "md";
};

/** Each outcome keeps a distinct glyph, so the tone is never the only signal. */
const OUTCOME_STYLES: Record<
  FollowUpOutcome,
  { Icon: typeof IoCheckmarkCircle; className: string }
> = {
  answered: {
    Icon: IoCheckmarkCircle,
    className: "text-success",
  },
  no_answer: {
    Icon: IoCloseCircle,
    className: "text-danger",
  },
  busy: {
    Icon: IoTimeOutline,
    className: "text-warning",
  },
  wrong_number: {
    Icon: IoAlertCircle,
    className: "text-warning",
  },
  callback_requested: {
    Icon: IoReturnUpBack,
    className: "text-info",
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
      className={cn("inline-flex shrink-0", className)}
      title={label}
      aria-label={label}
    >
      <Icon className={cn(sizeClass, colorClass)} aria-hidden />
    </span>
  );
}
