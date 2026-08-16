import { axiosDelete, axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
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
import { formatAppDate, formatAppDateTime } from "@/lib/formatDateTime";
import {
  emptyFollowUpCallsResponse,
  emptyFollowUpQueueResponse,
  emptyFollowUpReportSummary,
  shouldUseAdminMockFallback,
} from "@/lib/adminMockFallback";

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

  if (!shouldUseAdminMockFallback()) {
    return { users: [], fromApi: false };
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

  if (shouldUseAdminMockFallback()) {
    const { users, fromApi } = await loadUsersForQueue(locale);
    return {
      _isDemoData: !fromApi,
      users: buildMockQueueFromUsers(users, segment),
    };
  }

  return emptyFollowUpQueueResponse();
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

  if (shouldUseAdminMockFallback()) {
    return {
      _isDemoData: true,
      calls: getMockFollowUpCalls(filters),
    };
  }

  return emptyFollowUpCallsResponse();
}

export async function createFollowUpCall(
  locale: string,
  payload: CreateFollowUpCallPayload,
  userName?: string,
): Promise<{ call: FollowUpCall | null; isDemo: boolean }> {
  const result = await axiosPost<
    CreateFollowUpCallPayload,
    { call?: FollowUpCall }
  >("/admin/follow-ups/calls", locale, payload);

  if (result.status && result.data?.call) {
    return { call: result.data.call, isDemo: false };
  }

  if (shouldUseAdminMockFallback()) {
    return {
      call: createMockFollowUpCall(payload, userName),
      isDemo: true,
    };
  }

  return { call: null, isDemo: false };
}

export async function deleteFollowUpCall(
  locale: string,
  callId: string,
): Promise<{ ok: boolean; isDemo: boolean }> {
  const result = await axiosDelete(`/admin/follow-ups/calls/${callId}`, locale);

  if (result.status) {
    return { ok: true, isDemo: false };
  }

  if (shouldUseAdminMockFallback()) {
    const deleted = deleteMockFollowUpCall(callId);
    return { ok: deleted, isDemo: true };
  }

  return { ok: false, isDemo: false };
}

export async function updateFollowUpCall(
  locale: string,
  callId: string,
  payload: UpdateFollowUpCallPayload,
): Promise<{ call: FollowUpCall; isDemo: boolean } | null> {
  const result = await axiosPut<
    UpdateFollowUpCallPayload,
    { call?: FollowUpCall }
  >(`/admin/follow-ups/calls/${callId}`, locale, payload);

  if (result.status && result.data?.call) {
    return { call: result.data.call, isDemo: false };
  }

  if (shouldUseAdminMockFallback()) {
    const updated = updateMockFollowUpCall(callId, payload);
    if (!updated) return null;
    return { call: updated, isDemo: true };
  }

  return null;
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

  if (shouldUseAdminMockFallback()) {
    return getMockFollowUpReport(period);
  }

  return emptyFollowUpReportSummary(period);
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

export function formatFollowUpDate(dateStr: string, locale: string): string {
  return formatAppDate(dateStr, locale, dateStr.slice(0, 10));
}

export function getFollowUpCallDisplayName(call: FollowUpCall): string {
  return (
    call.customerName?.trim() ||
    call.userName?.trim() ||
    `#${call.userId}`
  );
}

export function getFollowUpCallDisplayPhone(
  call: FollowUpCall,
): string | null {
  return call.phoneNumber?.trim() || call.otherContactNumbers?.trim() || null;
}

export function formatFollowUpDateTime(
  dateStr: string,
  locale: string,
): string {
  return formatAppDateTime(dateStr, locale, dateStr);
}
