"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { syncFcmToken } from "@/shared/syncFcmToken";
import {
  IoNotificationsOutline,
  IoClose,
  IoSettingsOutline,
  IoCheckmarkCircle,
  IoOpenOutline,
} from "react-icons/io5";

type PermissionState = "default" | "granted" | "denied";

export function NotificationPermissionCard() {
  const t = useTranslations("notificationPermission");
  const locale = useLocale();
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justGranted, setJustGranted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission as PermissionState);
  }, []);

  const handleAllow = async () => {
    setLoading(true);
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    if (result === "granted") {
      setJustGranted(true);
      await syncFcmToken(locale);
      setTimeout(() => setDismissed(true), 1800);
    }
    setLoading(false);
  };

  if (permission === null || permission === "granted" || dismissed) return null;

  const isDenied = permission === "denied";

  return (
    <div
      role="alert"
      className={[
        "relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all sm:p-5",
        isDenied
          ? "border-red-200/70 bg-linear-to-br from-red-50 via-rose-50/50 to-white dark:border-red-500/20 dark:from-red-950/40 dark:via-rose-950/20 dark:to-slate-900"
          : "border-violet-200/70 bg-linear-to-br from-violet-50 via-fuchsia-50/50 to-white dark:border-violet-500/20 dark:from-violet-950/40 dark:via-fuchsia-950/20 dark:to-slate-900",
      ].join(" ")}
    >
      {/* decorative blobs */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute -end-14 -top-14 h-40 w-40 rounded-full blur-3xl",
          isDenied
            ? "bg-linear-to-br from-red-400/20 to-rose-400/10 dark:from-red-500/15"
            : "bg-linear-to-br from-violet-400/20 to-fuchsia-400/10 dark:from-violet-500/15",
        ].join(" ")}
      />
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute -start-8 bottom-0 h-24 w-24 rounded-full blur-2xl",
          isDenied
            ? "bg-linear-to-tr from-rose-300/15"
            : "bg-linear-to-tr from-fuchsia-300/15",
        ].join(" ")}
      />

      <div className="relative flex items-start gap-4">
        {/* icon */}
        <div
          className={[
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
            isDenied
              ? "bg-linear-to-br from-red-500 to-rose-600 shadow-red-500/30"
              : "bg-linear-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/30",
          ].join(" ")}
        >
          {justGranted ? (
            <IoCheckmarkCircle className="text-2xl" aria-hidden />
          ) : (
            <IoNotificationsOutline
              className={[
                "text-2xl",
                !isDenied && !loading
                  ? "animate-[wiggle_1.2s_ease-in-out_infinite]"
                  : "",
              ].join(" ")}
              aria-hidden
            />
          )}
          {!isDenied && !justGranted && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl animate-ping bg-violet-500/30"
              style={{ animationDuration: "2s" }}
            />
          )}
        </div>

        {/* content */}
        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-sm font-bold",
              isDenied
                ? "text-red-700 dark:text-red-300"
                : "text-violet-800 dark:text-violet-200",
            ].join(" ")}
          >
            {isDenied ? t("deniedTitle") : t("title")}
          </p>

          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {isDenied ? t("deniedDescription") : t("description")}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {/* primary action — always present */}
            <button
              type="button"
              onClick={handleAllow}
              disabled={loading || justGranted}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-60",
                justGranted
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : isDenied
                    ? "bg-linear-to-r from-red-500 to-rose-600 shadow-red-500/30 hover:from-red-400 hover:to-rose-500"
                    : "bg-linear-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/30 hover:from-violet-500 hover:to-fuchsia-500",
              ].join(" ")}
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : justGranted ? (
                <IoCheckmarkCircle className="text-sm" aria-hidden />
              ) : (
                <IoNotificationsOutline className="text-sm" aria-hidden />
              )}
              {justGranted ? t("allowBtn") : isDenied ? t("tryAgain") : t("allowBtn")}
            </button>

            {/* secondary — open browser site settings */}
            {isDenied && (
              <a
                href={getBrowserSettingsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-white px-4 py-2 text-xs font-medium text-red-700 shadow-sm transition-all hover:bg-red-50 dark:border-red-700/50 dark:bg-slate-800 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                <IoSettingsOutline className="text-sm" aria-hidden />
                {t("openSettings")}
                <IoOpenOutline className="text-[10px] opacity-60" aria-hidden />
              </a>
            )}
          </div>
        </div>

        {/* dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("dismiss")}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
        >
          <IoClose className="text-base" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Returns the deepest link possible for each browser to reach notification settings. */
function getBrowserSettingsUrl(): string {
  if (typeof window === "undefined") return "#";
  const ua = navigator.userAgent;

  if (/Edg\//.test(ua)) {
    // Microsoft Edge — deep-links to site permissions
    return `edge://settings/content/notifications`;
  }
  if (/OPR\/|Opera\//.test(ua)) {
    return `opera://settings/content/notifications`;
  }
  if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
    // Chrome — link to the site-specific permissions panel for the current origin
    return `chrome://settings/content/siteDetails?site=${encodeURIComponent(window.location.origin)}`;
  }
  if (/Firefox\//.test(ua)) {
    // Firefox can't deep-link via custom protocol, fall back to MDN guide
    return "https://support.mozilla.org/kb/push-notifications-firefox";
  }
  // Fallback: point to current page so user can click the lock icon
  return window.location.href;
}
