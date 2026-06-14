"use client";

import {
  FiClock,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineQrCode } from "react-icons/hi2";
import { cn } from "@/lib/cn";
import type { MarketingTrustFeature } from "@/lib/marketingTrustFeatureIds";

const ICONS = {
  setup: FiClock,
  mobile: FiSmartphone,
  venues: FiUsers,
  qrOrders: HiOutlineQrCode,
  arabic: FiGlobe,
  noApp: FiMonitor,
} as const;

type MarketingTrustFeaturesProps = {
  features: MarketingTrustFeature[];
  variant?: "light" | "dark" | "muted";
  columns?: 2 | 3 | 6;
  className?: string;
};

export default function MarketingTrustFeatures({
  features,
  variant = "light",
  columns = 3,
  className,
}: MarketingTrustFeaturesProps) {
  const columnClass =
    columns === 6
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={cn("grid gap-2.5 sm:gap-3", columnClass, className)}>
      {features.map((feature) => {
        const Icon = ICONS[feature.id as keyof typeof ICONS] ?? FiClock;

        return (
          <div
            key={feature.id}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border p-3 text-start sm:p-3.5",
              variant === "dark" &&
                "border-white/8 bg-white/[0.04] backdrop-blur-sm",
              variant === "light" &&
                "border-slate-200/70 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/[0.04]",
              variant === "muted" &&
                "border-slate-200/80 bg-white/90 dark:border-slate-700/70 dark:bg-slate-900/60",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                variant === "dark"
                  ? "bg-purple-500/15 text-purple-300"
                  : "bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
              )}
            >
              <Icon size={15} strokeWidth={2} />
            </span>
            <p
              className={cn(
                "min-w-0 text-[12px] font-semibold leading-snug sm:text-[13px]",
                variant === "dark" ? "text-white" : "text-slate-800 dark:text-white",
              )}
            >
              {feature.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
