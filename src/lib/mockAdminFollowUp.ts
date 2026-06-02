import type {
  CreateFollowUpCallPayload,
  FollowUpCall,
  FollowUpAgentReportRow,
  FollowUpPurpose,
  FollowUpQueueSegment,
  FollowUpQueueUser,
  FollowUpReportSummary,
} from "@/types/AdminFollowUp";

const STORAGE_KEY = "ensmenu_demo_follow_up_calls";

type RawUser = {
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

function readStoredCalls(): FollowUpCall[] {
  if (typeof window === "undefined") return getSeedCalls();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedCalls();
    const parsed = JSON.parse(raw) as FollowUpCall[];
    return Array.isArray(parsed) ? parsed : getSeedCalls();
  } catch {
    return getSeedCalls();
  }
}

function writeStoredCalls(calls: FollowUpCall[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
}

function getSeedCalls(): FollowUpCall[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      userId: 101,
      userName: "Demo Restaurant",
      adminName: "Ahmed Hassan",
      outcome: "answered",
      purpose: "onboarding",
      notes: "Interested in Pro after menu setup.",
      calledAt: new Date(now - 86400000 * 2).toISOString(),
      nextFollowUpAt: new Date(now + 86400000 * 3).toISOString().slice(0, 10),
      _isDemoData: true,
    },
    {
      id: "seed-2",
      userId: 102,
      userName: "Cafe Nile",
      adminName: "Sara Mohamed",
      outcome: "no_answer",
      purpose: "renewal",
      notes: "Try again tomorrow morning.",
      calledAt: new Date(now - 86400000).toISOString(),
      nextFollowUpAt: new Date(now - 86400000).toISOString().slice(0, 10),
      _isDemoData: true,
    },
    {
      id: "seed-3",
      userId: 103,
      userName: "Burger House",
      adminName: "Ahmed Hassan",
      outcome: "answered",
      purpose: "upgrade_pro",
      notes: "Sent Pro pricing link.",
      calledAt: new Date(now - 86400000 * 4).toISOString(),
      nextFollowUpAt: new Date(now + 86400000 * 2).toISOString().slice(0, 10),
      _isDemoData: true,
    },
    {
      id: "seed-4",
      userId: 104,
      userName: "Pizza Line",
      adminName: "Sara Mohamed",
      outcome: "callback_requested",
      purpose: "support",
      notes: "Asked to call after 6 PM.",
      calledAt: new Date(now - 3600000 * 5).toISOString(),
      nextFollowUpAt: new Date(now + 86400000).toISOString().slice(0, 10),
      _isDemoData: true,
    },
    {
      id: "seed-5",
      userId: 101,
      userName: "Demo Restaurant",
      adminName: "Ahmed Hassan",
      outcome: "busy",
      purpose: "onboarding",
      calledAt: new Date(now - 86400000 * 10).toISOString(),
      nextFollowUpAt: null,
      _isDemoData: true,
    },
    {
      id: "seed-6",
      userId: 102,
      userName: "Cafe Nile",
      adminName: "Sara Mohamed",
      outcome: "answered",
      purpose: "upgrade_pro",
      calledAt: new Date(now - 86400000 * 20).toISOString(),
      nextFollowUpAt: null,
      _isDemoData: true,
    },
  ];
}

function localeAdminName(): string {
  return "Admin Demo";
}

function countByPurpose(
  calls: FollowUpCall[],
  purpose: FollowUpPurpose,
): number {
  return calls.filter((c) => c.purpose === purpose).length;
}

function buildTeamStats(
  calls: FollowUpCall[],
  startOfToday: number,
): FollowUpAgentReportRow[] {
  const byAdmin = new Map<string, FollowUpCall[]>();

  for (const call of calls) {
    const name = call.adminName?.trim() || localeAdminName();
    const list = byAdmin.get(name) ?? [];
    list.push(call);
    byAdmin.set(name, list);
  }

  return [...byAdmin.entries()]
    .map(([adminName, agentCalls]) => {
      const answered = agentCalls.filter((c) => c.outcome === "answered").length;
      const overdueFollowUps = agentCalls.filter(
        (c) =>
          c.nextFollowUpAt &&
          new Date(c.nextFollowUpAt).getTime() < startOfToday,
      ).length;

      return {
        adminName,
        totalCalls: agentCalls.length,
        answeredRate:
          agentCalls.length > 0
            ? Math.round((answered / agentCalls.length) * 100)
            : 0,
        overdueFollowUps,
        upgradeCalls: countByPurpose(agentCalls, "upgrade_pro"),
        onboardingCalls: countByPurpose(agentCalls, "onboarding"),
        renewalCalls: countByPurpose(agentCalls, "renewal"),
        callbackRequested: agentCalls.filter(
          (c) => c.outcome === "callback_requested",
        ).length,
      };
    })
    .sort((a, b) => b.totalCalls - a.totalCalls);
}

function buildFollowUpReport(
  allCalls: FollowUpCall[],
  period: "7d" | "30d" = "7d",
): FollowUpReportSummary {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const weekAgo = Date.now() - 7 * 86400000;
  const periodMs = period === "30d" ? 30 * 86400000 : 7 * 86400000;
  const periodStart = Date.now() - periodMs;

  const periodCalls = allCalls.filter(
    (c) => new Date(c.calledAt).getTime() >= periodStart,
  );

  const callsToday = allCalls.filter(
    (c) => new Date(c.calledAt).getTime() >= startOfToday,
  ).length;
  const callsThisWeek = allCalls.filter(
    (c) => new Date(c.calledAt).getTime() >= weekAgo,
  ).length;

  const overdueCount = allCalls.filter(
    (c) =>
      c.nextFollowUpAt &&
      new Date(c.nextFollowUpAt).getTime() < startOfToday,
  ).length;

  const answered = periodCalls.filter((c) => c.outcome === "answered").length;
  const answeredRate =
    periodCalls.length > 0
      ? Math.round((answered / periodCalls.length) * 100)
      : 0;

  const outcomeCounts = new Map<string, number>();
  for (const call of periodCalls) {
    outcomeCounts.set(call.outcome, (outcomeCounts.get(call.outcome) ?? 0) + 1);
  }

  const purposeCounts = new Map<string, number>();
  for (const call of periodCalls) {
    if (!call.purpose) continue;
    purposeCounts.set(call.purpose, (purposeCounts.get(call.purpose) ?? 0) + 1);
  }

  const teamStats = buildTeamStats(periodCalls, startOfToday);

  return {
    _isDemoData: true,
    period,
    callsToday,
    callsThisWeek,
    overdueCount,
    answeredRate,
    callsByAdmin: teamStats.map(({ adminName, totalCalls }) => ({
      adminName,
      count: totalCalls,
    })),
    teamStats,
    outcomesBreakdown: [...outcomeCounts.entries()].map(([outcome, count]) => ({
      outcome: outcome as FollowUpReportSummary["outcomesBreakdown"][0]["outcome"],
      count,
    })),
    purposesBreakdown: [...purposeCounts.entries()].map(([purpose, count]) => ({
      purpose: purpose as FollowUpReportSummary["purposesBreakdown"][0]["purpose"],
      count,
    })),
  };
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return (new Date(dateStr).getTime() - Date.now()) / 86400000;
}

function computeSegments(
  user: RawUser,
  lastCall: FollowUpCall | null,
): FollowUpQueueSegment[] {
  const segments: FollowUpQueueSegment[] = [];
  const plan = user.planName?.toLowerCase() ?? "";

  if (plan.includes("free")) segments.push("free");
  if (plan.includes("pro")) segments.push("pro");

  const createdDays = daysSince(user.createdAt);
  if (createdDays !== null && createdDays <= 7) segments.push("new");

  if ((user.menusCount ?? 0) === 0) segments.push("no-menu");

  const untilExpiry = daysUntil(user.endDate);
  if (untilExpiry !== null && untilExpiry >= 0 && untilExpiry <= 14) {
    segments.push("expiring");
  }

  const sinceLogin = daysSince(user.lastLoginAt);
  if (sinceLogin === null || sinceLogin > 30) segments.push("inactive");

  const nextFollowUp = lastCall?.nextFollowUpAt;
  if (nextFollowUp && new Date(nextFollowUp).getTime() < Date.now()) {
    segments.push("overdue");
  }

  return segments;
}

function latestCallForUser(
  calls: FollowUpCall[],
  userId: number,
): FollowUpCall | null {
  return (
    calls
      .filter((c) => c.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime(),
      )[0] ?? null
  );
}

export function buildMockQueueFromUsers(
  users: RawUser[],
  segment: FollowUpQueueSegment,
): FollowUpQueueUser[] {
  const calls = readStoredCalls();

  const queue = users.map((user) => {
    const lastCall = latestCallForUser(calls, user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      planName: user.planName,
      menusCount: user.menusCount ?? 0,
      lastLoginAt: user.lastLoginAt,
      endDate: user.endDate,
      createdAt: user.createdAt,
      lastCall,
      nextFollowUpAt: lastCall?.nextFollowUpAt ?? null,
      segments: computeSegments(user, lastCall),
    };
  });

  if (segment === "all") return queue;

  return queue.filter((u) => u.segments.includes(segment));
}

export function getMockFollowUpCalls(filters?: {
  userId?: number;
  from?: string;
  to?: string;
}): FollowUpCall[] {
  let calls = readStoredCalls();
  if (filters?.userId) {
    calls = calls.filter((c) => c.userId === filters.userId);
  }
  if (filters?.from) {
    const from = new Date(filters.from).getTime();
    calls = calls.filter((c) => new Date(c.calledAt).getTime() >= from);
  }
  if (filters?.to) {
    const to = new Date(filters.to).getTime();
    calls = calls.filter((c) => new Date(c.calledAt).getTime() <= to);
  }
  return calls.sort(
    (a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime(),
  );
}

export function createMockFollowUpCall(
  payload: CreateFollowUpCallPayload,
  userName?: string,
): FollowUpCall {
  const calls = readStoredCalls();
  const entry: FollowUpCall = {
    id: `demo-${Date.now()}`,
    userId: payload.userId,
    userName,
    adminName: payload.agentName?.trim() || localeAdminName(),
    outcome: payload.outcome,
    purpose: payload.purpose,
    notes: payload.notes,
    calledAt: new Date().toISOString(),
    nextFollowUpAt: payload.nextFollowUpAt ?? null,
    _isDemoData: true,
  };
  writeStoredCalls([entry, ...calls]);
  return entry;
}

export function getMockFollowUpReport(
  period: "7d" | "30d" = "7d",
): FollowUpReportSummary {
  return buildFollowUpReport(readStoredCalls(), period);
}

export function getDemoQueueUsers(locale: string): RawUser[] {
  const isAr = locale === "ar";
  const now = Date.now();
  return [
    {
      id: 101,
      name: isAr ? "مطعم النخيل" : "Palm Restaurant",
      email: "palm@demo.com",
      phoneNumber: "+201234567890",
      planName: "Free",
      menusCount: 0,
      lastLoginAt: new Date(now - 86400000 * 2).toISOString(),
      endDate: null,
      createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: 102,
      name: isAr ? "كافيه النيل" : "Cafe Nile",
      email: "cafe@demo.com",
      phoneNumber: "+201112223344",
      planName: "Pro",
      menusCount: 2,
      lastLoginAt: new Date(now - 86400000 * 45).toISOString(),
      endDate: new Date(now + 86400000 * 5).toISOString(),
      createdAt: new Date(now - 86400000 * 120).toISOString(),
    },
    {
      id: 103,
      name: isAr ? "برجر هاوس" : "Burger House",
      email: "burger@demo.com",
      phoneNumber: "+201555666777",
      planName: "Free",
      menusCount: 1,
      lastLoginAt: new Date(now - 86400000 * 10).toISOString(),
      endDate: null,
      createdAt: new Date(now - 86400000 * 20).toISOString(),
    },
    {
      id: 104,
      name: isAr ? "بيتزا لاين" : "Pizza Line",
      email: "pizza@demo.com",
      phoneNumber: null,
      planName: "Pro",
      menusCount: 3,
      lastLoginAt: new Date(now - 86400000 * 1).toISOString(),
      endDate: new Date(now + 86400000 * 12).toISOString(),
      createdAt: new Date(now - 86400000 * 200).toISOString(),
    },
  ];
}
