"use client";

import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { usePlans } from "@/hooks/usePlans";
import {
  DEFAULT_FREE_CAPABILITIES,
  DEFAULT_PRO_CAPABILITIES,
  type PlanCapabilities,
} from "@/types/PlanCapabilities";

/** Current user's plan capabilities (Free or paid plan from /plans). */
export function useCurrentPlanCapabilities(): PlanCapabilities {
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);
  const { freePlan, proPlan } = usePlans();

  if (isFreePlan) {
    return freePlan?.capabilities ?? DEFAULT_FREE_CAPABILITIES;
  }
  return proPlan?.capabilities ?? DEFAULT_PRO_CAPABILITIES;
}
