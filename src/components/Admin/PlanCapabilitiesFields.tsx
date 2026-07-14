"use client";

import type { PlanCapabilities } from "@/types/PlanCapabilities";
import { PLAN_THEME_OPTIONS } from "@/types/PlanCapabilities";

type CapsFormProps = {
  value: PlanCapabilities;
  onChange: (next: PlanCapabilities) => void;
  t: (key: string) => string;
  idPrefix: string;
};

const TOGGLE_KEYS: Array<{
  key: keyof Pick<
    PlanCapabilities,
    | "aiMenuImport"
    | "tableOrderingQr"
    | "liveOrderNotifications"
    | "staffAndTables"
    | "advancedDeliveryMaps"
  >;
  labelKey: string;
}> = [
  { key: "aiMenuImport", labelKey: "caps.aiMenuImport" },
  { key: "tableOrderingQr", labelKey: "caps.tableOrderingQr" },
  { key: "liveOrderNotifications", labelKey: "caps.liveOrderNotifications" },
  { key: "staffAndTables", labelKey: "caps.staffAndTables" },
  { key: "advancedDeliveryMaps", labelKey: "caps.advancedDeliveryMaps" },
];

export default function PlanCapabilitiesFields({
  value,
  onChange,
  t,
  idPrefix,
}: CapsFormProps) {
  const unlimitedAds = value.maxAdsPerMenu === -1;

  return (
    <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {t("caps.title")}
      </h3>

      <div className="space-y-3">
        {TOGGLE_KEYS.map(({ key, labelKey }) => (
          <div key={key} className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`${idPrefix}-${key}`}
              checked={Boolean(value[key])}
              onChange={(e) =>
                onChange({ ...value, [key]: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor={`${idPrefix}-${key}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t(labelKey)}
            </label>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="checkbox"
            id={`${idPrefix}-unlimitedAds`}
            checked={unlimitedAds}
            onChange={(e) =>
              onChange({
                ...value,
                maxAdsPerMenu: e.target.checked ? -1 : 1,
              })
            }
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor={`${idPrefix}-unlimitedAds`}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t("caps.unlimitedAds")}
          </label>
        </div>
        {!unlimitedAds && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("caps.maxAdsPerMenu")}
            </label>
            <input
              type="number"
              min={0}
              value={value.maxAdsPerMenu}
              onChange={(e) =>
                onChange({
                  ...value,
                  maxAdsPerMenu: e.target.value
                    ? Number(e.target.value)
                    : 0,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t("caps.allowedThemes")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PLAN_THEME_OPTIONS.map((theme) => {
            const checked = value.allowedThemes.includes(theme.id);
            return (
              <label
                key={theme.id}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...value.allowedThemes, theme.id]
                      : value.allowedThemes.filter((id) => id !== theme.id);
                    onChange({
                      ...value,
                      allowedThemes: next.length ? next : ["default"],
                    });
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                {t(theme.labelKey)}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
