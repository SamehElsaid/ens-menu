"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";

function UnauthorizedContent() {
  const t = useTranslations("Unauthorized");
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const isCashierDashboard = reason === "cashier_dashboard";
  const isCashierOwnerPages = reason === "cashier_owner_pages";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isCashierDashboard
            ? t("cashierDashboardTitle")
            : isCashierOwnerPages
              ? t("cashierOwnerPagesTitle")
              : t("title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {isCashierDashboard
            ? t("cashierDashboardBody")
            : isCashierOwnerPages
              ? t("cashierOwnerPagesBody")
              : t("body")}
        </p>
        <div className="pt-4">
          <LinkTo
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {t("backHome")}
          </LinkTo>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
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
