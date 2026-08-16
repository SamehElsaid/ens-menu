"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { generateToken } from "../../../firebase/firebase-confing";
import { syncFcmToken } from "@/shared/syncFcmToken";
import {
  IoNotificationsOutline,
  IoNotificationsOffOutline,
  IoClose,
  IoSettingsOutline,
  IoCheckmarkCircle,
  IoOpenOutline,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Badge, Button, ButtonLink, Card, CardFooter } from "@/components/ui";

type PermissionState = "default" | "granted" | "denied";

const subscribeToPermission = () => () => {};

function getBrowserPermission(): PermissionState | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return Notification.permission as PermissionState;
}

/**
 * Prompt for the browser notification permission, above an orders list.
 *
 * It used to be the loudest thing on the page: two nested gradient fields, two
 * blurred colour blobs and a glowing gradient icon tile, all to say one sentence
 * with one button. It is now an elevated panel with an inline edge — danger
 * when the browser has blocked us, brand purple when it is only asking — and
 * the actions sit behind a divider, so an operator scanning live orders sees a
 * notice rather than a second, brighter application.
 *
 * The state is carried by an edge, an icon and a dotted badge together, because
 * the difference between "not asked yet" and "blocked by the browser" decides
 * whether the button can do anything at all.
 */
export function NotificationPermissionCard() {
  const t = useTranslations("notificationPermission");
  const locale = useLocale();
  const browserPermission = useSyncExternalStore(
    subscribeToPermission,
    getBrowserPermission,
    () => null,
  );
  const [requestedPermission, setRequestedPermission] =
    useState<PermissionState | null>(null);
  const permission = requestedPermission ?? browserPermission;
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justGranted, setJustGranted] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    const result = await Notification.requestPermission();
    setRequestedPermission(result as PermissionState);
    if (result === "granted") {
      setJustGranted(true);
      await generateToken();
      await syncFcmToken(locale);
      setTimeout(() => setDismissed(true), 1800);
    }
    setLoading(false);
  };

  if (permission === null || permission === "granted" || dismissed) return null;

  const isDenied = permission === "denied";

  return (
    <Card
      role={isDenied ? "alert" : "status"}
      className={cn(
        "before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:rounded-s-xl before:content-['']",
        isDenied ? "before:bg-danger" : "before:bg-brand",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border text-[17px]",
            isDenied
              ? "border-danger-line bg-danger-soft text-danger"
              : "border-line bg-surface-2 text-fg-muted",
          )}
        >
          {justGranted ? (
            <IoCheckmarkCircle />
          ) : isDenied ? (
            <IoNotificationsOffOutline />
          ) : (
            <IoNotificationsOutline />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[13px] font-semibold text-fg">
              {isDenied ? t("deniedTitle") : t("title")}
            </p>
            <Badge
              tone={justGranted ? "success" : isDenied ? "danger" : "neutral"}
              dot
            >
              {justGranted
                ? t("statusOn")
                : isDenied
                  ? t("statusBlocked")
                  : t("statusOff")}
            </Badge>
          </div>
          <p className="mt-1 max-w-prose text-xs leading-relaxed text-fg-muted">
            {isDenied ? t("deniedDescription") : t("description")}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={t("dismiss")}
          title={t("dismiss")}
          onClick={() => setDismissed(true)}
          className="-me-1 -mt-1"
        >
          <IoClose aria-hidden />
        </Button>
      </div>

      <CardFooter className="flex-wrap">
        <Button
          size="sm"
          onClick={handleAllow}
          loading={loading}
          disabled={justGranted}
          startIcon={
            justGranted ? (
              <IoCheckmarkCircle aria-hidden />
            ) : (
              <IoNotificationsOutline aria-hidden />
            )
          }
        >
          {justGranted
            ? t("allowBtn")
            : isDenied
              ? t("tryAgain")
              : t("allowBtn")}
        </Button>

        {isDenied && (
          <ButtonLink
            external
            href={getBrowserSettingsUrl()}
            variant="secondary"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<IoSettingsOutline aria-hidden />}
            endIcon={<IoOpenOutline className="opacity-60" aria-hidden />}
          >
            {t("openSettings")}
          </ButtonLink>
        )}
      </CardFooter>
    </Card>
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
