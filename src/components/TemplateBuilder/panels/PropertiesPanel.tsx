"use client";

import { useTranslations } from "next-intl";
import { findNode } from "@/lib/template-builder/schema";
import type { Breakpoint, StyleProps } from "@/lib/template-builder/schema";
import { getComponentDef } from "@/lib/template-builder/library/registry";
import { useBuilderStore } from "../store/useBuilderStore";
import { useComponentLabel } from "../i18n";
import {
  CardStylePicker,
  CategoryStylePicker,
  AdStylePicker,
  NavbarStylePicker,
  HeroStylePicker,
  FooterStylePicker,
  HeaderStylePicker,
} from "./StylePickers";
import type {
  FooterStyleId,
  HeroStyleId,
  NavbarStyleId,
} from "@/lib/template-builder/library/stylePresets";

const input =
  "w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-violet-500";

const codeArea =
  "w-full min-h-[120px] resize-y rounded border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-[12px] leading-relaxed text-slate-200 outline-none focus:border-violet-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 block">
      <div className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function ContentFields({
  type,
  props,
  onChange,
}: {
  type: string;
  props: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const set = (k: string, v: unknown) => onChange({ [k]: v });
  const pair = (en: string, ar: string, labelEn: string, labelAr: string) => (
    <>
      <Field label={labelEn}>
        <input
          className={input}
          dir="ltr"
          value={String(props[en] ?? "")}
          onChange={(e) => set(en, e.target.value)}
        />
      </Field>
      <Field label={labelAr}>
        <input
          className={input}
          dir="rtl"
          lang="ar"
          value={String(props[ar] ?? "")}
          onChange={(e) => set(ar, e.target.value)}
        />
      </Field>
    </>
  );

  switch (type) {
    case "heading":
      return (
        <>
          <p className="mb-3 rounded-md border border-violet-500/30 bg-violet-500/10 p-2 text-[11px] leading-relaxed text-violet-200">
            {t("contentHint")}
          </p>
          {pair("text", "textAr", t("textEn"), t("textAr"))}
          <Field label={t("level")}>
            <select className={input} value={Number(props.level) || 2} onChange={(e) => set("level", Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>H{n}</option>
              ))}
            </select>
          </Field>
        </>
      );
    case "text":
      return (
        <>
          <p className="mb-3 rounded-md border border-violet-500/30 bg-violet-500/10 p-2 text-[11px] leading-relaxed text-violet-200">
            {t("contentHint")}
          </p>
          {pair("text", "textAr", t("textEn"), t("textAr"))}
        </>
      );
    case "button":
      return (
        <>
          {pair("label", "labelAr", t("labelEn"), t("labelAr"))}
          <Field label={t("href")}>
            <input className={input} value={String(props.href ?? "")} onChange={(e) => set("href", e.target.value)} />
          </Field>
        </>
      );
    case "image":
      return (
        <>
          <Field label={t("src")}>
            <input className={input} value={String(props.src ?? "")} onChange={(e) => set("src", e.target.value)} />
          </Field>
          {pair("alt", "altAr", t("altEn"), t("altAr"))}
        </>
      );
    case "html":
      return (
        <Field label={t("html")}>
          <textarea className={`${input} min-h-[100px] font-mono`} value={String(props.html ?? "")} onChange={(e) => set("html", e.target.value)} />
        </Field>
      );
    case "cta":
      return (
        <>
          {pair("title", "titleAr", t("titleEn"), t("titleAr"))}
          {pair("subtitle", "subtitleAr", t("subtitleEn"), t("subtitleAr"))}
        </>
      );
    case "menu.items":
      return (
        <>
          <CardStylePicker value={String(props.cardStyle ?? "split")} onChange={onChange} />
          <Field label={t("columns")}>
            <input type="number" min={1} max={3} className={input} value={Number(props.columns) || 2} onChange={(e) => set("columns", Number(e.target.value))} />
          </Field>
          <Field label={`${t("radius")} (${Number(props.borderRadius) || 28}px)`}>
            <input type="range" min={8} max={40} value={Number(props.borderRadius) || 28} onChange={(e) => set("borderRadius", Number(e.target.value))} className="w-full" />
          </Field>
          {(String(props.cardStyle ?? "split") === "split" || String(props.cardStyle) === "glass") && (
            <Field label={`${t("imageRatio")} (${Math.round(Number(props.imageRatio || 0.85) * 100)}%)`}>
              <input type="range" min={45} max={90} value={Math.round(Number(props.imageRatio || 0.85) * 100)} onChange={(e) => set("imageRatio", Number(e.target.value) / 100)} className="w-full" />
            </Field>
          )}
          <Field label={t("showBadge")}>
            <input type="checkbox" checked={props.showBadge !== false} onChange={(e) => set("showBadge", e.target.checked)} />
          </Field>
          <Field label={t("showDescription")}>
            <input type="checkbox" checked={props.showDescription !== false} onChange={(e) => set("showDescription", e.target.checked)} />
          </Field>
          <Field label={t("showPrice")}>
            <input type="checkbox" checked={props.showPrice !== false} onChange={(e) => set("showPrice", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.header":
      return (
        <>
          <HeaderStylePicker value={String(props.headerStyle ?? "floatingLogo")} onChange={onChange} />
          <Field label={`${t("logoSize")} (${Number(props.logoSize) || 110}px)`}>
            <input type="range" min={28} max={160} value={Number(props.logoSize) || 110} onChange={(e) => set("logoSize", Number(e.target.value))} className="w-full" />
          </Field>
          <Field label={`${t("sheetRadius")} (${Number(props.sheetRadius) || 80}px)`}>
            <input type="range" min={0} max={120} value={Number(props.sheetRadius) || 80} onChange={(e) => set("sheetRadius", Number(e.target.value))} className="w-full" />
          </Field>
          <Field label={t("showLanguage")}>
            <input type="checkbox" checked={props.showLang !== false} onChange={(e) => set("showLang", e.target.checked)} />
          </Field>
          <Field label={t("showSocial")}>
            <input type="checkbox" checked={props.showSocial !== false} onChange={(e) => set("showSocial", e.target.checked)} />
          </Field>
          <Field label={t("showDescription")}>
            <input type="checkbox" checked={props.showDescription !== false} onChange={(e) => set("showDescription", e.target.checked)} />
          </Field>
          <Field label={t("showCategoriesInHeader")}>
            <input type="checkbox" checked={props.showCategories === true} onChange={(e) => set("showCategories", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.categories":
      return (
        <>
          <CategoryStylePicker value={String(props.layout ?? "circles")} onChange={onChange} />
          <Field label={t("showAll")}>
            <input type="checkbox" checked={props.showAll !== false} onChange={(e) => set("showAll", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.ads":
      return (
        <>
          <AdStylePicker value={String(props.adStyle ?? "promo")} onChange={onChange} />
          <Field label={t("titleEn")}>
            <input
              className={input}
              dir="auto"
              value={String(props.title ?? "ENS")}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label={t("subtitleEn")}>
            <input
              className={input}
              dir="auto"
              value={String(props.subtitle ?? props.label ?? "")}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </Field>
          <Field label={t("src")}>
            <input
              className={input}
              value={String(props.image ?? "/images/ads/ens-promo-banner.png")}
              onChange={(e) => set("image", e.target.value)}
            />
          </Field>
          <Field label={`${t("radius")} (${Number(props.borderRadius) || 16}px)`}>
            <input
              type="range"
              min={0}
              max={40}
              value={Number(props.borderRadius) || 16}
              onChange={(e) => set("borderRadius", Number(e.target.value))}
              className="w-full"
            />
          </Field>
        </>
      );
    case "menu.navbar":
      return (
        <>
          <NavbarStylePicker value={String(props.navStyle ?? "transparent")} onChange={(navStyle: NavbarStyleId) => set("navStyle", navStyle)} />
          <Field label={t("showLanguage")}>
            <input type="checkbox" checked={props.showLang !== false} onChange={(e) => set("showLang", e.target.checked)} />
          </Field>
          <Field label={t("showSocial")}>
            <input type="checkbox" checked={props.showSocial !== false} onChange={(e) => set("showSocial", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.hero":
      return (
        <>
          <HeroStylePicker value={String(props.heroStyle ?? "centered")} onChange={(heroStyle: HeroStyleId) => set("heroStyle", heroStyle)} />
          <Field label={t("showDescription")}>
            <input type="checkbox" checked={props.showDescription !== false} onChange={(e) => set("showDescription", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.footer":
      return (
        <>
          <FooterStylePicker value={String(props.footerStyle ?? "simple")} onChange={(footerStyle: FooterStyleId) => set("footerStyle", footerStyle)} />
          <Field label={t("showPoweredBy")}>
            <input type="checkbox" checked={props.showPoweredBy !== false} onChange={(e) => set("showPoweredBy", e.target.checked)} />
          </Field>
        </>
      );
    case "menu.logo":
      return (
        <Field label={`${t("size")} (${Number(props.size) || 110}px)`}>
          <input type="range" min={64} max={160} value={Number(props.size) || 110} onChange={(e) => set("size", Number(e.target.value))} className="w-full" />
        </Field>
      );
    default:
      return <p className="text-xs text-slate-500">{t("fullControlHintBlock")}</p>;
  }
}

function StyleFields({
  styles,
  onChange,
}: {
  styles: StyleProps;
  onChange: (s: Record<string, unknown>) => void;
}) {
  const t = useTranslations("templateBuilder");
  const set = (k: string, v: unknown) => onChange({ [k]: v });
  return (
    <div>
      <p className="mb-2 text-[10px] text-slate-500">{t("tokensHint")}</p>
      {(
        [
          ["backgroundColor", t("background")],
          ["color", t("color")],
          ["padding", t("padding")],
          ["margin", t("margin")],
          ["borderRadius", t("borderRadius")],
          ["fontSize", t("fontSize")],
          ["fontWeight", t("fontWeight")],
          ["gap", t("gap")],
          ["width", t("width")],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label}>
          <input
            className={input}
            value={String(styles[key] ?? "")}
            onChange={(e) =>
              set(
                key,
                e.target.value === ""
                  ? undefined
                  : Number.isFinite(Number(e.target.value)) &&
                      !e.target.value.includes(" ") &&
                      !e.target.value.includes("{")
                    ? Number(e.target.value) || e.target.value
                    : e.target.value,
              )
            }
          />
        </Field>
      ))}
      <Field label={t("display")}>
        <select className={input} value={String(styles.display ?? "")} onChange={(e) => set("display", e.target.value || undefined)}>
          <option value="">—</option>
          <option value="flex">flex</option>
          <option value="grid">grid</option>
          <option value="block">block</option>
          <option value="none">none</option>
        </select>
      </Field>
      <Field label={t("flexDirection")}>
        <select className={input} value={String(styles.flexDirection ?? "")} onChange={(e) => set("flexDirection", e.target.value || undefined)}>
          <option value="">—</option>
          <option value="row">row</option>
          <option value="column">column</option>
        </select>
      </Field>
      <Field label={t("justify")}>
        <select className={input} value={String(styles.justifyContent ?? "")} onChange={(e) => set("justifyContent", e.target.value || undefined)}>
          <option value="">—</option>
          <option value="flex-start">start</option>
          <option value="center">center</option>
          <option value="space-between">space-between</option>
          <option value="flex-end">end</option>
        </select>
      </Field>
      <Field label={t("align")}>
        <select className={input} value={String(styles.alignItems ?? "")} onChange={(e) => set("alignItems", e.target.value || undefined)}>
          <option value="">—</option>
          <option value="stretch">stretch</option>
          <option value="center">center</option>
          <option value="flex-start">start</option>
          <option value="flex-end">end</option>
        </select>
      </Field>
    </div>
  );
}

export function PropertiesPanel() {
  const t = useTranslations("templateBuilder");
  const labelOf = useComponentLabel();
  const document = useBuilderStore((s) => s.document);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const rightTab = useBuilderStore((s) => s.rightTab);
  const setRightTab = useBuilderStore((s) => s.setRightTab);
  const breakpoint = useBuilderStore((s) => s.breakpoint);
  const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);
  const updateSelectedProps = useBuilderStore((s) => s.updateSelectedProps);
  const updateSelectedStyles = useBuilderStore((s) => s.updateSelectedStyles);
  const updateSelectedCustomCode = useBuilderStore((s) => s.updateSelectedCustomCode);
  const updateSelectedName = useBuilderStore((s) => s.updateSelectedName);
  const updateMeta = useBuilderStore((s) => s.updateMeta);

  if (!document || !selectedId) {
    return <div className="p-3 text-xs text-slate-500">{t("selectElement")}</div>;
  }
  const node = findNode(document.root, selectedId);
  if (!node) return <div className="p-3 text-xs text-slate-500">{t("notFound")}</div>;

  const tabs = [
    { id: "content" as const, label: t("content") },
    { id: "style" as const, label: t("style") },
    { id: "code" as const, label: t("code") },
    { id: "theme" as const, label: t("theme") },
  ];

  const bpLabel = (bp: Breakpoint) =>
    bp === "desktop" ? t("desktop") : bp === "tablet" ? t("tablet") : t("mobile");

  const activeStyles =
    breakpoint === "desktop"
      ? node.styles.desktop
      : {
          ...node.styles.desktop,
          ...(breakpoint === "tablet"
            ? node.styles.tablet
            : { ...node.styles.tablet, ...node.styles.mobile }),
        };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-700 px-3 py-2">
        <input
          className={input}
          value={node.name ?? ""}
          onChange={(e) => updateSelectedName(e.target.value)}
          placeholder={labelOf(node.type, getComponentDef(node.type)?.label)}
        />
        <p className="mt-1 text-[10px] text-slate-500">{node.type}</p>
      </div>
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setRightTab(tab.id)}
            className={`flex-1 py-1.5 text-[10px] uppercase ${
              rightTab === tab.id
                ? "border-b-2 border-violet-500 text-violet-400"
                : "text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {rightTab === "style" && (
        <div className="flex gap-1 border-b border-slate-700 px-2 py-1.5">
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setBreakpoint(bp)}
              className={`flex-1 rounded py-0.5 text-[10px] ${
                breakpoint === bp ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {bpLabel(bp)}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3">
        {rightTab === "content" && (
          <ContentFields type={node.type} props={node.props} onChange={updateSelectedProps} />
        )}
        {rightTab === "style" && (
          <StyleFields styles={activeStyles} onChange={(s) => updateSelectedStyles(breakpoint, s)} />
        )}
        {rightTab === "code" && (
          <div className="space-y-2">
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] leading-relaxed text-amber-100">
              <p>{t("codeHint")}</p>
              <button
                type="button"
                onClick={() => setRightTab("content")}
                className="mt-2 rounded bg-violet-600 px-2 py-1 text-[10px] font-medium text-white"
              >
                {t("goToContent")}
              </button>
            </div>
            {(["css", "html", "js"] as const).map((lang) => (
              <Field
                key={lang}
                label={lang === "css" ? t("nodeCss") : lang === "html" ? t("nodeHtml") : t("nodeJs")}
              >
                <textarea
                  className={codeArea}
                  spellCheck={false}
                  dir="ltr"
                  value={node.customCode?.[lang] ?? ""}
                  onChange={(e) =>
                    updateSelectedCustomCode({
                      ...node.customCode,
                      [lang]: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder={
                    lang === "css"
                      ? "/* color: red; */"
                      : lang === "html"
                        ? "<!-- HTML -->"
                        : "// console.log('hi')"
                  }
                />
              </Field>
            ))}
          </div>
        )}
        {rightTab === "theme" && (
          <div>
            <Field label={t("name")}>
              <input
                className={input}
                value={document.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
              />
            </Field>
            <p className="mb-2 mt-3 text-[10px] uppercase tracking-wide text-violet-400">
              {t("theme")}
            </p>
            {Object.entries(document.globalStyles.colors).map(([key, value]) => (
              <Field key={key} label={key}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value.startsWith("#") ? value : "#7000B5"}
                    onChange={(e) =>
                      updateMeta({
                        globalStyles: {
                          ...document.globalStyles,
                          colors: { ...document.globalStyles.colors, [key]: e.target.value },
                        },
                      })
                    }
                    className="h-7 w-8 rounded border border-slate-700 bg-transparent"
                  />
                  <input
                    className={input}
                    value={value}
                    onChange={(e) =>
                      updateMeta({
                        globalStyles: {
                          ...document.globalStyles,
                          colors: { ...document.globalStyles.colors, [key]: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </Field>
            ))}
            <Field label={t("css")}>
              <textarea
                className={`${codeArea} min-h-[144px]`}
                spellCheck={false}
                dir="ltr"
                value={document.customCode?.customCSS ?? ""}
                onChange={(e) =>
                  updateMeta({
                    customCode: {
                      ...document.customCode,
                      customCSS: e.target.value,
                    },
                  })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="/* page CSS */"
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
