"use client";

import { useTranslations } from "next-intl";
import {
  expandWithDependencies,
  lockedDependencyKeys,
  useStaffPermissionsCatalog,
} from "@/hooks/useStaffPermissionsCatalog";
import {
  IoLockClosedOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

const GROUP_LABEL_KEYS: Record<string, string> = {
  orders: "groups.orders",
  menu: "groups.menu",
  dashboard: "groups.dashboard",
  delivery: "groups.delivery",
  staff: "groups.staff",
  settings: "groups.settings",
  analytics: "groups.analytics",
  ads: "groups.ads",
};

interface StaffPermissionsEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export default function StaffPermissionsEditor({
  value,
  onChange,
  disabled = false,
}: StaffPermissionsEditorProps) {
  const t = useTranslations("StaffPermissions");
  const tRoot = useTranslations();
  const { catalog, loading, byGroup, groups } = useStaffPermissionsCatalog();

  const selected = new Set(value);
  const locked = lockedDependencyKeys(value, catalog);

  const toggle = (key: string) => {
    if (disabled) return;
    if (selected.has(key)) {
      // Locked dependencies cannot be removed directly.
      if (locked.has(key)) return;
      const next = value.filter((k) => k !== key);
      onChange(next);
    } else {
      onChange(expandWithDependencies([...value, key], catalog));
    }
  };

  const selectAll = () => {
    if (disabled || !catalog) return;
    onChange(catalog.permissions.map((p) => p.key));
  };
  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span
          className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (!catalog) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">
        {t("loadError")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <IoInformationCircleOutline className="shrink-0 text-sm" aria-hidden />
          <span>{t("dependencyHint")}</span>
        </div>
        <div className="flex shrink-0 gap-2 text-xs">
          <button
            type="button"
            disabled={disabled}
            onClick={selectAll}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {t("selectAll")}
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button
            type="button"
            disabled={disabled}
            onClick={clearAll}
            className="font-medium text-slate-500 hover:underline disabled:opacity-50 dark:text-slate-400"
          >
            {t("clearAll")}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[46vh] overflow-y-auto pe-1">
        {groups.map((group) => {
          const perms = byGroup[group] ?? [];
          if (perms.length === 0) return null;
          const groupLabelKey = GROUP_LABEL_KEYS[group];
          return (
            <fieldset
              key={group}
              className="rounded-xl border border-slate-200 dark:border-slate-700/70"
            >
              <legend className="mx-3 px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {groupLabelKey ? t(groupLabelKey) : group}
              </legend>
              <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                {perms.map((perm) => {
                  const isChecked = selected.has(perm.key);
                  const isLocked = isChecked && locked.has(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`group flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isChecked
                          ? "border-primary/40 bg-primary/5 dark:border-primary/40 dark:bg-primary/10"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                      } ${
                        disabled || isLocked
                          ? "cursor-not-allowed opacity-80"
                          : "cursor-pointer"
                      }`}
                      title={
                        isLocked ? t("lockedByDependency") : undefined
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={disabled || isLocked}
                        onChange={() => toggle(perm.key)}
                        className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/30 disabled:opacity-60 dark:border-slate-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
                          {tRoot(
                            perm.labelKey as Parameters<typeof tRoot>[0],
                          )}
                          {isLocked && (
                            <IoLockClosedOutline
                              className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500"
                              aria-hidden
                            />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                          {tRoot(
                            perm.descriptionKey as Parameters<typeof tRoot>[0],
                          )}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
