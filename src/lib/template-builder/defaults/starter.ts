import type { BuilderNode, TemplateDocument } from "../schema/types";
import { createId } from "../schema/types";

function n(
  type: string,
  props: Record<string, unknown> = {},
  styles: BuilderNode["styles"] = { desktop: {} },
  children?: BuilderNode[],
  name?: string,
): BuilderNode {
  return {
    id: createId(type.replace(".", "_")),
    type,
    name,
    props,
    styles,
    children,
  };
}

/** Starter = Default OneCard structure — fully editable tree */
export function createOneCardStarterDocument(
  overrides?: Partial<Pick<TemplateDocument, "id" | "name" | "slug">>,
): TemplateDocument {
  const now = new Date().toISOString();
  const id = overrides?.id ?? createId("tpl");

  const sheetChildren: BuilderNode[] = [
    n(
      "menu.ads",
      {
        adStyle: "promo",
        label: "ENS — Enterprise Network Solutions",
        title: "ENS",
        image: "/images/ads/ens-promo-banner.png",
        borderRadius: 18,
        paddingY: 0,
      },
      { desktop: { padding: "8px 16px" } },
      undefined,
      "Ads",
    ),
    n(
      "menu.categories",
      { layout: "circles", showAll: true },
      {
        desktop: {
          width: "100%",
          padding: "16px",
        },
      },
      undefined,
      "Categories",
    ),
    n(
      "menu.items",
      {
        cardStyle: "split",
        columns: 2,
        showPrice: true,
        showDescription: true,
        showBadge: true,
        borderRadius: 28,
        imageRatio: 0.85,
      },
      {
        desktop: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          padding: "16px",
        },
        tablet: { gridTemplateColumns: "repeat(2, 1fr)" },
        mobile: { gridTemplateColumns: "1fr" },
      },
      undefined,
      "Products",
    ),
    n("menu.hours", {}, { desktop: { padding: "24px", textAlign: "center" } }, undefined, "Hours"),
    n(
      "menu.social",
      {},
      {
        desktop: {
          display: "flex",
          gap: 12,
          justifyContent: "center",
          padding: "12px",
        },
      },
      undefined,
      "Social",
    ),
    n(
      "menu.footer",
      { showPoweredBy: true },
      {
        desktop: {
          padding: "20px",
          textAlign: "center",
          fontSize: 13,
          color: "{{colors.muted}}",
        },
      },
      undefined,
      "Footer",
    ),
  ];

  const root = n(
    "section",
    {},
    {
      desktop: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, {{colors.secondary}}, {{colors.primary}})",
        width: "100%",
      },
    },
    [
      n(
        "menu.header",
        {
          headerStyle: "floatingLogo",
          showLang: true,
          showSocial: true,
          showDescription: true,
          showCategories: false,
          logoSize: 110,
          sheetRadius: 80,
        },
        { desktop: { width: "100%" } },
        undefined,
        "Header pack",
      ),
      n(
        "sheet",
        {},
        {
          desktop: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: "{{colors.surface}}",
            borderRadius: "0 0 30px 30px",
            padding: "0 0 24px",
            width: "100%",
            flex: 1,
            marginTop: 0,
          },
        },
        sheetChildren,
        "Content sheet",
      ),
    ],
    "Page",
  );

  return {
    id,
    name: overrides?.name ?? "Default Full Control",
    slug: overrides?.slug ?? "builder",
    version: 1,
    baseTheme: "default",
    createdAt: now,
    updatedAt: now,
    seoMeta: { title: overrides?.name ?? "Default Full Control" },
    globalStyles: {
      colors: {
        primary: "#7000B5",
        secondary: "#9B30FF",
        bg: "#7000B5",
        surface: "#fdfdfd",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
      },
      typography: {
        h1: { fontSize: 32, fontWeight: 700 },
        h2: { fontSize: 24, fontWeight: 700 },
        body: { fontSize: 16, fontWeight: 400 },
      },
      spacingScale: [4, 8, 12, 16, 24, 32, 48, 64],
    },
    customCode: { headHTML: "", bodyHTML: "", customCSS: "", customJS: "" },
    root,
  };
}
