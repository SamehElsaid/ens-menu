"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getSubscriptionUpgradeHref } from "@/lib/authRedirect";

export default function useSubscriptionUpgradeHref(): string {
  const [href, setHref] = useState(() => getSubscriptionUpgradeHref(false));

  useEffect(() => {
    setHref(getSubscriptionUpgradeHref(!!Cookies.get("sub")));
  }, []);

  return href;
}
