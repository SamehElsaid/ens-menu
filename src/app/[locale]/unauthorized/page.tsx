"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiArrowLeft } from "react-icons/fi";
import StatusScreen from "@/components/site/StatusScreen";
import { SiteButtonLink } from "@/components/site";

/**
 * Unauthorized.
 *
 * Five reasons, one screen. The previous version gave each reason its own
 * hand-drawn SVG — a padlock, a cashier, a shield — which is three drawings to
 * maintain for a distinction the sentence already makes.
 */

type ReasonKey =
  | "staff_dashboard_root"
  | "staff_owner_pages"
  | "staff_no_permission"
  | "staff_no_dashboard"
  | "default";

const REASONS: Record<
  ReasonKey,
  { titleKey: string; bodyKey: string; code: string }
> = {
  staff_dashboard_root: {
    titleKey: "staffDashboardRootTitle",
    bodyKey: "staffDashboardRootBody",
    code: "403",
  },
  staff_owner_pages: {
    titleKey: "staffOwnerPagesTitle",
    bodyKey: "staffOwnerPagesBody",
    code: "403",
  },
  staff_no_permission: {
    titleKey: "staffNoPermissionTitle",
    bodyKey: "staffNoPermissionBody",
    code: "403",
  },
  staff_no_dashboard: {
    titleKey: "staffNoDashboardTitle",
    bodyKey: "staffNoDashboardBody",
    code: "403",
  },
  default: { titleKey: "title", bodyKey: "body", code: "401" },
};

const REASON_KEYS = Object.keys(REASONS).filter(
  (key) => key !== "default",
) as ReasonKey[];

function UnauthorizedContent() {
  const t = useTranslations("Unauthorized");
  const tNav = useTranslations("header");
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") as ReasonKey | null;

  const { titleKey, bodyKey, code } =
    REASONS[reason && REASON_KEYS.includes(reason) ? reason : "default"];

  return (
    <StatusScreen
      code={code}
      tone="warm"
      label={t("title")}
      title={t(titleKey as Parameters<typeof t>[0])}
      body={t(bodyKey as Parameters<typeof t>[0])}
      footNote={t("mistakeHint")}
    >
      <SiteButtonLink href="/" size="lg">
        <FiArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        {t("backHome")}
      </SiteButtonLink>
      <SiteButtonLink href="/contact" variant="secondary" size="lg">
        {tNav("contact")}
      </SiteButtonLink>
    </StatusScreen>
  );
}

export default function UnauthorizedPage() {
  return (
    /* Reserved height and nothing else. A spinner or a shimmer here would
       suggest access is still being decided; it is not — the answer is known and
       the only thing outstanding is reading the reason out of the URL. */
    <Suspense
      fallback={<div className="public-world min-h-dvh bg-site-bg" />}
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
