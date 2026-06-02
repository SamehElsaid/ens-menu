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
  const { canAccessPath } = useAdminPermissions();

  useEffect(() => {
    if (canAccessPath(pathname)) return;
    toast.error(t("accessDenied"));
    router.replace("/admin");
  }, [canAccessPath, pathname, router, t]);

  if (!canAccessPath(pathname)) {
    return null;
  }

  return children;
}
