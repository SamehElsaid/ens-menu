"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="w-16 h-16"
    >
      <rect
        x="12"
        y="28"
        width="40"
        height="28"
        rx="6"
        className="fill-primary/15 stroke-primary"
        strokeWidth="2"
      />
      <path
        d="M20 28V20a12 12 0 0 1 24 0v8"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="42" r="4" className="fill-primary" />
      <line
        x1="32"
        y1="46"
        x2="32"
        y2="51"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CashierIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="w-16 h-16"
    >
      <circle
        cx="32"
        cy="22"
        r="10"
        className="fill-primary/15 stroke-primary"
        strokeWidth="2"
      />
      <path
        d="M12 52c0-11 9-18 20-18s20 7 20 18"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="44" r="10" className="fill-white dark:fill-[#0d1117] stroke-primary" strokeWidth="2" />
      <line x1="48" y1="39" x2="48" y2="49" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <line x1="43" y1="44" x2="53" y2="44" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="40" x2="52" y2="48" className="stroke-primary/40" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="w-16 h-16"
    >
      <path
        d="M32 8 L54 18 L54 34 C54 46 44 56 32 60 C20 56 10 46 10 34 L10 18 Z"
        className="fill-primary/15 stroke-primary"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M22 32 L29 39 L42 26"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="30"
        strokeDashoffset="30"
      >
        <animate attributeName="stroke-dashoffset" from="30" to="0" dur="0.5s" fill="freeze" begin="0.3s" />
      </path>
    </svg>
  );
}

type ReasonKey = "cashier_dashboard" | "cashier_owner_pages" | "default";

const reasonConfig: Record<
  ReasonKey,
  { titleKey: string; bodyKey: string; icon: React.ReactNode; badge: string }
> = {
  cashier_dashboard: {
    titleKey: "cashierDashboardTitle",
    bodyKey: "cashierDashboardBody",
    icon: <CashierIcon />,
    badge: "403",
  },
  cashier_owner_pages: {
    titleKey: "cashierOwnerPagesTitle",
    bodyKey: "cashierOwnerPagesBody",
    icon: <ShieldIcon />,
    badge: "403",
  },
  default: {
    titleKey: "title",
    bodyKey: "body",
    icon: <LockIcon />,
    badge: "401",
  },
};

function UnauthorizedContent() {
  const t = useTranslations("Unauthorized");
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as ReasonKey | null;

  const key: ReasonKey =
    reason === "cashier_dashboard" || reason === "cashier_owner_pages"
      ? reason
      : "default";

  const { titleKey, bodyKey, icon, badge } = reasonConfig[key];

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full">
        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl shadow-slate-200/50 dark:shadow-black/30 p-8 sm:p-10 space-y-6">
          {/* Badge + Icon */}
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase select-none">
              {badge} &middot; Unauthorized
            </span>

            <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/8 border border-primary/20 shadow-inner">
              {icon}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {t(titleKey as Parameters<typeof t>[0])}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(bodyKey as Parameters<typeof t>[0])}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

          {/* CTA */}
          <LinkTo
            href="/"
            className="btn-gradient-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 shrink-0 rtl:rotate-180"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L4.863 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            {t("backHome")}
          </LinkTo>
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
          ENSmenu &mdash; If you think this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <span
            className="inline-block h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
