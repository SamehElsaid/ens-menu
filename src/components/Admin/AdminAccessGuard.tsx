"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export default function AdminAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("adminAdministrators.permissions");
  const { canAccessPath, loaded } = useAdminPermissions();

  useEffect(() => {
    if (!loaded) return;
    if (canAccessPath(pathname)) return;
    toast.error(t("accessDenied"));
    router.replace("/admin");
  }, [canAccessPath, loaded, pathname, router, t]);

  if (!loaded) {
    return null;
  }

  if (!canAccessPath(pathname)) {
    return null;
  }

  return children;
}
