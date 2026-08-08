"use client";

import { useTranslations } from "next-intl";
import { HiOutlineBan, HiOutlineChatAlt2 } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
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
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-linear-to-br from-red-50 via-white to-orange-50/60 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20">
      <div className="pointer-events-none absolute start-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300/20 blur-3xl dark:bg-red-800/10" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-300/15 blur-3xl dark:bg-orange-800/10" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-lg border border-white/80 bg-white/80 shadow-2xl shadow-red-200/40 backdrop-blur-sm dark:shadow-red-950/20">
          <div className="h-1 w-full bg-linear-to-r from-red-500 via-orange-400 to-red-400" />

          <div className="p-8">
            {userName && (
              <div className="mb-6 flex items-center gap-3">
                {typeof userProfile?.profileImage === "string" &&
                userProfile.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.profileImage}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-red-500/20"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-sm font-bold text-white ring-4 ring-red-500/10">
                    {initial}
                  </div>
                )}
                <div>
                  <p className="text-xs text-fg-subtle">{t("welcomeBack")}</p>
                  <p className="text-sm font-semibold text-fg-muted">
                    {userName}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-lg bg-red-500/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-orange-500 shadow-lg shadow-red-300/50 dark:shadow-red-900/50">
                  <HiOutlineBan className="text-2xl text-white" />
                </div>
              </div>
            </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-fg">
              {t("title")}
            </h1>
            <p className="mb-6 text-center text-sm leading-relaxed text-fg-muted">
              {t("subtitle")}
            </p>

            {note ? (
              <div className="mb-6 rounded-lg border border-red-100 bg-red-50/80 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  {t("noteLabel")}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                  {note}
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <a
                href={WHATSAPP_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-300/30 transition hover:opacity-95 dark:shadow-green-900/30"
              >
                <FaWhatsapp className="text-lg" />
                {t("whatsappCta")}
              </a>

              <Link
                href="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-3 text-sm font-semibold text-fg-muted transition hover:border-red-400 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400"
              >
                <HiOutlineChatAlt2 className="text-lg" />
                {t("contactPageCta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
