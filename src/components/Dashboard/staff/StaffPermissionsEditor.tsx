"use client";

import { useId } from "react";
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
import { Alert, Button, Checkbox, LoadingBlock } from "@/components/ui";
import { cn } from "@/lib/cn";

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

/**
 * The permission set for a role, as a checklist ledger.
 *
 * Forty permissions in bordered two-column tiles read as forty separate
 * decisions; one rounded panel with a sans header per group reads as a form
 * you work down. A selected row is marked with the purple inline edge rather
 * than a tinted fill — the same signal `Card`'s `active` prop draws, hand-rolled
 * here because these rows share edges with their neighbours instead of being
 * panels of their own.
 */
export default function StaffPermissionsEditor({
  value,
  onChange,
  disabled = false,
}: StaffPermissionsEditorProps) {
  const t = useTranslations("StaffPermissions");
  const tRoot = useTranslations();
  const { catalog, loading, byGroup, groups } = useStaffPermissionsCatalog();
  const headingId = useId();

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
    return <LoadingBlock size="md" className="min-h-24" />;
  }

  if (!catalog) {
    return <Alert tone="danger">{t("loadError")}</Alert>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex min-w-0 items-start gap-1.5 text-xs leading-relaxed text-fg-muted">
          <IoInformationCircleOutline
            className="mt-px shrink-0 text-sm"
            aria-hidden
          />
          <span>{t("dependencyHint")}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            disabled={disabled}
            onClick={selectAll}
          >
            {t("selectAll")}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={disabled}
            onClick={clearAll}
          >
            {t("clearAll")}
          </Button>
        </div>
      </div>

      <div className="max-h-[46vh] overflow-y-auto rounded-lg border border-line bg-surface">
        {groups.map((group) => {
          const perms = byGroup[group] ?? [];
          if (perms.length === 0) return null;
          const groupLabelKey = GROUP_LABEL_KEYS[group];
          const groupHeadingId = `${headingId}-${group}`;
          return (
            <section
              key={group}
              role="group"
              aria-labelledby={groupHeadingId}
              className="border-b border-line last:border-b-0"
            >
              {/* Sticky so the group a row belongs to is still named after
                  scrolling forty rows inside a 46vh well. */}
              <h4
                id={groupHeadingId}
                className="ui-label sticky top-0 z-10 border-b border-line bg-surface-2 px-3 py-1.5"
              >
                {groupLabelKey ? t(groupLabelKey) : group}
              </h4>
              <ul className="divide-y divide-line">
                {perms.map((perm) => {
                  const isChecked = selected.has(perm.key);
                  const isLocked = isChecked && locked.has(perm.key);
                  return (
                    <li
                      key={perm.key}
                      className={cn(
                        "relative px-3 py-2",
                        isChecked &&
                          "before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-accent before:content-['']",
                        (disabled || isLocked) && "opacity-80",
                      )}
                      title={isLocked ? t("lockedByDependency") : undefined}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={disabled || isLocked}
                        onChange={() => toggle(perm.key)}
                        label={
                          <span className="flex items-center gap-1.5">
                            {tRoot(
                              perm.labelKey as Parameters<typeof tRoot>[0],
                            )}
                            {isLocked ? (
                              <>
                                <IoLockClosedOutline
                                  className="shrink-0 text-[11px] text-fg-subtle"
                                  aria-hidden
                                />
                                <span className="sr-only">
                                  {t("lockedByDependency")}
                                </span>
                              </>
                            ) : null}
                          </span>
                        }
                        hint={tRoot(
                          perm.descriptionKey as Parameters<typeof tRoot>[0],
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
