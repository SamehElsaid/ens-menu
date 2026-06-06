import { axiosGet, axiosPost } from "@/shared/axiosCall";
import {
  buildMockQueueFromUsers,
  createMockFollowUpCall,
  getDemoQueueUsers,
  getMockFollowUpCalls,
  getMockFollowUpReport,
} from "@/lib/mockAdminFollowUp";
import type {
  CreateFollowUpCallPayload,
  FollowUpCall,
  FollowUpCallsResponse,
  FollowUpQueueResponse,
  FollowUpQueueSegment,
  FollowUpReportSummary,
} from "@/types/AdminFollowUp";

type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  planName: string;
  menusCount: number;
  lastLoginAt: string | null;
  endDate: string | null;
  createdAt: string;
};

async function loadUsersForQueue(
  locale: string,
): Promise<{ users: AdminUserRow[]; fromApi: boolean }> {
  const result = await axiosGet<{
    users?: AdminUserRow[];
  }>("/admin/users", locale, undefined, { page: 1, limit: 100 });

  if (result.status && result.data?.users?.length) {
    return { users: result.data.users, fromApi: true };
  }

  return { users: getDemoQueueUsers(locale), fromApi: false };
}

export async function fetchFollowUpQueue(
  locale: string,
  segment: FollowUpQueueSegment = "all",
): Promise<FollowUpQueueResponse> {
  const result = await axiosGet<FollowUpQueueResponse>(
    "/admin/follow-ups/queue",
    locale,
    undefined,
    { segment },
  );

  if (result.status && result.data?.users) {
    return result.data;
  }

  const { users, fromApi } = await loadUsersForQueue(locale);
  return {
    _isDemoData: !fromApi,
    users: buildMockQueueFromUsers(users, segment),
  };
}

export async function fetchFollowUpCalls(
  locale: string,
  filters?: { userId?: number; from?: string; to?: string },
): Promise<FollowUpCallsResponse> {
  const result = await axiosGet<FollowUpCallsResponse>(
    "/admin/follow-ups/calls",
    locale,
    undefined,
    filters as Record<string, string | number>,
  );

  if (result.status && result.data?.calls) {
    return result.data;
  }

  return {
    _isDemoData: true,
    calls: getMockFollowUpCalls(filters),
  };
}

export async function createFollowUpCall(
  locale: string,
  payload: CreateFollowUpCallPayload,
  userName?: string,
): Promise<{ call: FollowUpCall; isDemo: boolean }> {
  const result = await axiosPost<
    CreateFollowUpCallPayload,
    { call?: FollowUpCall }
  >("/admin/follow-ups/calls", locale, payload);

  if (result.status && result.data?.call) {
    return { call: result.data.call, isDemo: false };
  }

  return {
    call: createMockFollowUpCall(payload, userName),
    isDemo: true,
  };
}

export async function fetchFollowUpReport(
  locale: string,
  period: "7d" | "30d" = "7d",
): Promise<FollowUpReportSummary> {
  const result = await axiosGet<FollowUpReportSummary>(
    "/admin/follow-ups/report",
    locale,
    undefined,
    { period },
  );

  if (result.status && result.data) {
    return result.data;
  }

  return getMockFollowUpReport(period);
}

export function formatFollowUpPurpose(
  purpose: string,
  t: (key: string) => string,
): string {
  const legacyKeys = [
    "onboarding",
    "upgrade_pro",
    "renewal",
    "support",
    "other",
  ] as const;
  if (legacyKeys.includes(purpose as (typeof legacyKeys)[number])) {
    return t(`purposes.${purpose}`);
  }
  return purpose;
}

export function formatFollowUpDateTime(
  dateStr: string,
  locale: string,
): string {
  try {
    return new Date(dateStr).toLocaleString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return dateStr;
  }
}
