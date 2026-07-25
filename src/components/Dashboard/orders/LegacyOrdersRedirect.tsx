"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import Loader from "@/components/Global/Loader";
import { useDashboardMenus } from "@/hooks/useDashboardMenus";

interface LegacyOrdersRedirectProps {
  target: "/dashboard/orders" | "/dashboard/delivery-orders";
}

/**
 * Orders moved to the account level. The old per-menu link lands on the global
 * page pre-filtered to that menu, but the `[menu]` segment may be a slug or a
 * uuid while the filter is keyed by numeric id, so it has to be resolved first.
 */
export default function LegacyOrdersRedirect({
  target,
}: LegacyOrdersRedirectProps) {
  const router = useRouter();
  const params = useParams();
  const { menus, loading } = useDashboardMenus();

  const segment =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");
  const isNumericId = /^\d+$/.test(segment);

  useEffect(() => {
    if (isNumericId) {
      router.replace(`${target}?menuId=${segment}`);
      return;
    }
    if (loading) return;

    const match = menus.find(
      (menu) => menu.slug === segment || menu.uuid === segment,
    );
    router.replace(match ? `${target}?menuId=${match.id}` : target);
  }, [router, target, segment, isNumericId, menus, loading]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  );
}
