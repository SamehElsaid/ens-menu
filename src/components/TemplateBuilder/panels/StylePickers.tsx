"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CardStyleId } from "@/lib/template-builder/library/stylePresets";
import {
  CARD_STYLE_PRESETS,
  CATEGORY_LAYOUT_PRESETS,
  CATEGORY_LAYOUT_DEFAULTS,
  AD_STYLE_PRESETS,
  AD_STYLE_DEFAULTS,
  NAVBAR_STYLE_PRESETS,
  HERO_STYLE_PRESETS,
  FOOTER_STYLE_PRESETS,
  HEADER_STYLE_PRESETS,
  CARD_STYLE_DEFAULTS,
  HEADER_STYLE_DEFAULTS,
  type CategoryLayoutId,
  type AdStyleId,
  type NavbarStyleId,
  type HeroStyleId,
  type FooterStyleId,
  type HeaderStyleId,
} from "@/lib/template-builder/library/stylePresets";

function usePresetLabel() {
  const locale = useLocale();
  return (p: { label: string; labelAr: string }) =>
    locale === "ar" ? p.labelAr : p.label;
}

/** Mini visual thumbnails for card layouts */
function CardThumb({ id, active }: { id: CardStyleId; active: boolean }) {
  const ring = active ? "ring-2 ring-violet-500" : "ring-1 ring-slate-600";
  const base = `relative h-14 w-full overflow-hidden rounded-md bg-slate-800 ${ring}`;

  switch (id) {
    case "split":
      return (
        <div className={base}>
          <div className="absolute inset-y-0 start-0 w-[55%] bg-slate-600" />
          <div className="absolute inset-y-1 end-1 w-[50%] rounded bg-white/90 p-1">
            <div className="mb-0.5 h-1 w-8 rounded bg-violet-500/80" />
            <div className="h-1 w-6 rounded bg-slate-300" />
          </div>
        </div>
      );
    case "list":
      return (
        <div className={`${base} flex items-center gap-1.5 p-1.5`}>
          <div className="h-9 w-9 shrink-0 rounded bg-slate-600" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-10 rounded bg-slate-400" />
            <div className="h-1 w-6 rounded bg-violet-500/70" />
          </div>
        </div>
      );
    case "compact":
      return (
        <div className={base}>
          <div className="h-8 bg-slate-600" />
          <div className="space-y-0.5 p-1">
            <div className="h-1 w-8 rounded bg-slate-400" />
            <div className="h-1 w-4 rounded bg-violet-500/70" />
          </div>
        </div>
      );
    case "overlay":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
            <div className="h-1.5 w-10 rounded bg-white/90" />
            <div className="mt-0.5 h-1 w-5 rounded bg-violet-400" />
          </div>
        </div>
      );
    case "cover":
      return (
        <div className={base}>
          <div className="h-9 bg-slate-500" />
          <div className="space-y-0.5 bg-white/95 p-1">
            <div className="h-1 w-9 rounded bg-slate-700" />
            <div className="h-1 w-12 rounded bg-slate-300" />
          </div>
        </div>
      );
    case "bordered":
      return (
        <div
          className={`${base} border border-slate-400 bg-slate-900/40 p-1.5`}
        >
          <div className="mb-1 h-5 rounded bg-slate-600" />
          <div className="h-1 w-8 rounded bg-slate-400" />
        </div>
      );
    case "glass":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700/40 to-slate-700" />
          <div className="absolute inset-1 rounded border border-white/20 bg-white/15 backdrop-blur-sm p-1">
            <div className="h-1 w-8 rounded bg-white/80" />
            <div className="mt-1 h-1 w-5 rounded bg-violet-300/80" />
          </div>
        </div>
      );
    default:
      return <div className={base} />;
  }
}

function CategoryThumb({
  id,
  active,
}: {
  id: CategoryLayoutId;
  active: boolean;
}) {
  const ring = active ? "ring-2 ring-violet-500" : "ring-1 ring-slate-600";
  const base = `flex h-11 items-center justify-center gap-1 rounded-md bg-slate-800 px-1.5 ${ring}`;
  switch (id) {
    case "circles":
      return (
        <div className={base}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 w-5 rounded-full bg-slate-500" />
          ))}
        </div>
      );
    case "pills":
    case "gradient":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div key={i} className="h-4 w-8 rounded-full bg-violet-600/80" />
          ))}
        </div>
      );
    case "chips":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-4 w-7 rounded-md border border-slate-400"
            />
          ))}
        </div>
      );
    case "underline":
      return (
        <div className={`${base} gap-2 text-[8px] text-slate-300`}>
          <span className="border-b border-violet-400 pb-0.5">All</span>
          <span>Cat</span>
        </div>
      );
    case "rail":
      return (
        <div className={`${base} rounded-full bg-slate-700`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full border border-violet-400"
            />
          ))}
        </div>
      );
    case "squares":
      return (
        <div className={base}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 w-5 rounded-md bg-slate-500" />
          ))}
        </div>
      );
    case "cards":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-8 w-7 overflow-hidden rounded bg-slate-700"
            >
              <div className="h-4 bg-slate-500" />
              <div className="mx-auto mt-0.5 h-1 w-4 rounded bg-slate-400" />
            </div>
          ))}
        </div>
      );
    case "soft":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div key={i} className="h-4 w-8 rounded-full bg-violet-500/30" />
          ))}
        </div>
      );
    case "stacked":
      return (
        <div className={`${base} flex-col gap-0.5 py-1`}>
          <div className="h-2 w-full rounded bg-slate-600" />
          <div className="h-2 w-full rounded bg-slate-600" />
        </div>
      );
    case "iconOnly":
      return (
        <div className={base}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full border border-violet-400"
            />
          ))}
        </div>
      );
    case "numbered":
      return (
        <div className={`${base} text-[9px] text-violet-300`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
            1
          </span>
          <span className="h-1.5 w-8 rounded bg-slate-500" />
        </div>
      );
    case "glass":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-4 w-8 rounded-full border border-white/30 bg-white/10"
            />
          ))}
        </div>
      );
    case "imageStrip":
      return (
        <div className={base}>
          {[0, 1].map((i) => (
            <div key={i} className="h-6 w-10 rounded bg-slate-500" />
          ))}
        </div>
      );
    default:
      return <div className={base} />;
  }
}

function AdThumb({ id, active }: { id: AdStyleId; active: boolean }) {
  const ring = active ? "ring-2 ring-violet-500" : "ring-1 ring-slate-600";
  const base = `relative h-12 w-full overflow-hidden rounded-md bg-slate-600 ${ring}`;
  switch (id) {
    case "promo":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-700" />
        </div>
      );
    case "coverBottom":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1">
            <div className="h-1.5 w-10 rounded bg-white/90" />
          </div>
        </div>
      );
    case "coverCenter":
      return (
        <div
          className={`${base} flex items-center justify-center bg-slate-500`}
        >
          <div className="h-2 w-8 rounded bg-white/90" />
        </div>
      );
    case "brandLeft":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute inset-y-0 start-0 w-[35%] bg-white/90 p-1">
            <div className="h-1.5 w-6 rounded bg-violet-600" />
          </div>
        </div>
      );
    case "captionTop":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute end-1 top-1 h-2 w-8 rounded-full bg-black/60" />
        </div>
      );
    case "poster":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-600" />
          <div className="absolute bottom-1 start-1 space-y-0.5">
            <div className="h-2 w-10 rounded bg-white" />
            <div className="h-1 w-8 rounded bg-white/60" />
          </div>
        </div>
      );
    case "splitPanel":
      return (
        <div className={`${base} grid grid-cols-2`}>
          <div className="bg-slate-500" />
          <div className="bg-violet-600 p-1">
            <div className="h-1.5 w-6 rounded bg-white/90" />
          </div>
        </div>
      );
    case "badge":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute bottom-1 start-1 h-2.5 w-10 rounded-full bg-violet-600" />
        </div>
      );
    case "glassCard":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute bottom-1 start-1 h-5 w-12 rounded-md border border-white/40 bg-white/30" />
        </div>
      );
    case "minimalStrip":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute inset-x-0 bottom-0 h-3 bg-white/85" />
        </div>
      );
    case "dualLine":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute inset-y-1 end-1 w-[40%] space-y-0.5">
            <div className="h-2 w-8 rounded bg-white" />
            <div className="h-1 w-10 rounded bg-amber-400" />
          </div>
        </div>
      );
    case "darkWash":
      return (
        <div className={base}>
          <div className="absolute inset-0 bg-slate-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-1 start-1 h-1.5 w-10 rounded bg-white/90" />
        </div>
      );
    default:
      return <div className={base} />;
  }
}

function PresetGrid<T extends string>({
  presets,
  value,
  onSelect,
  renderThumb,
  labelOf,
}: {
  presets: { id: T; label: string; labelAr: string; hint: string }[];
  value: T;
  onSelect: (id: T) => void;
  renderThumb: (id: T, active: boolean) => React.ReactNode;
  labelOf: (p: { label: string; labelAr: string }) => string;
}) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      {presets.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`rounded-lg border p-1.5 text-left transition ${
              active
                ? "border-violet-500 bg-violet-600/15"
                : "border-slate-700 hover:border-slate-500"
            }`}
            title={p.hint}
          >
            {renderThumb(p.id, active)}
            <div className="mt-1.5 truncate text-[11px] font-medium text-slate-200">
              {labelOf(p)}
            </div>
            <div className="truncate text-[9px] text-slate-500">{p.hint}</div>
          </button>
        );
      })}
    </div>
  );
}

export function CardStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    CARD_STYLE_PRESETS.some((p) => p.id === value) ? value : "split"
  ) as CardStyleId;

  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {t("cardShapes")}
      </p>
      <PresetGrid
        presets={CARD_STYLE_PRESETS}
        value={current}
        onSelect={(id) =>
          onChange({
            cardStyle: id,
            ...CARD_STYLE_DEFAULTS[id],
          })
        }
        renderThumb={(id, active) => <CardThumb id={id} active={active} />}
        labelOf={labelOf}
      />
      <p className="mb-2 text-[10px] text-slate-500">{t("cardShapesHint")}</p>
    </div>
  );
}

export function CategoryStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    CATEGORY_LAYOUT_PRESETS.some((p) => p.id === value) ? value : "circles"
  ) as CategoryLayoutId;
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-violet-400">
        {t("categoryShapes", { count: CATEGORY_LAYOUT_PRESETS.length })}
      </p>
      <p className="mb-2 text-[10px] text-slate-500">
        {t("categoryShapesHint")}
      </p>
      <PresetGrid
        presets={CATEGORY_LAYOUT_PRESETS}
        value={current}
        onSelect={(id) =>
          onChange({
            layout: id,
            ...CATEGORY_LAYOUT_DEFAULTS[id],
          })
        }
        renderThumb={(id, active) => <CategoryThumb id={id} active={active} />}
        labelOf={labelOf}
      />
    </div>
  );
}

export function AdStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    AD_STYLE_PRESETS.some((p) => p.id === value) ? value : "promo"
  ) as AdStyleId;
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-violet-400">
        {t("adShapes", { count: AD_STYLE_PRESETS.length })}
      </p>
      <p className="mb-2 text-[10px] text-slate-500">{t("adShapesHint")}</p>
      <PresetGrid
        presets={AD_STYLE_PRESETS}
        value={current}
        onSelect={(id) =>
          onChange({
            adStyle: id,
            ...AD_STYLE_DEFAULTS[id],
          })
        }
        renderThumb={(id, active) => <AdThumb id={id} active={active} />}
        labelOf={labelOf}
      />
    </div>
  );
}

export function NavbarStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: NavbarStyleId) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    NAVBAR_STYLE_PRESETS.some((p) => p.id === value) ? value : "transparent"
  ) as NavbarStyleId;
  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {t("navbarStyle")}
      </p>
      <div className="mb-2 grid grid-cols-2 gap-1.5">
        {NAVBAR_STYLE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-md border px-2 py-2 text-left text-[11px] ${
              current === p.id
                ? "border-violet-500 bg-violet-600/20 text-white"
                : "border-slate-700 text-slate-300"
            }`}
          >
            <div className="font-medium">{labelOf(p)}</div>
            <div className="text-[9px] text-slate-500">{p.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function HeroStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: HeroStyleId) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    HERO_STYLE_PRESETS.some((p) => p.id === value) ? value : "centered"
  ) as HeroStyleId;
  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {t("heroStyle")}
      </p>
      <div className="mb-2 flex flex-col gap-1.5">
        {HERO_STYLE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-md border px-2 py-2 text-left text-[11px] ${
              current === p.id
                ? "border-violet-500 bg-violet-600/20 text-white"
                : "border-slate-700 text-slate-300"
            }`}
          >
            <div className="font-medium">{labelOf(p)}</div>
            <div className="text-[9px] text-slate-500">{p.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FooterStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: FooterStyleId) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    FOOTER_STYLE_PRESETS.some((p) => p.id === value) ? value : "simple"
  ) as FooterStyleId;
  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {t("footerStyle")}
      </p>
      <div className="mb-2 flex flex-col gap-1.5">
        {FOOTER_STYLE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-md border px-2 py-2 text-left text-[11px] ${
              current === p.id
                ? "border-violet-500 bg-violet-600/20 text-white"
                : "border-slate-700 text-slate-300"
            }`}
          >
            <div className="font-medium">{labelOf(p)}</div>
            <div className="text-[9px] text-slate-500">{p.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HeaderThumb({ id, active }: { id: HeaderStyleId; active: boolean }) {
  const ring = active ? "ring-2 ring-violet-500" : "ring-1 ring-slate-600";
  const base = `relative h-16 w-full overflow-hidden rounded-md ${ring}`;
  switch (id) {
    case "floatingLogo":
      return (
        <div
          className={`${base} bg-gradient-to-br from-violet-500 to-fuchsia-600`}
        >
          <div className="absolute bottom-0 inset-x-0 h-7 rounded-t-2xl bg-white" />
          <div className="absolute left-1/2 top-5 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-white bg-slate-200" />
        </div>
      );
    case "coffeeDark":
      return (
        <div
          className={`${base} bg-[#17120F] flex flex-col items-center justify-center gap-1`}
        >
          <div className="h-2 w-10 rounded bg-amber-400" />
          <div className="h-px w-8 bg-white/30" />
        </div>
      );
    case "exploreRail":
      return (
        <div className={`${base} bg-white flex flex-col`}>
          <div className="flex justify-between px-1.5 py-1">
            <div className="h-3 w-6 rounded bg-slate-200" />
            <div className="h-3 w-3 rounded-full bg-orange-400" />
          </div>
          <div className="mx-auto h-2 w-12 rounded-full border border-teal-500" />
          <div className="mt-auto mx-1 mb-1 flex gap-1 overflow-hidden rounded-full bg-slate-100 px-1 py-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2 w-2 shrink-0 rounded-full bg-teal-500/70"
              />
            ))}
          </div>
        </div>
      );
    case "neonGlow":
      return (
        <div className={`${base} bg-black flex items-center justify-center`}>
          <div className="h-5 w-5 rounded-full bg-violet-500 shadow-[0_0_12px_#a855f7]" />
        </div>
      );
    case "dualTone":
      return (
        <div className={`${base} grid grid-cols-2`}>
          <div className="bg-violet-600" />
          <div className="bg-fuchsia-500" />
        </div>
      );
    case "poster":
      return (
        <div
          className={`${base} bg-gradient-to-b from-violet-700 to-fuchsia-600 p-1.5`}
        >
          <div className="h-1 w-6 bg-white/40" />
          <div className="mt-1 h-3 w-10 bg-white/90" />
        </div>
      );
    case "elegantLine":
      return (
        <div
          className={`${base} bg-[#1a1512] flex flex-col items-center justify-center gap-1`}
        >
          <div className="h-3 w-3 rounded-full bg-slate-400" />
          <div className="h-px w-6 bg-amber-500" />
        </div>
      );
    default:
      return (
        <div
          className={`${base} bg-gradient-to-br from-violet-500 to-indigo-600 flex items-end`}
        >
          <div className="w-full h-5 rounded-t-xl bg-white/95" />
        </div>
      );
  }
}

export function HeaderStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const labelOf = usePresetLabel();
  const current = (
    HEADER_STYLE_PRESETS.some((p) => p.id === value) ? value : "floatingLogo"
  ) as HeaderStyleId;

  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-violet-400">
        {t("headerPacks", { count: HEADER_STYLE_PRESETS.length })}
      </p>
      <p className="mb-2 text-[10px] text-slate-500">{t("headerPacksHint")}</p>
      <PresetGrid
        presets={HEADER_STYLE_PRESETS}
        value={current}
        onSelect={(id) =>
          onChange({
            headerStyle: id,
            ...HEADER_STYLE_DEFAULTS[id],
          })
        }
        renderThumb={(id, active) => <HeaderThumb id={id} active={active} />}
        labelOf={labelOf}
      />
    </div>
  );
}
