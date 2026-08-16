"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  Breakpoint,
  BuilderNode,
  TemplateDocument,
} from "@/lib/template-builder/schema";
import {
  mergeBreakpointStyles,
  stylesToCss,
} from "@/lib/template-builder/schema";
import { MOCK_MENU } from "@/lib/template-builder/defaults/mockMenu";
import { HeaderBlock } from "./HeaderBlock";
import { CategoriesBlock } from "./CategoriesBlock";
import { AdsBlock } from "./AdsBlock";
import type { HeaderStyleId } from "@/lib/template-builder/library/stylePresets";
import type { CategoryLayoutId } from "@/lib/template-builder/library/stylePresets";
import type { AdStyleId } from "@/lib/template-builder/library/stylePresets";
import {
  sanitizeBuilderHtml,
  sanitizeBuilderImageSrc,
} from "@/lib/template-builder/sanitizeContent";

export type RenderCtx = {
  doc: TemplateDocument;
  breakpoint: Breakpoint;
  selectedId: string | null;
  onSelect: (id: string) => void;
  interactive?: boolean;
  locale?: "en" | "ar";
};

function Shell({
  node,
  style,
  ctx,
  children,
  as: Tag = "div",
}: {
  node: BuilderNode;
  style: CSSProperties;
  ctx: RenderCtx;
  children?: ReactNode;
  as?:
    | "div"
    | "nav"
    | "header"
    | "footer"
    | "section"
    | "aside"
    | "article"
    | "p"
    | "a";
}) {
  const selected = ctx.interactive && ctx.selectedId === node.id;
  return (
    <Tag
      data-node-id={node.id}
      style={{
        ...style,
        outline: selected ? "2px solid #9234ea" : undefined,
        outlineOffset: selected ? 2 : undefined,
        cursor: ctx.interactive ? "pointer" : undefined,
        position: style.position ?? (selected ? "relative" : style.position),
      }}
      onClick={
        ctx.interactive
          ? (e) => {
              e.stopPropagation();
              ctx.onSelect(node.id);
            }
          : undefined
      }
    >
      {selected && ctx.interactive && (
        <span
          style={{
            position: "absolute",
            top: -18,
            left: 0,
            fontSize: 10,
            background: "#9234ea",
            color: "#fff",
            padding: "1px 6px",
            borderRadius: 4,
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {node.name || node.type}
        </span>
      )}
      {children}
    </Tag>
  );
}

function t(locale: "en" | "ar", en: unknown, ar?: unknown) {
  return String((locale === "ar" ? ar : en) ?? en ?? "");
}

function ItemCards({
  node,
  colors,
  locale,
}: {
  node: BuilderNode;
  colors: Record<string, string>;
  locale: "en" | "ar";
}) {
  const p = node.props;
  const style = String(p.cardStyle ?? "split");
  const r = Number(p.borderRadius) || 28;
  const ratio = Number(p.imageRatio) || 0.85;

  return (
    <>
      {MOCK_MENU.items.map((item) => {
        const name = locale === "ar" ? item.nameAr : item.name;
        const desc = locale === "ar" ? item.descriptionAr : item.description;
        const img: CSSProperties = {
          backgroundColor: colors.border,
          backgroundImage: item.image ? `url(${item.image})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };

        if (style === "list") {
          return (
            <article
              key={item.id}
              style={{
                display: "flex",
                gap: 12,
                borderRadius: r,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: 80, height: 80, ...img }} />
              <div style={{ flex: 1, padding: "8px 10px" }}>
                <strong style={{ fontSize: 13 }}>{name}</strong>
                {p.showPrice !== false && (
                  <div
                    style={{
                      color: colors.primary,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {item.price}
                  </div>
                )}
                {p.showDescription !== false && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {desc}
                  </p>
                )}
              </div>
            </article>
          );
        }

        if (style === "compact" || style === "cover") {
          return (
            <article
              key={item.id}
              style={{
                borderRadius: r,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,.08)",
              }}
            >
              <div
                style={{
                  aspectRatio: style === "cover" ? "3/4" : "4/3",
                  ...img,
                }}
              />
              <div style={{ padding: style === "cover" ? 12 : 8 }}>
                <strong style={{ fontSize: style === "cover" ? 14 : 12 }}>
                  {name}
                </strong>
                {p.showDescription !== false && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {desc}
                  </p>
                )}
                {p.showPrice !== false && (
                  <div
                    style={{
                      color: colors.primary,
                      fontWeight: 700,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {item.price}
                  </div>
                )}
              </div>
            </article>
          );
        }

        if (style === "overlay") {
          return (
            <article
              key={item.id}
              style={{
                position: "relative",
                borderRadius: r,
                overflow: "hidden",
                minHeight: 180,
                ...img,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(to top, rgba(0,0,0,.75), transparent 55%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  insetInline: 12,
                  bottom: 12,
                  color: "#fff",
                }}
              >
                {p.showBadge !== false && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: colors.primary,
                      marginBottom: 6,
                    }}
                  >
                    Available
                  </span>
                )}
                <strong style={{ display: "block", fontSize: 14 }}>
                  {name}
                </strong>
                {p.showPrice !== false && (
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {item.price} EGP
                  </span>
                )}
              </div>
            </article>
          );
        }

        if (style === "bordered") {
          return (
            <article
              key={item.id}
              style={{
                borderRadius: r,
                border: `1px solid ${colors.border || "#e2e8f0"}`,
                background: colors.surface || "#fff",
                overflow: "hidden",
              }}
            >
              <div style={{ aspectRatio: "16/10", ...img }} />
              <div style={{ padding: 12 }}>
                <strong style={{ fontSize: 13, color: colors.text }}>
                  {name}
                </strong>
                {p.showDescription !== false && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {desc}
                  </p>
                )}
                {p.showPrice !== false && (
                  <div
                    style={{
                      color: colors.primary,
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    {item.price}
                  </div>
                )}
              </div>
            </article>
          );
        }

        if (style === "glass") {
          const imgPct = Math.round(ratio * 100);
          return (
            <article
              key={item.id}
              style={{
                position: "relative",
                minHeight: 150,
                borderRadius: r,
                overflow: "hidden",
                background: `linear-gradient(135deg, ${colors.primary}33, ${colors.secondary}22)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  insetBlock: 8,
                  insetInlineStart: 8,
                  width: `${imgPct - 10}%`,
                  borderRadius: r * 0.8,
                  ...img,
                }}
              />
              <div
                style={{
                  position: "relative",
                  marginInlineStart: "auto",
                  width: `${Math.max(42, 100 - imgPct + 12)}%`,
                  minHeight: 150,
                  margin: 8,
                  padding: 12,
                  borderRadius: r * 0.7,
                  border: "1px solid rgba(255,255,255,.35)",
                  background: "rgba(255,255,255,.55)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <strong style={{ fontSize: 13 }}>{name}</strong>
                {p.showPrice !== false && (
                  <span style={{ color: colors.primary, fontWeight: 700 }}>
                    {item.price}
                  </span>
                )}
              </div>
            </article>
          );
        }

        // split (default)
        const imgPct = Math.round(ratio * 100);
        return (
          <article
            key={item.id}
            style={{
              position: "relative",
              minHeight: 150,
              borderRadius: r,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                insetBlock: 0,
                insetInlineStart: 0,
                width: `${imgPct}%`,
                borderRadius: r * 0.9,
                ...img,
              }}
            />
            <div
              style={{
                position: "relative",
                marginInlineStart: "auto",
                width: `${Math.max(40, 100 - imgPct + 15)}%`,
                minHeight: 150,
                padding: 12,
                background: "rgba(255,255,255,.95)",
                borderRadius: r * 0.7,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {p.showBadge !== false && (
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  }}
                >
                  Available
                </span>
              )}
              <strong style={{ fontSize: 13 }}>{name}</strong>
              {p.showDescription !== false && (
                <p style={{ margin: 0, fontSize: 11, color: colors.muted }}>
                  {desc}
                </p>
              )}
              {p.showPrice !== false && (
                <span
                  style={{
                    color: colors.primary,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {item.price} EGP
                </span>
              )}
            </div>
          </article>
        );
      })}
    </>
  );
}

export function BuilderNodeView({
  node,
  ctx,
}: {
  node: BuilderNode;
  ctx: RenderCtx;
}) {
  const locale = ctx.locale ?? "en";
  const colors = ctx.doc.globalStyles.colors;
  const style = stylesToCss(
    mergeBreakpointStyles(node, ctx.breakpoint),
    colors,
  );
  const p = node.props;
  const kids = () =>
    (node.children ?? []).map((c) => (
      <BuilderNodeView key={c.id} node={c} ctx={ctx} />
    ));

  switch (node.type) {
    case "heading":
      return (
        <Shell node={node} style={style} ctx={ctx}>
          <strong style={{ fontSize: "inherit" }}>
            {t(locale, p.text, p.textAr)}
          </strong>
        </Shell>
      );
    case "text":
      return (
        <Shell node={node} style={style} ctx={ctx} as="p">
          {t(locale, p.text, p.textAr)}
        </Shell>
      );
    case "button":
      return (
        <Shell node={node} style={style} ctx={ctx} as="a">
          {t(locale, p.label, p.labelAr)}
        </Shell>
      );
    case "image":
      return (
        <Shell node={node} style={style} ctx={ctx}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sanitizeBuilderImageSrc(p.src) || "/ENSd.png"}
            alt={t(locale, p.alt, p.altAr)}
            style={{ width: "100%", display: "block", borderRadius: "inherit" }}
          />
        </Shell>
      );
    case "spacer":
      return <Shell node={node} style={style} ctx={ctx} />;
    case "html":
      return (
        <Shell node={node} style={style} ctx={ctx}>
          <div dangerouslySetInnerHTML={{ __html: sanitizeBuilderHtml(p.html) }} />
        </Shell>
      );
    case "cta":
      return (
        <Shell node={node} style={style} ctx={ctx} as="section">
          <h2 style={{ margin: 0 }}>{t(locale, p.title, p.titleAr)}</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {t(locale, p.subtitle, p.subtitleAr)}
          </p>
          {kids()}
        </Shell>
      );
    case "menu.header": {
      const headerStyle = (String(p.headerStyle ?? "floatingLogo") ||
        "floatingLogo") as HeaderStyleId;
      const selected = ctx.interactive && ctx.selectedId === node.id;
      return (
        <HeaderBlock
          headerStyle={headerStyle}
          props={p}
          colors={colors}
          data={{
            name: MOCK_MENU.name,
            nameAr: MOCK_MENU.nameAr,
            description:
              locale === "ar"
                ? "معاينة كاملة للهيدر — تحكم كامل"
                : "Live Default preview — full control",
            logo: MOCK_MENU.logo,
            colors,
            locale,
            categories: MOCK_MENU.categories,
          }}
          style={style}
          selected={selected}
          label={node.name || "Header"}
          onClick={
            ctx.interactive
              ? (e) => {
                  e.stopPropagation();
                  ctx.onSelect(node.id);
                }
              : undefined
          }
        />
      );
    }
    case "menu.navbar": {
      const navStyle = String(p.navStyle ?? "transparent");
      const navExtra: CSSProperties =
        navStyle === "solid"
          ? { backgroundColor: colors.primary, color: "#fff" }
          : navStyle === "blur"
            ? {
                backgroundColor: "rgba(255,255,255,.15)",
                backdropFilter: "blur(10px)",
                color: "#fff",
              }
            : navStyle === "minimal"
              ? { padding: "8px 16px", opacity: 0.95 }
              : {};
      return (
        <Shell node={node} style={{ ...style, ...navExtra }} ctx={ctx} as="nav">
          {p.showLang !== false && (
            <span style={{ fontSize: 12, opacity: 0.9 }}>EN | AR</span>
          )}
          {p.showSocial !== false && (
            <span style={{ fontSize: 12, opacity: 0.9 }}>Social</span>
          )}
        </Shell>
      );
    }
    case "menu.logo": {
      const size = Number(p.size) || 110;
      return (
        <Shell
          node={node}
          style={{ ...style, width: size, height: size }}
          ctx={ctx}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MOCK_MENU.logo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Shell>
      );
    }
    case "menu.hero": {
      const heroStyle = String(p.heroStyle ?? "centered");
      const heroExtra: CSSProperties =
        heroStyle === "left"
          ? { textAlign: "start" }
          : heroStyle === "banner"
            ? {
                textAlign: "center",
                backgroundColor: colors.primary,
                color: "#fff",
                padding: "20px 16px",
                borderRadius: 12,
                margin: "0 16px",
              }
            : { textAlign: "center" };
      return (
        <Shell
          node={node}
          style={{ ...style, ...heroExtra }}
          ctx={ctx}
          as="header"
        >
          <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>
            {locale === "ar" ? MOCK_MENU.nameAr : MOCK_MENU.name}
          </h1>
          {p.showDescription !== false && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color:
                  heroStyle === "banner"
                    ? "rgba(255,255,255,.85)"
                    : colors.muted,
              }}
            >
              Live Default preview — full control
            </p>
          )}
        </Shell>
      );
    }
    case "menu.categories": {
      return (
        <Shell
          node={node}
          style={{ ...style, display: "block", padding: style.padding ?? 16 }}
          ctx={ctx}
        >
          <CategoriesBlock
            layout={String(p.layout ?? "circles") as CategoryLayoutId}
            categories={MOCK_MENU.categories}
            colors={colors}
            locale={locale}
            showAll={p.showAll !== false}
          />
        </Shell>
      );
    }
    case "menu.items": {
      const cols = Number(p.columns) || 2;
      const grid: CSSProperties = {
        ...style,
        display: "grid",
        gridTemplateColumns:
          ctx.breakpoint === "mobile"
            ? "1fr"
            : p.cardStyle === "list"
              ? "1fr"
              : `repeat(${cols}, 1fr)`,
      };
      return (
        <Shell node={node} style={grid} ctx={ctx}>
          <ItemCards node={node} colors={colors} locale={locale} />
        </Shell>
      );
    }
    case "menu.hours":
      return (
        <Shell node={node} style={style} ctx={ctx}>
          <strong
            style={{ color: colors.primary, display: "block", marginBottom: 6 }}
          >
            Working Hours
          </strong>
          {MOCK_MENU.hours.map((h) => (
            <div key={h.day} style={{ fontSize: 12, color: colors.muted }}>
              {h.day}: {h.open} – {h.close}
            </div>
          ))}
        </Shell>
      );
    case "menu.social":
      return (
        <Shell node={node} style={style} ctx={ctx}>
          {Object.keys(MOCK_MENU.social).map((k) => (
            <span
              key={k}
              style={{
                color: colors.primary,
                fontSize: 12,
                textTransform: "capitalize",
              }}
            >
              {k}
            </span>
          ))}
        </Shell>
      );
    case "menu.footer": {
      const footerStyle = String(p.footerStyle ?? "simple");
      const footerExtra: CSSProperties =
        footerStyle === "bar"
          ? {
              backgroundColor: colors.text,
              color: "#fff",
              padding: "16px",
            }
          : footerStyle === "stacked"
            ? {
                padding: "32px 16px",
                gap: 8,
                display: "flex",
                flexDirection: "column",
              }
            : {};
      return (
        <Shell
          node={node}
          style={{ ...style, ...footerExtra }}
          ctx={ctx}
          as="footer"
        >
          <div style={{ color: footerStyle === "bar" ? "#fff" : colors.text }}>
            {MOCK_MENU.name}
          </div>
          <div style={{ opacity: footerStyle === "bar" ? 0.85 : 1 }}>
            {MOCK_MENU.phone}
          </div>
          {p.showPoweredBy !== false && (
            <div style={{ marginTop: 6, opacity: 0.7, fontSize: 11 }}>
              Powered by ENS Menu
            </div>
          )}
        </Shell>
      );
    }
    case "menu.ads":
      return (
        <Shell node={node} style={style} ctx={ctx} as="aside">
          <AdsBlock
            adStyle={String(p.adStyle ?? "gradient") as AdStyleId}
            props={p}
            colors={colors}
            label={locale === "ar" ? "إعلان" : "Ad banner"}
          />
        </Shell>
      );
    default:
      return (
        <Shell node={node} style={style} ctx={ctx}>
          {kids()}
          {ctx.interactive && !node.children?.length && (
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 8,
                padding: 20,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 12,
              }}
            >
              Drop components here
            </div>
          )}
        </Shell>
      );
  }
}
