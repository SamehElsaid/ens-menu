"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import type { Plan, PlansResponse } from "@/types/Plan";

type UsePlansOptions = {
  /** When true, use /user/plans if logged in (personalized intro offers). Default true. */
  personalized?: boolean;
};

export function usePlans({ personalized = true }: UsePlansOptions = {}) {
  const locale = useLocale();
  const authPayload = useAppSelector((s) => s.auth.data) as {
    user?: unknown;
  } | null;
  const isLoggedIn = Boolean(authPayload?.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const usePersonalized = personalized && isLoggedIn;
    const endpoint = usePersonalized ? "/user/plans" : "/public/plans";
    const res = await axiosGet<PlansResponse>(
      endpoint,
      locale,
      undefined,
      undefined,
      !usePersonalized,
    );
    if (res.status && res.data?.plans?.length) {
      setPlans(res.data.plans);
    } else {
      setPlans([]);
    }
    setLoading(false);
  }, [locale, isLoggedIn, personalized]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const proPlan = plans.find((p) => p.name?.toLowerCase() === "pro");
  const freePlan = plans.find((p) => p.name?.toLowerCase() === "free");

  return { plans, proPlan, freePlan, loading, reloadPlans: loadPlans };
}
