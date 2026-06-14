"use client";

import LoginDashboardIllustration from "@/components/Auth/LoginDashboardIllustration";
import { FiCloud, FiShield, FiZap } from "react-icons/fi";

type LoginOnboardingVisualProps = {
  headline: string;
  headlineAccent: string;
  subtitle: string;
  trustBadges: string[];
  features?: string[];
  variant?: "full" | "compact";
};

const TRUST_ICONS = [FiShield, FiCloud, FiZap] as const;

export default function LoginOnboardingVisual({
  headline,
  headlineAccent,
  subtitle,
  trustBadges,
  features = [],
  variant = "full",
}: LoginOnboardingVisualProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`login-onboarding-visual text-start ${isCompact ? "login-onboarding-visual--compact" : ""}`}
    >
      <h1
        className={`font-bold leading-snug tracking-tight text-slate-900 dark:text-white ${
          isCompact
            ? "text-base"
            : "text-[1.25rem] sm:text-[1.35rem] lg:text-[1.45rem]"
        }`}
      >
        {headline}{" "}
        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent rtl:bg-gradient-to-l dark:from-purple-400 dark:to-indigo-400">
          {headlineAccent}
        </span>
      </h1>

      <p
        className={`max-w-sm leading-relaxed text-slate-600 dark:text-slate-400 ${
          isCompact
            ? "mt-1 text-xs leading-snug"
            : "mt-2 text-[13px]"
        }`}
      >
        {subtitle}
      </p>

      <div
        className={`flex flex-wrap ${isCompact ? "mt-2.5 gap-1" : "mt-4 gap-1.5"}`}
      >
        {trustBadges.map((badge, index) => {
          const Icon = TRUST_ICONS[index % TRUST_ICONS.length];
          return (
            <span
              key={badge}
              className={`inline-flex items-center gap-1 rounded-md border border-purple-200/70 bg-white/80 font-semibold text-purple-800 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-200 ${
                isCompact
                  ? "px-1.5 py-0.5 text-[9px]"
                  : "px-2 py-1 text-[10px]"
              }`}
            >
              <Icon size={isCompact ? 10 : 11} aria-hidden />
              {badge}
            </span>
          );
        })}
      </div>

      {!isCompact && features.length > 0 && (
        <ul className="mt-3 hidden space-y-1.5 text-[12px] text-slate-600 md:block dark:text-slate-400">
          {features.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-500"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {!isCompact && <LoginDashboardIllustration />}
    </div>
  );
}
