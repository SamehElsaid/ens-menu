"use client";

import { useTranslations } from "next-intl";
import { Button, ChoiceCard, SectionHeader } from "@/components/ui";
import {
  ADMIN_PERMISSION_KEYS,
  type AdminPermissionKey,
} from "@/types/AdminPermission";

const PERMISSION_LABEL_KEYS: Record<AdminPermissionKey, string> = {
  analytics: "analytics",
  users: "users",
  "follow-ups": "followUps",
  plans: "plans",
  payments: "payments",
  advertisements: "advertisements",
  promo: "promo",
  "app-version": "appVersion",
  "knowledge-management": "knowledgeManagement",
  administrators: "administrators",
  templates: "templateBuilder",
};

type AdminPermissionsEditorProps = {
  value: AdminPermissionKey[];
  onChange: (next: AdminPermissionKey[]) => void;
  disabled?: boolean;
};

export default function AdminPermissionsEditor({
  value,
  onChange,
  disabled = false,
}: AdminPermissionsEditorProps) {
  const t = useTranslations("adminAdministrators.permissions");
  const tNav = useTranslations("Dashboard");

  const toggle = (key: AdminPermissionKey) => {
    if (disabled) return;
    onChange(
      value.includes(key) ? value.filter((k) => k !== key) : [...value, key],
    );
  };

  const selectAll = () => onChange([...ADMIN_PERMISSION_KEYS]);
  const clearAll = () => onChange([]);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t("title")}
        description={t("hint")}
        actions={
          <>
            <Button
              variant="link"
              size="sm"
              disabled={disabled}
              onClick={selectAll}
            >
              {t("selectAll")}
            </Button>
            <Button
              variant="link"
              size="sm"
              disabled={disabled}
              onClick={clearAll}
              className="text-fg-muted"
            >
              {t("clearAll")}
            </Button>
          </>
        }
      />

      <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
        {ADMIN_PERMISSION_KEYS.map((key) => (
          <ChoiceCard
            key={key}
            label={tNav(PERMISSION_LABEL_KEYS[key])}
            checked={value.includes(key)}
            disabled={disabled}
            onChange={() => toggle(key)}
            className="p-2.5"
          />
        ))}
      </div>
    </div>
  );
}
