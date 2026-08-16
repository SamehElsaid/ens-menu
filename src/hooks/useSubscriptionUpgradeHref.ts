"use client";

import { useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import { getSubscriptionUpgradeHref } from "@/lib/authRedirect";

export default function useSubscriptionUpgradeHref(): string {
  return useSyncExternalStore(
    () => () => {},
    () => getSubscriptionUpgradeHref(!!Cookies.get("ens_ui")),
    () => getSubscriptionUpgradeHref(false),
  );
}
