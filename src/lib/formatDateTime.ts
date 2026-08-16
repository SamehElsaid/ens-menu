import { format, formatDistanceToNow } from "date-fns";
import { ar as arDateFnsLocale } from "date-fns/locale/ar";
import { enUS as enDateFnsLocale } from "date-fns/locale/en-US";

/** Intl locale tag for date/time display (single convention across the app). */
export function intlDateLocale(locale: string): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}

export function dateFnsLocale(locale: string) {
  return locale === "ar" ? arDateFnsLocale : enDateFnsLocale;
}

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Short date — e.g. Jan 15, 2024 */
export function formatAppDate(
  dateStr: string | Date | null | undefined,
  locale: string,
  fallback = "—",
): string {
  if (dateStr == null || dateStr === "") return fallback;
  try {
    const date = toDate(dateStr);
    if (!date) return fallback;
    return date.toLocaleDateString(intlDateLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return typeof dateStr === "string" ? dateStr.slice(0, 10) : fallback;
  }
}

/** Short date + time — e.g. Jan 15, 2024, 3:30 PM */
export function formatAppDateTime(
  dateStr: string | Date | null | undefined,
  locale: string,
  fallback = "—",
): string {
  if (dateStr == null || dateStr === "") return fallback;
  try {
    const date = toDate(dateStr);
    if (!date) return fallback;
    return date.toLocaleString(intlDateLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return typeof dateStr === "string" ? dateStr : fallback;
  }
}

export function formatMediumDateTime(
  value: string | Date,
  locale: string,
): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(intlDateLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Chart axis label — weekday + day number */
export function formatAppChartDay(
  dateStr: string,
  locale: string,
  fallback?: string,
): string {
  try {
    const date = toDate(dateStr);
    if (!date) return fallback ?? dateStr.slice(5, 10);
    return date.toLocaleDateString(intlDateLocale(locale), {
      weekday: "short",
      day: "numeric",
    });
  } catch {
    return fallback ?? dateStr.slice(5, 10);
  }
}

/**
 * Relative label for activity timestamps (used by ViewTime).
 * Within ~7 days: distance + clock; older: localized long date/time.
 */
export function formatRelativeActivityTime(
  data: string | Date,
  locale: string,
): string {
  const createdDate = toDate(data);
  if (!createdDate) return "";

  const dfLocale = dateFnsLocale(locale);
  const today = new Date();
  const timeDiff = Math.abs(today.getTime() - createdDate.getTime());
  const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const exactTime = format(createdDate, "hh:mm a", { locale: dfLocale });

  if (daysAgo <= 7) {
    const relative = formatDistanceToNow(createdDate, {
      addSuffix: true,
      locale: dfLocale,
    });
    return `${relative} (${exactTime})`;
  }

  return format(createdDate, "PPp", { locale: dfLocale });
}

/** Whether ViewTime should refresh every minute (recent activity). */
export function shouldRefreshRelativeActivityTime(data: string | Date): boolean {
  const createdDate = toDate(data);
  if (!createdDate) return false;
  const timeDiff = Math.abs(Date.now() - createdDate.getTime());
  const daysAgo = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysAgo === 1;
}
