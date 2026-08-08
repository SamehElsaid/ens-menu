"use client";

import type { CSSProperties, ReactNode } from "react";
import type { AdStyleId } from "@/lib/template-builder/library/stylePresets";

type Props = {
  adStyle: AdStyleId | string;
  props: Record<string, unknown>;
  colors: Record<string, string>;
  label?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const DEFAULT_IMAGE = "/images/ads/ens-promo-banner.png";

function Frame({
  radius,
  children,
  aspect = "16 / 5",
  minHeight = 100,
}: {
  radius: number;
  children: ReactNode;
  aspect?: string;
  minHeight?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: radius,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,.08)",
        boxShadow: "0 10px 28px rgba(0,0,0,.12)",
        backgroundColor: "#111",
        aspectRatio: aspect,
        minHeight,
      }}
    >
      {children}
    </div>
  );
}

function BgImage({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  );
}

/** Image + text overlay — each adStyle is a different composition */
export function AdsBlock({
  adStyle,
  props,
  colors,
  label = "Ad banner",
  style,
  children,
}: Props) {
  const radius = Number(props.borderRadius) || 16;
  const image = String(props.image || props.src || DEFAULT_IMAGE);
  const title = String(props.title || props.brand || "ENS");
  const subtitle = String(
    props.subtitle || props.label || props.labelEn || label,
  );
  const layout = (adStyle || "promo") as AdStyleId;

  if (children) {
    return (
      <aside style={{ width: "100%", ...style }}>
        <div style={{ borderRadius: radius, overflow: "hidden" }}>
          {children}
        </div>
      </aside>
    );
  }

  const body = (() => {
    switch (layout) {
      case "coverBottom":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                padding: "14px 16px",
                backgroundImage:
                  "linear-gradient(transparent, rgba(0,0,0,.78))",
                color: "#fff",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                {subtitle}
              </div>
            </div>
          </Frame>
        );

      case "coverCenter":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,.35)",
                color: "#fff",
                padding: 16,
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1 }}
                >
                  {title}
                </div>
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.95 }}>
                  {subtitle}
                </div>
              </div>
            </div>
          </Frame>
        );

      case "brandLeft":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                insetBlock: 0,
                insetInlineStart: 0,
                width: "34%",
                maxWidth: 180,
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingInline: 14,
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,.94) 60%, transparent)",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              />
              <div>
                <div
                  style={{ fontWeight: 800, fontSize: 16, color: "#1f2937" }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    letterSpacing: 0.5,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginTop: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {subtitle}
                </div>
              </div>
            </div>
          </Frame>
        );

      case "captionTop":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                top: 10,
                insetInlineEnd: 10,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,.55)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {title}
            </div>
          </Frame>
        );

      case "poster":
        return (
          <Frame radius={radius} aspect="16 / 7" minHeight={120}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(105deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.2) 55%, transparent 75%)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                Featured
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 36,
                  lineHeight: 1,
                  marginTop: 4,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9 }}>
                {subtitle}
              </div>
            </div>
          </Frame>
        );

      case "splitPanel":
        return (
          <Frame radius={radius}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "58% 42%",
                height: "100%",
                minHeight: 100,
              }}
            >
              <div style={{ position: "relative" }}>
                <BgImage src={image} />
              </div>
              <div
                style={{
                  backgroundColor: colors.primary,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    opacity: 0.92,
                    lineHeight: 1.35,
                  }}
                >
                  {subtitle}
                </div>
              </div>
            </div>
          </Frame>
        );

      case "badge":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                insetInlineStart: 14,
                padding: "8px 14px",
                borderRadius: 999,
                backgroundImage: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: "0 6px 16px rgba(0,0,0,.25)",
              }}
            >
              {title}
            </div>
          </Frame>
        );

      case "glassCard":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                insetInlineStart: 14,
                bottom: 14,
                maxWidth: "55%",
                padding: "12px 14px",
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,.55)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,.45)",
                color: colors.text || "#0f172a",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>
                {subtitle}
              </div>
            </div>
          </Frame>
        );

      case "minimalStrip":
        return (
          <Frame radius={radius} aspect="16 / 4.2" minHeight={84}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                insetInline: 0,
                bottom: 0,
                padding: "8px 12px",
                backgroundColor: "rgba(255,255,255,.88)",
                color: colors.text || "#0f172a",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {title}
            </div>
          </Frame>
        );

      case "dualLine":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                insetBlock: 0,
                insetInlineEnd: 0,
                width: "42%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingInline: 16,
                backgroundImage:
                  "linear-gradient(270deg, rgba(0,0,0,.55) 40%, transparent)",
                color: "#fff",
                textAlign: "start",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 28, lineHeight: 1 }}>
                {title}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.secondary || "#f2b705",
                }}
              >
                {subtitle}
              </div>
            </div>
          </Frame>
        );

      case "darkWash":
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.72))",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                {subtitle}
              </div>
            </div>
          </Frame>
        );

      case "promo":
      default:
        return (
          <Frame radius={radius}>
            <BgImage src={image} />
          </Frame>
        );
    }
  })();

  return <aside style={{ width: "100%", ...style }}>{body}</aside>;
}
