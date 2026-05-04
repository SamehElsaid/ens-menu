"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useRef } from "react";
import {
  evaluateCashierDashboardPath,
  stripLocaleFromPath,
  type CashierAcl,
} from "@/utils/cashierDashboardAccess";

/** Roles that use `user.cashier` ACL (linked owner dashboard users). */
const ROLES_WITH_CASHIER_ACL = new Set(["cashier"]);

type CashierPayload = {
  menuIds?: number[];
  pageKeys?: string[];
};

function normalizePath(p: string) {
  return stripLocaleFromPath(p).replace(/\/+$/, "") || "/";
}

export function CashierDashboardGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth.data) as {
    user?: { role?: string; cashier?: CashierPayload };
  } | null;
  const user = auth?.user;
  const role = user?.role;
  const lastApplied = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !role || !ROLES_WITH_CASHIER_ACL.has(role)) return;

    const menuIds = Array.isArray(user.cashier?.menuIds)
      ? user.cashier!.menuIds!.map((n) => Number(n)).filter(Number.isFinite)
      : [];
    const pageKeys = Array.isArray(user.cashier?.pageKeys)
      ? user.cashier!.pageKeys!.map(String)
      : [];

    const acl: CashierAcl = { menuIds, pageKeys };
    const path = pathname ?? "";
    const result = evaluateCashierDashboardPath(path, acl);

    if (result.ok) {
      lastApplied.current = null;
      return;
    }

    const target = result.redirect;
    if (normalizePath(path) === normalizePath(target)) return;
    if (lastApplied.current === `${path}→${target}`) return;
    lastApplied.current = `${path}→${target}`;
    router.replace(target);
  }, [user, role, pathname, router]);

  return <>{children}</>;
}
