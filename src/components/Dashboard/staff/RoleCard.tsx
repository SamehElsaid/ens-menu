"use client";

import { useTranslations } from "next-intl";
import type { MenuStaffRole } from "@/types/Menu";
import {
  roleDisplayName,
  isComingSoonStaffRole,
} from "@/shared/roleDisplayName";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  IoCreateOutline,
  IoTrashOutline,
  IoPeopleOutline,
  IoLockClosedOutline,
  IoCopyOutline,
} from "react-icons/io5";

interface RoleCardProps {
  role: MenuStaffRole;
  locale: string;
  onEdit: (role: MenuStaffRole) => void;
  onDelete: (role: MenuStaffRole) => void;
  onDuplicate: (role: MenuStaffRole) => void;
}

const MAX_VISIBLE_PERMISSIONS = 6;

export default function RoleCard({
  role,
  locale,
  onEdit,
  onDelete,
  onDuplicate,
}: RoleCardProps) {
  const t = useTranslations("Roles");
  const tRoot = useTranslations();
  const isRTL = locale === "ar";

  const isComingSoon = isComingSoonStaffRole(role);
  const canDelete = !role.isDefault && !isComingSoon && role.staffCount === 0;
  const displayName = roleDisplayName(role, locale);
  const visible = role.permissions.slice(0, MAX_VISIBLE_PERMISSIONS);
  const extraCount = role.permissions.length - visible.length;

  const permLabel = (key: string) => {
    try {
      return tRoot(
        `StaffPermissions.keys.${key}` as Parameters<typeof tRoot>[0],
      );
    } catch {
      return key;
    }
  };

  return (
    <Card
      as="article"
      className={cn(
        "flex h-full flex-col",
        isComingSoon && "border-dashed bg-surface-2/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3
            className="truncate text-sm font-semibold text-fg"
            title={displayName}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {displayName}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
            <IoPeopleOutline className="size-3.5" aria-hidden />
            {t("staffCount", { count: role.staffCount })}
          </p>
        </div>

        {isComingSoon ? (
          <Badge tone="neutral">{t("comingSoonBadge")}</Badge>
        ) : role.isDefault ? (
          <Badge tone="brand">{t("defaultBadge")}</Badge>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="ui-label mb-1.5">
          {t("permissionsLabel")} ({role.permissions.length})
        </p>
        {role.permissions.length === 0 ? (
          <p className="text-xs text-fg-subtle">{t("noPermissions")}</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {visible.map((key) => (
              <Badge key={key} tone="neutral">
                {permLabel(key)}
              </Badge>
            ))}
            {extraCount > 0 ? <Badge tone="brand">+{extraCount}</Badge> : null}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-line pt-2.5">
        {isComingSoon ? (
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-fg-subtle">
            <IoLockClosedOutline className="mt-px shrink-0" aria-hidden />
            {t("comingSoonLocked")}
          </p>
        ) : role.isDefault ? (
          <div className="space-y-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onDuplicate(role)}
              title={t("duplicateHint")}
              startIcon={<IoCopyOutline className="size-3.5" />}
            >
              {t("duplicate")}
            </Button>
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-fg-subtle">
              <IoLockClosedOutline className="mt-px shrink-0" aria-hidden />
              {t("defaultLocked")}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(role)}
              startIcon={<IoCreateOutline className="size-3.5" />}
            >
              {t("edit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => onDuplicate(role)}
              title={t("duplicateHint")}
              aria-label={t("duplicate")}
            >
              <IoCopyOutline className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="dangerGhost"
              size="sm"
              className="flex-1"
              onClick={() => canDelete && onDelete(role)}
              disabled={!canDelete}
              title={canDelete ? t("delete") : t("deleteBlocked")}
              startIcon={
                canDelete ? (
                  <IoTrashOutline className="size-3.5" />
                ) : (
                  <IoLockClosedOutline className="size-3.5" />
                )
              }
            >
              {t("delete")}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
