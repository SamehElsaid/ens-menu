import { axiosDelete, axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import {
  buildMockQueueFromUsers,
  createMockFollowUpCall,
  deleteMockFollowUpCall,
  getDemoQueueUsers,
  getMockFollowUpCalls,
  getMockFollowUpReport,
  updateMockFollowUpCall,
} from "@/lib/mockAdminFollowUp";
import type {
  CreateFollowUpCallPayload,
  FollowUpCall,
  FollowUpCallsResponse,
  FollowUpPurpose,
  FollowUpQueueResponse,
  FollowUpQueueSegment,
  FollowUpReportSummary,
  UpdateFollowUpCallPayload,
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

export type FollowUpCallsFilters = {
  userId?: number;
  adminName?: string;
  from?: string;
  to?: string;
};

export function followUpReportPeriodStart(period: "7d" | "30d"): string {
  const date = new Date();
  date.setDate(date.getDate() - (period === "30d" ? 30 : 7));
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export async function fetchFollowUpCalls(
  locale: string,
  filters?: FollowUpCallsFilters,
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

export async function deleteFollowUpCall(
  locale: string,
  callId: string,
): Promise<{ ok: boolean; isDemo: boolean }> {
  const result = await axiosDelete(`/admin/follow-ups/calls/${callId}`, locale);

  if (result.status) {
    return { ok: true, isDemo: false };
  }

  const deleted = deleteMockFollowUpCall(callId);
  return { ok: deleted, isDemo: true };
}

export async function updateFollowUpCall(
  locale: string,
  callId: string,
  payload: UpdateFollowUpCallPayload,
): Promise<{ call: FollowUpCall; isDemo: boolean } | null> {
  const result = await axiosPatch<
    UpdateFollowUpCallPayload,
    { call?: FollowUpCall }
  >(`/admin/follow-ups/calls/${callId}`, locale, payload);

  if (result.status && result.data?.call) {
    return { call: result.data.call, isDemo: false };
  }

  const updated = updateMockFollowUpCall(callId, payload);
  if (!updated) return null;
  return { call: updated, isDemo: true };
}

const KNOWN_PURPOSES = new Set<FollowUpPurpose>([
  "onboarding",
  "free_plan",
  "upgrade_pro",
  "renewal",
  "support",
  "other",
]);

export function parseFollowUpPurpose(value?: string): FollowUpPurpose {
  if (value && KNOWN_PURPOSES.has(value as FollowUpPurpose)) {
    return value as FollowUpPurpose;
  }
  return "other";
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
    "free_plan",
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
