"use client";

import { useTranslations } from "next-intl";
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
      value.includes(key)
        ? value.filter((k) => k !== key)
        : [...value, key],
    );
  };

  const selectAll = () => onChange([...ADMIN_PERMISSION_KEYS]);
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t("title")}
        </p>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            disabled={disabled}
            onClick={selectAll}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {t("selectAll")}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            disabled={disabled}
            onClick={clearAll}
            className="text-slate-500 hover:underline disabled:opacity-50"
          >
            {t("clearAll")}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t("hint")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pe-1">
        {ADMIN_PERMISSION_KEYS.map((key) => (
          <label
            key={key}
            className={`flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={value.includes(key)}
              disabled={disabled}
              onChange={() => toggle(key)}
              className="rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            <span>{tNav(PERMISSION_LABEL_KEYS[key])}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
