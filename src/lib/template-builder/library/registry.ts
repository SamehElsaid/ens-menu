import type { BuilderNode } from "../schema/types";
import { createId } from "../schema/types";

export type ComponentCategory = "layout" | "menu" | "content" | "media";

export type ComponentDefinition = {
  type: string;
  label: string;
  category: ComponentCategory;
  icon: string;
  canHaveChildren: boolean;
  defaultProps: Record<string, unknown>;
  defaultStyles: BuilderNode["styles"];
  create: () => BuilderNode;
};

function def(partial: Omit<ComponentDefinition, "create">): ComponentDefinition {
  return {
    ...partial,
    create: () => ({
      id: createId(partial.type.replace(".", "_")),
      type: partial.type,
      name: partial.label,
      props: { ...partial.defaultProps },
      styles: {
        desktop: { ...partial.defaultStyles.desktop },
        tablet: partial.defaultStyles.tablet
          ? { ...partial.defaultStyles.tablet }
          : undefined,
        mobile: partial.defaultStyles.mobile
          ? { ...partial.defaultStyles.mobile }
          : undefined,
      },
      children: partial.canHaveChildren ? [] : undefined,
    }),
  };
}

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  def({
    type: "section",
    label: "Section",
    category: "layout",
    icon: "⬚",
    canHaveChildren: true,
    defaultProps: {},
    defaultStyles: {
      desktop: { display: "flex", flexDirection: "column", width: "100%", padding: "16px" },
    },
  }),
  def({
    type: "sheet",
    label: "Sheet (OneCard body)",
    category: "layout",
    icon: "▭",
    canHaveChildren: true,
    defaultProps: {},
    defaultStyles: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "{{colors.surface}}",
        borderRadius: "80px 80px 30px 30px",
        padding: "48px 16px 24px",
        width: "100%",
      },
    },
  }),
  def({
    type: "container",
    label: "Container",
    category: "layout",
    icon: "▢",
    canHaveChildren: true,
    defaultProps: {},
    defaultStyles: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "960px",
        width: "100%",
        margin: "0 auto",
        padding: "8px",
      },
    },
  }),
  def({
    type: "row",
    label: "Row",
    category: "layout",
    icon: "☰",
    canHaveChildren: true,
    defaultProps: {},
    defaultStyles: {
      desktop: { display: "flex", flexDirection: "row", gap: 16, width: "100%" },
      mobile: { flexDirection: "column" },
    },
  }),
  def({
    type: "column",
    label: "Column",
    category: "layout",
    icon: "▥",
    canHaveChildren: true,
    defaultProps: {},
    defaultStyles: {
      desktop: { display: "flex", flexDirection: "column", flex: 1, gap: 8, minWidth: 0 },
    },
  }),
  def({
    type: "heading",
    label: "Heading",
    category: "content",
    icon: "H",
    canHaveChildren: false,
    defaultProps: { text: "Heading", textAr: "عنوان", level: 2 },
    defaultStyles: {
      desktop: { fontSize: 28, fontWeight: 700, color: "{{colors.text}}", margin: "0 0 8px" },
    },
  }),
  def({
    type: "text",
    label: "Text",
    category: "content",
    icon: "T",
    canHaveChildren: false,
    defaultProps: { text: "Body text", textAr: "نص" },
    defaultStyles: {
      desktop: { fontSize: 16, color: "{{colors.muted}}", lineHeight: 1.5 },
    },
  }),
  def({
    type: "button",
    label: "Button",
    category: "content",
    icon: "◉",
    canHaveChildren: false,
    defaultProps: { label: "Click", labelAr: "اضغط", href: "#" },
    defaultStyles: {
      desktop: {
        display: "inline-flex",
        padding: "10px 20px",
        backgroundColor: "{{colors.primary}}",
        color: "#fff",
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
      },
    },
  }),
  def({
    type: "image",
    label: "Image",
    category: "media",
    icon: "▣",
    canHaveChildren: false,
    defaultProps: { src: "/ENSd.png", alt: "Image", altAr: "صورة" },
    defaultStyles: {
      desktop: { width: "100%", maxWidth: "400px", borderRadius: 8, objectFit: "cover" },
    },
  }),
  def({
    type: "spacer",
    label: "Spacer",
    category: "layout",
    icon: "↕",
    canHaveChildren: false,
    defaultProps: {},
    defaultStyles: { desktop: { height: 24, width: "100%" } },
  }),
  def({
    type: "html",
    label: "Custom HTML",
    category: "content",
    icon: "</>",
    canHaveChildren: false,
    defaultProps: { html: "<div>Custom HTML</div>" },
    defaultStyles: { desktop: { width: "100%" } },
  }),
  def({
    type: "cta",
    label: "CTA",
    category: "content",
    icon: "★",
    canHaveChildren: true,
    defaultProps: {
      title: "Ready to order?",
      titleAr: "جاهز للطلب؟",
      subtitle: "Browse our menu",
      subtitleAr: "تصفح قائمتنا",
    },
    defaultStyles: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "40px 24px",
        textAlign: "center",
        backgroundColor: "{{colors.primary}}",
        color: "#fff",
        borderRadius: 12,
      },
    },
  }),
  def({
    type: "menu.header",
    label: "Header Pack",
    category: "menu",
    icon: "▣",
    canHaveChildren: false,
    defaultProps: {
      headerStyle: "floatingLogo",
      showLang: true,
      showSocial: true,
      showDescription: true,
      showCategories: false,
      logoSize: 110,
      sheetRadius: 80,
    },
    defaultStyles: {
      desktop: { width: "100%" },
    },
  }),
  def({
    type: "menu.navbar",
    label: "Navbar",
    category: "menu",
    icon: "≡",
    canHaveChildren: false,
    defaultProps: { showLang: true, showSocial: true },
    defaultStyles: {
      desktop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        color: "#fff",
      },
    },
  }),
  def({
    type: "menu.logo",
    label: "Floating Logo",
    category: "menu",
    icon: "◎",
    canHaveChildren: false,
    defaultProps: { size: 110 },
    defaultStyles: {
      desktop: {
        width: 110,
        height: 110,
        margin: "0 auto -48px",
        borderRadius: "50%",
        border: "8px solid #fff",
        backgroundColor: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 10,
        position: "relative",
        overflow: "hidden",
      },
    },
  }),
  def({
    type: "menu.hero",
    label: "Hero Title",
    category: "menu",
    icon: "◆",
    canHaveChildren: false,
    defaultProps: { showDescription: true },
    defaultStyles: {
      desktop: { textAlign: "center", padding: "8px 16px 16px", color: "{{colors.text}}" },
    },
  }),
  def({
    type: "menu.categories",
    label: "Categories",
    category: "menu",
    icon: "◎",
    canHaveChildren: false,
    defaultProps: { layout: "circles", showAll: true },
    defaultStyles: {
      desktop: {
        width: "100%",
        padding: "16px",
      },
    },
  }),
  def({
    type: "menu.items",
    label: "Menu Items",
    category: "menu",
    icon: "▦",
    canHaveChildren: false,
    defaultProps: {
      cardStyle: "split",
      columns: 2,
      showPrice: true,
      showDescription: true,
      showBadge: true,
      borderRadius: 28,
      imageRatio: 0.85,
    },
    defaultStyles: {
      desktop: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
        padding: "16px",
      },
      mobile: { gridTemplateColumns: "1fr" },
    },
  }),
  def({
    type: "menu.hours",
    label: "Working Hours",
    category: "menu",
    icon: "◷",
    canHaveChildren: false,
    defaultProps: {},
    defaultStyles: {
      desktop: { padding: "24px", textAlign: "center" },
    },
  }),
  def({
    type: "menu.social",
    label: "Social Links",
    category: "menu",
    icon: "🔗",
    canHaveChildren: false,
    defaultProps: {},
    defaultStyles: {
      desktop: { display: "flex", gap: 12, justifyContent: "center", padding: "16px" },
    },
  }),
  def({
    type: "menu.footer",
    label: "Footer",
    category: "menu",
    icon: "▁",
    canHaveChildren: false,
    defaultProps: { showPoweredBy: true },
    defaultStyles: {
      desktop: { padding: "20px", textAlign: "center", fontSize: 13, color: "{{colors.muted}}" },
    },
  }),
  def({
    type: "menu.ads",
    label: "Ad Banner",
    category: "menu",
    icon: "📢",
    canHaveChildren: false,
    defaultProps: {
      adStyle: "promo",
      label: "ENS — Enterprise Network Solutions",
      title: "ENS",
      image: "/images/ads/ens-promo-banner.png",
      borderRadius: 18,
      paddingY: 0,
    },
    defaultStyles: {
      desktop: { padding: "8px 16px" },
    },
  }),
];

export function getComponentDef(type: string) {
  return COMPONENT_REGISTRY.find((c) => c.type === type);
}

export function createNodeFromType(type: string): BuilderNode | null {
  return getComponentDef(type)?.create() ?? null;
}
