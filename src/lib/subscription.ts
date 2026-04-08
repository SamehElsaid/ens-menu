/** Matches dashboard checks: planId 1 = Free (see settings / advertisements pages). */
export function isFreePlanUser(userData: unknown): boolean {
  const planId = (
    userData as { user?: { subscription?: { planId?: number } } }
  )?.user?.subscription?.planId;
  return planId === 1;
}
