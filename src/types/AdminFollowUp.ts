export type FollowUpQueueSegment =
  | "all"
  | "new"
  | "no-menu"
  | "expiring"
  | "inactive"
  | "overdue"
  | "free"
  | "pro";

export type FollowUpOutcome =
  | "answered"
  | "no_answer"
  | "busy"
  | "wrong_number"
  | "callback_requested";

export type FollowUpPurpose =
  | "onboarding"
  | "upgrade_pro"
  | "renewal"
  | "support"
  | "other";

/** @deprecated Legacy enum keys — purpose is now free text. */
export type LegacyFollowUpPurpose = FollowUpPurpose;

export interface FollowUpCall {
  id: string;
  userId: number;
  userName?: string;
  adminId?: number;
  adminName?: string;
  outcome: FollowUpOutcome;
  purpose?: string;
  notes?: string;
  calledAt: string;
  nextFollowUpAt?: string | null;
  _isDemoData?: boolean;
}

export interface FollowUpQueueUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  planName: string;
  menusCount: number;
  lastLoginAt: string | null;
  endDate: string | null;
  createdAt: string;
  lastCall: FollowUpCall | null;
  nextFollowUpAt: string | null;
  segments: FollowUpQueueSegment[];
}

export interface FollowUpQueueResponse {
  _isDemoData?: boolean;
  users: FollowUpQueueUser[];
}

export interface FollowUpCallsResponse {
  _isDemoData?: boolean;
  calls: FollowUpCall[];
}

export interface FollowUpAgentReportRow {
  adminName: string;
  totalCalls: number;
  answeredRate: number;
  overdueFollowUps: number;
  upgradeCalls: number;
  onboardingCalls: number;
  renewalCalls: number;
  callbackRequested: number;
}

export interface FollowUpReportSummary {
  _isDemoData?: boolean;
  period?: "7d" | "30d";
  callsToday: number;
  callsThisWeek: number;
  overdueCount: number;
  answeredRate: number;
  /** @deprecated use teamStats */
  callsByAdmin: { adminName: string; count: number }[];
  teamStats: FollowUpAgentReportRow[];
  outcomesBreakdown: { outcome: FollowUpOutcome; count: number }[];
  purposesBreakdown: { purpose: string; count: number }[];
}

export interface CreateFollowUpCallPayload {
  userId: number;
  outcome: FollowUpOutcome;
  purpose?: string;
  notes?: string;
  nextFollowUpAt?: string | null;
  /** Name of the ENS team member who made the call */
  agentName?: string;
}
