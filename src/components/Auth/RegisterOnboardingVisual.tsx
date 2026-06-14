"use client";

import CtaPhoneMockup from "@/components/HomePage/CtaPhoneMockup";
import { cn } from "@/lib/cn";
import {
  FiClock,
  FiCreditCard,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { HiOutlineQrCode, HiOutlineSparkles } from "react-icons/hi2";

type RegisterOnboardingVisualProps = {
  headline: string;
  headlineAccent: string;
  subtitle: string;
  trustBadges: string[];
  benefits: { title: string; description: string; icon: "ai" | "qr" | "orders" }[];
  restaurantName: string;
  menuItems: { name: string; price: string; image: string }[];
  addLabel: string;
  compact?: boolean;
};

const BENEFIT_ICONS = {
  ai: HiOutlineSparkles,
  qr: HiOutlineQrCode,
  orders: FiZap,
} as const;

const TRUST_ICONS = [FiShield, FiCreditCard, FiClock, FiZap] as const;

export default function RegisterOnboardingVisual({
  headline,
  headlineAccent,
  subtitle,
  trustBadges,
  benefits,
  restaurantName,
  menuItems,
  addLabel,
  compact = false,
}: RegisterOnboardingVisualProps) {
  return (
    <div
      className={cn(
        "register-onboarding-visual relative",
        compact ? "text-center" : "hidden lg:flex lg:flex-col lg:justify-center",
      )}
    >
      {!compact && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse_at_30%_20%,rgba(124,58,237,0.14),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-inline-end-0 top-1/3 h-48 w-48 rounded-full bg-purple-400/10 blur-3xl"
          />
        </>
      )}

      <div className={cn("relative", compact ? "space-y-4" : "space-y-7")}>
        {!compact && (
          <div className="max-w-md text-start">
            <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.85rem] dark:text-white">
              {headline}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent rtl:bg-gradient-to-l dark:from-purple-400 dark:to-indigo-400">
                {headlineAccent}
              </span>
            </h1>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
          {trustBadges.map((badge, index) => {
            const Icon = TRUST_ICONS[index] ?? FiShield;
            return (
              <span
                key={badge}
                className="register-trust-badge inline-flex items-center gap-1.5 rounded-full border border-purple-200/60 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-purple-700 backdrop-blur-sm dark:border-purple-500/20 dark:bg-purple-500/8 dark:text-purple-300"
              >
                <Icon size={12} strokeWidth={2.25} aria-hidden />
                {badge}
              </span>
            );
          })}
        </div>

        {!compact && (
          <>
            <div className="grid gap-2.5">
              {benefits.map((benefit) => {
                const Icon = BENEFIT_ICONS[benefit.icon];
                return (
                  <div
                    key={benefit.title}
                    className="register-benefit-card flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white/60 p-3.5 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
                      <Icon size={17} strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0 text-start">
                      <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                        {benefit.title}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden justify-center lg:flex lg:justify-start">
              <CtaPhoneMockup
                restaurantName={restaurantName}
                items={menuItems}
                addLabel={addLabel}
                className="max-w-[15.5rem]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
