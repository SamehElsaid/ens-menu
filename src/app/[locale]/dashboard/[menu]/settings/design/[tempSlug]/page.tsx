"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import TemplateDesignCustomizePanel from "@/components/Settings/TemplateDesignCustomizePanel";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { menuDashboardPath } from "@/lib/menuDashboardPath";

export default function TemplateDesignCustomizePage() {
  const params = useParams<{ tempSlug: string }>();
  const tempSlug = (params?.tempSlug as string) || "default";
  const router = useRouter();
  const userData = useAppSelector((s) => s.auth.data);
  const menu = useAppSelector((s) => s.menuData.menu);
  const isFreePlan = !userData || isFreePlanUser(userData);

  useEffect(() => {
    if (isFreePlan) {
      router.replace(menuDashboardPath(menu, "subscription"));
    }
  }, [isFreePlan, router, menu]);

  if (isFreePlan) return null;

  return <TemplateDesignCustomizePanel tempSlug={tempSlug} />;
}
