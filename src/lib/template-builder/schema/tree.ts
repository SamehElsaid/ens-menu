import type { CSSProperties } from "react";
import type { Breakpoint, BuilderNode, StyleProps, TemplateDocument } from "./types";
import { createId } from "./types";

export function findNode(root: BuilderNode, id: string): BuilderNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParentOf(
  root: BuilderNode,
  childId: string,
): BuilderNode | null {
  for (const child of root.children ?? []) {
    if (child.id === childId) return root;
    const nested = findParentOf(child, childId);
    if (nested) return nested;
  }
  return null;
}

export function cloneNode(node: BuilderNode): BuilderNode {
  return {
    ...node,
    id: createId(node.type.replace(".", "_")),
    props: { ...node.props },
    styles: {
      desktop: { ...node.styles.desktop },
      tablet: node.styles.tablet ? { ...node.styles.tablet } : undefined,
      mobile: node.styles.mobile ? { ...node.styles.mobile } : undefined,
    },
    customCode: node.customCode ? { ...node.customCode } : undefined,
    children: node.children?.map(cloneNode),
  };
}

export function removeNode(root: BuilderNode, id: string): BuilderNode {
  return {
    ...root,
    children: root.children
      ?.filter((c) => c.id !== id)
      .map((c) => removeNode(c, id)),
  };
}

export function updateNode(
  root: BuilderNode,
  id: string,
  updater: (n: BuilderNode) => BuilderNode,
): BuilderNode {
  if (root.id === id) return updater(root);
  return {
    ...root,
    children: root.children?.map((c) => updateNode(c, id, updater)),
  };
}

export function insertChild(
  root: BuilderNode,
  parentId: string,
  child: BuilderNode,
  index?: number,
): BuilderNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    const at =
      index === undefined
        ? children.length
        : Math.max(0, Math.min(index, children.length));
    children.splice(at, 0, child);
    return { ...root, children };
  }
  return {
    ...root,
    children: root.children?.map((c) =>
      insertChild(c, parentId, child, index),
    ),
  };
}

export function moveNode(
  root: BuilderNode,
  nodeId: string,
  newParentId: string,
  index: number,
): BuilderNode {
  const node = findNode(root, nodeId);
  if (!node || nodeId === newParentId) return root;
  if (findNode(node, newParentId)) return root;
  return insertChild(removeNode(root, nodeId), newParentId, node, index);
}

export function reorderSibling(
  root: BuilderNode,
  parentId: string,
  fromIndex: number,
  toIndex: number,
): BuilderNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= children.length ||
      toIndex >= children.length
    )
      return root;
    const [item] = children.splice(fromIndex, 1);
    children.splice(toIndex, 0, item);
    return { ...root, children };
  }
  return {
    ...root,
    children: root.children?.map((c) =>
      reorderSibling(c, parentId, fromIndex, toIndex),
    ),
  };
}

export function resolveToken(
  value: string | undefined,
  colors: Record<string, string>,
): string | undefined {
  if (!value) return value;
  return value.replace(/\{\{colors\.(\w+)\}\}/g, (_, key: string) => {
    return colors[key] ?? value;
  });
}

export function stylesToCss(
  styles: StyleProps,
  colors: Record<string, string> = {},
): CSSProperties {
  const s: StyleProps = { ...styles };
  for (const key of [
    "color",
    "background",
    "backgroundColor",
    "borderColor",
  ] as const) {
    const v = s[key];
    if (typeof v === "string") s[key] = resolveToken(v, colors);
  }
  const css: Record<string, string | number | undefined> = {};
  const map: Record<string, string> = {
    display: "display",
    flex: "flex",
    flexDirection: "flexDirection",
    flexWrap: "flexWrap",
    justifyContent: "justifyContent",
    alignItems: "alignItems",
    gap: "gap",
    gridTemplateColumns: "gridTemplateColumns",
    width: "width",
    maxWidth: "maxWidth",
    minWidth: "minWidth",
    minHeight: "minHeight",
    height: "height",
    padding: "padding",
    margin: "margin",
    background: "background",
    backgroundColor: "backgroundColor",
    backgroundImage: "backgroundImage",
    backgroundSize: "backgroundSize",
    backgroundPosition: "backgroundPosition",
    color: "color",
    fontFamily: "fontFamily",
    fontSize: "fontSize",
    fontWeight: "fontWeight",
    lineHeight: "lineHeight",
    letterSpacing: "letterSpacing",
    textAlign: "textAlign",
    border: "border",
    borderRadius: "borderRadius",
    borderWidth: "borderWidth",
    borderColor: "borderColor",
    borderStyle: "borderStyle",
    boxShadow: "boxShadow",
    opacity: "opacity",
    overflow: "overflow",
    position: "position",
    transition: "transition",
    objectFit: "objectFit",
  };
  for (const [k, cssKey] of Object.entries(map)) {
    const val = s[k as keyof StyleProps];
    if (val === undefined || val === "") continue;
    if (
      typeof val === "number" &&
      !["opacity", "fontWeight", "zIndex", "lineHeight", "flex"].includes(k)
    ) {
      css[cssKey] = `${val}px`;
    } else css[cssKey] = val as string | number;
  }
  if (
    s.backgroundImage &&
    !s.backgroundImage.startsWith("url") &&
    !s.backgroundImage.includes("gradient")
  ) {
    css.backgroundImage = `url(${s.backgroundImage})`;
  }
  return css as CSSProperties;
}

export function mergeBreakpointStyles(
  node: BuilderNode,
  breakpoint: Breakpoint,
): StyleProps {
  const base = { ...node.styles.desktop };
  if (breakpoint === "tablet" || breakpoint === "mobile") {
    Object.assign(base, node.styles.tablet ?? {});
  }
  if (breakpoint === "mobile") Object.assign(base, node.styles.mobile ?? {});
  return base;
}

export type { TemplateDocument };
