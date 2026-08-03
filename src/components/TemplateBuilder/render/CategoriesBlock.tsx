"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CategoryLayoutId } from "@/lib/template-builder/library/stylePresets";

export type CategoryItem = {
  id: number;
  name: string;
  nameAr?: string;
  image?: string | null;
};

type Props = {
  layout: CategoryLayoutId | string;
  categories: CategoryItem[];
  colors: Record<string, string>;
  locale?: "en" | "ar";
  showAll?: boolean;
  style?: CSSProperties;
  activeId?: number;
  onSelect?: (id: number) => void;
};

function labelOf(c: CategoryItem, isAr: boolean) {
  return isAr ? c.nameAr || c.name : c.name;
}

function thumbFill(
  colors: Record<string, string>,
  image?: string | null,
): CSSProperties {
  return {
    backgroundColor: colors.border || "#e2e8f0",
    backgroundImage: image ? `url(${image})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function CategoriesBlock({
  layout,
  categories,
  colors,
  locale = "en",
  showAll = true,
  style,
  activeId,
  onSelect,
}: Props) {
  const isAr = locale === "ar";
  const items = categories;

  const hit = (id: number, node: ReactNode) => {
    const faded = activeId !== undefined && activeId !== id;
    if (!onSelect) {
      return (
        <div key={id} style={{ opacity: faded ? 0.55 : 1 }}>
          {node}
        </div>
      );
    }
    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelect(id)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "inherit",
          font: "inherit",
          opacity: faded ? 0.55 : 1,
          flexShrink: 0,
        }}
      >
        {node}
      </button>
    );
  };

  const row = (extra: CSSProperties, kids: ReactNode): ReactNode => (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: "center",
        flexWrap: layout === "stacked" ? undefined : "wrap",
        alignItems: "center",
        overflowX: ["rail", "imageStrip", "pills", "chips", "gradient", "soft", "glass"].includes(
          String(layout),
        )
          ? "auto"
          : undefined,
        flexDirection: layout === "stacked" ? "column" : "row",
        width: "100%",
        ...extra,
        ...style,
      }}
    >
      {kids}
    </div>
  );

  const allNode =
    layout === "circles" ||
    layout === "squares" ||
    layout === "iconOnly" ||
    layout === "cards" ||
    layout === "rail" ||
    layout === "imageStrip" ? (
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div
          style={{
            width: 56,
            height: layout === "cards" ? 44 : 56,
            borderRadius: layout === "squares" || layout === "cards" ? 12 : "50%",
            border: `2px solid ${activeId === 0 ? colors.primary : colors.border || colors.primary}`,
            margin: "0 auto 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: colors.primary,
          }}
        >
          {isAr ? "الكل" : "All"}
        </div>
        {(layout === "circles" || layout === "squares" || layout === "rail") && (
          <span style={{ fontSize: 10, color: colors.primary }}>
            {isAr ? "الكل" : "All"}
          </span>
        )}
      </div>
    ) : layout === "stacked" || layout === "numbered" ? (
      <div
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          background: `${colors.primary}15`,
          color: colors.primary,
          fontWeight: 700,
          fontSize: 13,
          textAlign: "start",
        }}
      >
        {isAr ? "الكل" : "All"}
      </div>
    ) : (
      <span
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: activeId === 0 ? colors.primary : `${colors.primary}22`,
          color: activeId === 0 ? "#fff" : colors.primary,
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {isAr ? "الكل" : "All"}
      </span>
    );

  if (layout === "rail") {
    return row(
      {
        margin: "0 8px",
        padding: "12px 14px",
        borderRadius: 999,
        background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,.08)",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
      },
      <>
        {showAll && hit(0, allNode)}
        {items.map((c) =>
          hit(
            c.id,
            <div
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
                  color: colors.primary,
                  fontSize: 10,
                  ...thumbFill(colors, c.image),
                }}
              >
                {!c.image && "◉"}
              </div>
              <span style={{ fontSize: 9, color: colors.primary, whiteSpace: "nowrap" }}>
                {labelOf(c, isAr)}
              </span>
            </div>,
          ),
        )}
      </>,
    );
  }

  if (layout === "stacked" || layout === "numbered") {
    return row(
      { alignItems: "stretch", gap: 8, paddingInline: 16 },
      <>
        {showAll && hit(0, allNode)}
        {items.map((c, i) =>
          hit(
            c.id,
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${colors.border || "#e2e8f0"}`,
                background: colors.surface || "#fff",
                width: "100%",
              }}
            >
              {layout === "numbered" ? (
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: colors.primary,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    ...thumbFill(colors, c.image),
                  }}
                />
              )}
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                {labelOf(c, isAr)}
              </span>
            </div>,
          ),
        )}
      </>,
    );
  }

  return row(
    {},
    <>
      {showAll && hit(0, allNode)}
      {items.map((c) => {
        const label = labelOf(c, isAr);

        if (layout === "pills" || layout === "gradient") {
          return hit(
            c.id,
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                background:
                  layout === "gradient"
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    : colors.primary,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              {label}
            </span>,
          );
        }

        if (layout === "chips") {
          return hit(
            c.id,
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${colors.primary}`,
                color: colors.primary,
                fontSize: 11,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              {label}
            </span>,
          );
        }

        if (layout === "soft") {
          return hit(
            c.id,
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                background: `${colors.primary}18`,
                color: colors.primary,
                fontSize: 11,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              {label}
            </span>,
          );
        }

        if (layout === "glass") {
          return hit(
            c.id,
            <span
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,.55)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${colors.border || "rgba(0,0,0,.08)"}`,
                color: colors.text,
                fontSize: 11,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              {label}
            </span>,
          );
        }

        if (layout === "underline") {
          return hit(
            c.id,
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.text,
                borderBottom: `2px solid ${
                  activeId === c.id ? colors.primary : "transparent"
                }`,
                paddingBottom: 4,
                display: "inline-block",
              }}
            >
              {label}
            </span>,
          );
        }

        if (layout === "imageStrip") {
          return hit(
            c.id,
            <div
              style={{
                width: 88,
                height: 56,
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
                ...thumbFill(colors, c.image),
              }}
            >
              <span
                style={{
                  position: "absolute",
                  insetInline: 0,
                  bottom: 0,
                  padding: "4px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  backgroundImage: "linear-gradient(transparent, rgba(0,0,0,.65))",
                }}
              >
                {label}
              </span>
            </div>,
          );
        }

        if (layout === "cards") {
          return hit(
            c.id,
            <div
              style={{
                width: 76,
                borderRadius: 14,
                overflow: "hidden",
                border: `1px solid ${colors.border || "#e2e8f0"}`,
                backgroundColor: colors.surface || "#fff",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  height: 48,
                  ...thumbFill(colors, c.image),
                }}
              />
              <div style={{ padding: "6px 4px", fontSize: 10, fontWeight: 600, color: colors.text }}>
                {label}
              </div>
            </div>,
          );
        }

        if (layout === "iconOnly") {
          return hit(
            c.id,
            <div
              title={label}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `2px solid ${colors.primary}`,
                ...thumbFill(colors, c.image),
              }}
            />,
          );
        }

        const square = layout === "squares";
        return hit(
          c.id,
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: square ? 14 : "50%",
                border: `2px solid ${
                  activeId === c.id ? colors.primary : colors.border || colors.primary
                }`,
                margin: "0 auto 4px",
                overflow: "hidden",
                ...thumbFill(colors, c.image),
              }}
            />
            <span style={{ fontSize: 10, color: colors.primary }}>{label}</span>
          </div>,
        );
      })}
    </>,
  );
}
