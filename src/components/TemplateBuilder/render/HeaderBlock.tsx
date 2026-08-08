"use client";

import type { CSSProperties, ReactNode } from "react";
import type { HeaderStyleId } from "@/lib/template-builder/library/stylePresets";
import { MOCK_MENU } from "@/lib/template-builder/defaults/mockMenu";

export type HeaderRenderData = {
  name: string;
  nameAr?: string;
  description?: string;
  logo?: string | null;
  colors: Record<string, string>;
  locale?: "en" | "ar";
  categories?: {
    id: number;
    name: string;
    nameAr?: string;
    image?: string | null;
  }[];
};

type Props = {
  headerStyle: HeaderStyleId;
  props: Record<string, unknown>;
  colors: Record<string, string>;
  data: HeaderRenderData;
  /** Extra wrapper style from node styles */
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  selected?: boolean;
  label?: string;
};

function LogoCircle({
  src,
  size,
  name,
  colors,
  border = true,
}: {
  src?: string | null;
  size: number;
  name: string;
  colors: Record<string, string>;
  border?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: border ? "6px solid #fff" : undefined,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            fontWeight: 800,
            color: colors.primary,
            fontSize: size * 0.28,
          }}
        >
          {name.slice(0, 2)}
        </span>
      )}
    </div>
  );
}

function TopChrome({
  props,
  colors,
  light,
  left,
  right,
}: {
  props: Record<string, unknown>;
  colors: Record<string, string>;
  light?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const color = light ? colors.text : "#fff";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        color,
        fontSize: 12,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {left}
        {props.showSocial !== false && !left && (
          <span style={{ opacity: 0.9 }}>Social</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {right}
        {props.showLang !== false && (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.18)",
              fontWeight: 600,
            }}
          >
            EN | AR
          </span>
        )}
      </div>
    </div>
  );
}

function CategoryRail({
  data,
  colors,
}: {
  data: HeaderRenderData;
  colors: Record<string, string>;
}) {
  const cats = data.categories?.length ? data.categories : MOCK_MENU.categories;
  const isAr = data.locale === "ar";
  return (
    <div
      style={{
        margin: "12px 16px 0",
        padding: "12px 14px",
        borderRadius: 999,
        background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,.08)",
        display: "flex",
        gap: 16,
        overflowX: "auto",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: colors.primary,
          borderBottom: `2px solid ${colors.primary}`,
          whiteSpace: "nowrap",
          paddingBottom: 2,
        }}
      >
        {isAr ? "الكل" : "All"}
      </span>
      {cats.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: 56,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1.5px solid ${colors.primary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: colors.primary,
              overflow: "hidden",
              backgroundColor: colors.border || "#e2e8f0",
              backgroundImage: c.image ? `url(${c.image})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {!c.image && "◉"}
          </div>
          <span
            style={{ fontSize: 9, color: colors.primary, whiteSpace: "nowrap" }}
          >
            {isAr ? c.nameAr || c.name : c.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HeaderBlock({
  headerStyle,
  props,
  colors,
  data,
  style,
  onClick,
  selected,
  label,
}: Props) {
  const isAr = data.locale === "ar";
  const name = isAr ? data.nameAr || data.name : data.name;
  const desc =
    data.description || (isAr ? "معاينة كاملة للهيدر" : "Full header preview");
  const logoSize = Number(props.logoSize) || 110;
  const sheetRadius = Number(props.sheetRadius) || 80;
  const showDesc = props.showDescription !== false;
  const showCats = props.showCategories === true;

  const wrap = (children: ReactNode, bg?: string) => (
    <div
      data-node-type="menu.header"
      onClick={onClick}
      style={{
        position: "relative",
        width: "100%",
        background: bg,
        outline: selected ? "2px solid #9234ea" : undefined,
        outlineOffset: selected ? 2 : undefined,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {selected && label && (
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
            zIndex: 40,
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );

  switch (headerStyle) {
    case "coffeeDark":
      return wrap(
        <>
          <TopChrome
            props={props}
            colors={colors}
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LogoCircle
                  src={data.logo}
                  size={28}
                  name={name}
                  colors={colors}
                  border={false}
                />
                <strong
                  style={{ color: colors.secondary || "#f2b705", fontSize: 14 }}
                >
                  {name}
                </strong>
              </div>
            }
          />
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px 56px",
              color: "#fff",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 800,
                color: colors.secondary || "#f2b705",
              }}
            >
              {name}
            </h1>
            {showDesc && (
              <p
                style={{
                  margin: "10px 0 0",
                  color: "rgba(255,255,255,.65)",
                  fontSize: 14,
                }}
              >
                {desc}
              </p>
            )}
            <div
              style={{
                margin: "18px auto 0",
                width: 120,
                height: 1,
                background: "rgba(255,255,255,.25)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  color: colors.secondary || "#f2b705",
                  fontSize: 12,
                  background: "#17120F",
                  padding: "0 8px",
                }}
              >
                ✦
              </span>
            </div>
          </div>
        </>,
        "#17120F",
      );

    case "exploreRail":
      return wrap(
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              background: colors.surface || "#fff",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(0,0,0,.05)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                }}
              >
                ☾
              </span>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(0,0,0,.05)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                }}
              >
                🌐
              </span>
            </div>
            <strong style={{ fontSize: 14, color: colors.text }}>
              {isAr ? "الرئيسية" : "Home"}
            </strong>
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
              border={false}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "20px 16px 8px",
              background: colors.surface || "#fff",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 999,
                border: `1.5px solid ${colors.primary}`,
                color: colors.primary,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ★ {isAr ? "استكشف قائمتنا" : "Explore our menu"}
            </span>
            {showDesc && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12,
                  color: colors.muted,
                }}
              >
                {desc}
              </p>
            )}
          </div>
          {showCats && <CategoryRail data={data} colors={colors} />}
          <div style={{ height: 12, background: colors.surface || "#fff" }} />
        </>,
        colors.surface || "#fff",
      );

    case "brandBar":
      return wrap(
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: colors.primary,
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LogoCircle
                src={data.logo}
                size={logoSize}
                name={name}
                colors={colors}
                border={false}
              />
              <strong>{name}</strong>
            </div>
            {props.showLang !== false && (
              <span style={{ fontSize: 12 }}>EN | AR</span>
            )}
          </div>
          <div
            style={{
              padding: "20px 16px",
              background: colors.surface || "#fff",
              textAlign: "center",
            }}
          >
            {showDesc && (
              <p style={{ margin: 0, color: colors.muted, fontSize: 13 }}>
                {desc}
              </p>
            )}
          </div>
        </>,
      );

    case "fullBleed":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div
            style={{
              textAlign: "center",
              padding: "64px 20px 72px",
              color: "#fff",
            }}
          >
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
            />
            <h1 style={{ margin: "16px 0 0", fontSize: 32, fontWeight: 800 }}>
              {name}
            </h1>
            {showDesc && (
              <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
                {desc}
              </p>
            )}
          </div>
        </>,
        `linear-gradient(160deg, ${colors.secondary}, ${colors.primary})`,
      );

    case "asymmetric":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "24px 20px 40px",
              color: "#fff",
            }}
          >
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
            />
            <div style={{ textAlign: "start" }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
                {name}
              </h1>
              {showDesc && (
                <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 13 }}>
                  {desc}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              background: colors.surface || "#fff",
              borderRadius: `${sheetRadius}px ${sheetRadius}px 0 0`,
              height: 24,
            }}
          />
        </>,
        `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
      );

    case "neonGlow":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div style={{ textAlign: "center", padding: "40px 16px 48px" }}>
            <div
              style={{
                display: "inline-block",
                padding: 4,
                borderRadius: "50%",
                boxShadow: `0 0 24px ${colors.primary}`,
              }}
            >
              <LogoCircle
                src={data.logo}
                size={logoSize}
                name={name}
                colors={colors}
                border={false}
              />
            </div>
            <h1
              style={{
                margin: "16px 0 0",
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                textShadow: `0 0 18px ${colors.primary}`,
              }}
            >
              {name}
            </h1>
            {showDesc && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "rgba(255,255,255,.6)",
                  fontSize: 13,
                }}
              >
                {desc}
              </p>
            )}
          </div>
        </>,
        "#0a0a12",
      );

    case "magazine":
      return wrap(
        <div
          style={{
            background: colors.surface || "#fff",
            padding: "12px 16px 28px",
          }}
        >
          <TopChrome props={props} colors={colors} light />
          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: colors.muted,
                marginBottom: 8,
              }}
            >
              Menu
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 34,
                fontWeight: 900,
                color: colors.text,
              }}
            >
              {name}
            </h1>
            {showDesc && (
              <p
                style={{ margin: "8px 0 0", fontSize: 13, color: colors.muted }}
              >
                {desc}
              </p>
            )}
          </div>
        </div>,
      );

    case "minimalTop":
      return wrap(
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
              background: colors.surface || "#fff",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
              border={false}
            />
            {props.showLang !== false && (
              <span style={{ fontSize: 11, color: colors.muted }}>EN | AR</span>
            )}
          </div>
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              background: colors.surface || "#fff",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 24, color: colors.text }}>
              {name}
            </h1>
            {showDesc && (
              <p
                style={{ margin: "6px 0 0", fontSize: 12, color: colors.muted }}
              >
                {desc}
              </p>
            )}
          </div>
        </>,
      );

    case "dualTone":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: 160,
            }}
          >
            <div
              style={{
                background: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <LogoCircle
                src={data.logo}
                size={logoSize}
                name={name}
                colors={colors}
              />
            </div>
            <div
              style={{
                background: colors.secondary,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <h1 style={{ margin: 0, fontSize: 22 }}>{name}</h1>
              {showDesc && (
                <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.9 }}>
                  {desc}
                </p>
              )}
            </div>
          </div>
        </>,
      );

    case "waveSheet":
    case "softSheet":
    case "floatingLogo":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 8,
              marginBottom: -logoSize / 2,
              position: "relative",
              zIndex: 5,
            }}
          >
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
            />
          </div>
          <div
            style={{
              background: colors.surface || "#fff",
              borderRadius: `${sheetRadius}px ${sheetRadius}px 0 0`,
              paddingTop: logoSize / 2 + 16,
              paddingBottom: 16,
              paddingInline: 16,
              textAlign: "center",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 22, color: colors.text }}>
              {name}
            </h1>
            {showDesc && (
              <p
                style={{ margin: "6px 0 0", fontSize: 12, color: colors.muted }}
              >
                {desc}
              </p>
            )}
          </div>
        </>,
        `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
      );

    case "stickyCompact":
      return wrap(
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: colors.primary,
            color: "#fff",
          }}
        >
          <LogoCircle
            src={data.logo}
            size={logoSize}
            name={name}
            colors={colors}
            border={false}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 14 }}>{name}</strong>
          </div>
          {props.showLang !== false && (
            <span style={{ fontSize: 11 }}>EN|AR</span>
          )}
        </div>,
      );

    case "poster":
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div style={{ padding: "36px 20px 48px", color: "#fff" }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              Digital Menu
            </div>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {name}
            </h1>
            {showDesc && (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 14,
                  opacity: 0.85,
                  maxWidth: 280,
                }}
              >
                {desc}
              </p>
            )}
          </div>
        </>,
        `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`,
      );

    case "elegantLine":
      return wrap(
        <div
          style={{
            background: "#1a1512",
            color: "#f5f0e8",
            padding: "16px 20px 40px",
            textAlign: "center",
          }}
        >
          <TopChrome props={{ ...props, showSocial: false }} colors={colors} />
          <LogoCircle
            src={data.logo}
            size={logoSize}
            name={name}
            colors={colors}
            border={false}
          />
          <h1
            style={{
              margin: "16px 0 0",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            {name}
          </h1>
          <div
            style={{
              width: 48,
              height: 1,
              background: colors.secondary || "#c9a227",
              margin: "14px auto",
            }}
          />
          {showDesc && (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>{desc}</p>
          )}
        </div>,
      );

    case "centeredClassic":
    default:
      return wrap(
        <>
          <TopChrome props={props} colors={colors} />
          <div
            style={{
              textAlign: "center",
              padding: "28px 16px 36px",
              color: "#fff",
            }}
          >
            <LogoCircle
              src={data.logo}
              size={logoSize}
              name={name}
              colors={colors}
            />
            <h1 style={{ margin: "14px 0 0", fontSize: 26 }}>{name}</h1>
            {showDesc && (
              <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 13 }}>
                {desc}
              </p>
            )}
          </div>
          <div
            style={{
              background: colors.surface || "#fff",
              borderRadius: `${sheetRadius}px ${sheetRadius}px 0 0`,
              height: 20,
            }}
          />
        </>,
        `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`,
      );
  }
}
