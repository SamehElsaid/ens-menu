/** Full-control TemplateDocument — ens-menu builder ↔ View-app renderer */

export type Breakpoint = "desktop" | "tablet" | "mobile";

export type StyleProps = {
  display?: string;
  flex?: string | number;
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string | number;
  gridTemplateColumns?: string;
  width?: string | number;
  maxWidth?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  height?: string | number;
  padding?: string;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  margin?: string;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: string;
  border?: string;
  borderRadius?: string | number;
  borderWidth?: string | number;
  borderColor?: string;
  borderStyle?: string;
  boxShadow?: string;
  opacity?: number;
  overflow?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
  transform?: string;
  transition?: string;
  objectFit?: string;
};

export type NodeCustomCode = { html?: string; css?: string; js?: string };
export type PageCustomCode = {
  headHTML?: string;
  bodyHTML?: string;
  customCSS?: string;
  customJS?: string;
};

export type BuilderNode = {
  id: string;
  type: string;
  name?: string;
  props: Record<string, unknown>;
  styles: {
    desktop: StyleProps;
    tablet?: StyleProps;
    mobile?: StyleProps;
  };
  customCode?: NodeCustomCode;
  children?: BuilderNode[];
  locked?: boolean;
};

export type GlobalStyles = {
  colors: Record<string, string>;
  typography: Record<string, Partial<StyleProps>>;
  spacingScale?: number[];
};

/** Catalog / publish metadata shown when saving a template */
export type TemplateCatalogMeta = {
  /** English display name (also used as document.name) */
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** Preview / catalog image (URL or data URL) */
  image: string;
};

/** Full page document — free tree + theme tokens */
export type TemplateDocument = {
  id: string;
  name: string;
  slug: string;
  version: 1;
  createdAt: string;
  updatedAt: string;
  /** Visual base hint for starters */
  baseTheme?: "default" | "blank";
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  seoMeta?: { title?: string; description?: string };
  globalStyles: GlobalStyles;
  customCode?: PageCustomCode;
  root: BuilderNode;
};

export type TemplateListItem = {
  id: string;
  name: string;
  nameAr?: string;
  image?: string;
  slug: string;
  updatedAt: string;
  createdAt: string;
};

export const CONTAINER_TYPES = new Set([
  "section",
  "container",
  "row",
  "column",
  "cta",
  "sheet",
]);

export function createId(prefix = "node"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function isValidDocument(doc: unknown): doc is TemplateDocument {
  if (!doc || typeof doc !== "object") return false;
  const d = doc as TemplateDocument;
  return (
    typeof d.id === "string" &&
    typeof d.name === "string" &&
    d.version === 1 &&
    !!d.root?.id &&
    !!d.globalStyles?.colors
  );
}
