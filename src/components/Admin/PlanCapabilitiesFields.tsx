"use client";

import {
  Checkbox,
  Field,
  Fieldset,
  Input,
  SectionHeader,
} from "@/components/ui";
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
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <SectionHeader title={t("caps.title")} />

      <div className="flex flex-col gap-3">
        {TOGGLE_KEYS.map(({ key, labelKey }) => (
          <Checkbox
            key={key}
            id={`${idPrefix}-${key}`}
            label={t(labelKey)}
            checked={Boolean(value[key])}
            onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Checkbox
          id={`${idPrefix}-unlimitedAds`}
          label={t("caps.unlimitedAds")}
          checked={unlimitedAds}
          onChange={(e) =>
            onChange({
              ...value,
              maxAdsPerMenu: e.target.checked ? -1 : 1,
            })
          }
        />
        {!unlimitedAds && (
          <Field label={t("caps.maxAdsPerMenu")}>
            <Input
              type="number"
              min={0}
              value={value.maxAdsPerMenu}
              onChange={(e) =>
                onChange({
                  ...value,
                  maxAdsPerMenu: e.target.value ? Number(e.target.value) : 0,
                })
              }
            />
          </Field>
        )}
      </div>

      <Fieldset legend={t("caps.allowedThemes")}>
        <div className="grid grid-cols-2 gap-2">
          {PLAN_THEME_OPTIONS.map((theme) => {
            const checked = value.allowedThemes.includes(theme.id);
            return (
              <Checkbox
                key={theme.id}
                label={t(theme.labelKey)}
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
              />
            );
          })}
        </div>
      </Fieldset>
    </div>
  );
}
