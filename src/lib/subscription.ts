/** Free plan: planId 1 and/or plan name Free. Pro and other paid plans are never treated as free. */
export function isFreePlanUser(userData: unknown): boolean {
  const sub = (
    userData as {
      user?: {
        subscription?: { planId?: number; planName?: string };
      };
    }
  )?.user?.subscription;
  if (!sub) return false;

  const planName = String(sub.planName ?? "").toLowerCase().trim();
  if (planName === "pro") return false;

  if (sub.planId === 1) return true;
  if (planName === "free") return true;
  return false;
}
