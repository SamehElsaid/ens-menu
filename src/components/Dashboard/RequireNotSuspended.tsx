"use client";

import { useTranslations } from "next-intl";
import { HiOutlineBan, HiOutlineChatAlt2 } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import { Alert, ButtonLink, Card, buttonClasses } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
const WHATSAPP_SUPPORT_URL = "https://wa.me/201500800050";

type AuthUserSlice = {
  user?: {
    name?: string;
    profileImage?: string;
    role?: string;
    isSuspended?: boolean;
    note?: string | null;
  };
};

export type AccountGateStatus = "loading" | "active" | "suspended";

export function useAccountGateStatus(): AccountGateStatus {
  const authLoading = useAppSelector((s) => s.auth.loading);
  const authData = useAppSelector((s) => s.auth.data) as AuthUserSlice | null;

  const userProfile = authData?.user;
  const authLoaded = authLoading === "yes" && Boolean(userProfile);

  if (!authLoaded) {
    return "loading";
  }

  const isStaff = userProfile?.role === "staff";
  if (!isStaff && userProfile?.isSuspended === true) {
    return "suspended";
  }

  return "active";
}

export function SuspendedAccountScreen() {
  const t = useTranslations("suspendedGate");
  const authData = useAppSelector((s) => s.auth.data) as AuthUserSlice | null;
  const userProfile = authData?.user;

  const userName =
    typeof userProfile?.name === "string" ? userProfile.name.split(" ")[0] : "";
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";
  const note =
    typeof userProfile?.note === "string" ? userProfile.note.trim() : "";

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <Card padded="lg" className="w-full max-w-md">
        {userName && (
          <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-3">
            {typeof userProfile?.profileImage === "string" &&
            userProfile.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.profileImage}
                alt=""
                className="size-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[13px] font-semibold text-fg-muted">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="ui-label">{t("welcomeBack")}</p>
              <p className="truncate text-[13px] font-semibold text-fg">
                {userName}
              </p>
            </div>
          </div>
        )}

        <h1 className="text-lg font-semibold tracking-[-0.02em] text-fg">
          {t("title")}
        </h1>

        <Alert tone="danger" icon={<HiOutlineBan />} className="mt-2.5">
          {t("subtitle")}
        </Alert>

        {note ? (
          <div className="mt-3 rounded-lg border border-line bg-surface-2 p-3">
            <p className="ui-label mb-1">{t("noteLabel")}</p>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg-muted">
              {note}
            </p>
          </div>
        ) : null}

        <ol className="mt-4 divide-y divide-line border-t border-line">
          <li className="flex items-center gap-3 py-3">
            <span className="ui-figure text-xs text-fg-subtle" aria-hidden>
              01
            </span>
            <ButtonLink
              external
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              startIcon={<FaWhatsapp className="text-base" />}
              className="flex-1"
            >
              {t("whatsappCta")}
            </ButtonLink>
          </li>
          <li className="flex items-center gap-3 py-3">
            <span className="ui-figure text-xs text-fg-subtle" aria-hidden>
              02
            </span>
            <Link
              href="/contact"
              className={buttonClasses({
                variant: "secondary",
                className: "flex-1",
              })}
            >
              <HiOutlineChatAlt2 className="text-base" aria-hidden />
              {t("contactPageCta")}
            </Link>
          </li>
        </ol>
      </Card>
    </div>
  );
}
