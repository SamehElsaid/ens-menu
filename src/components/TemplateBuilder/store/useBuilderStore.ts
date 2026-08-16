"use client";

import { create } from "zustand";
import type {
  Breakpoint,
  BuilderNode,
  TemplateDocument,
} from "@/lib/template-builder/schema";
import {
  cloneNode,
  findNode,
  findParentOf,
  insertChild,
  moveNode,
  removeNode,
  reorderSibling,
  updateNode,
  CONTAINER_TYPES,
} from "@/lib/template-builder/schema";
import { createNodeFromType } from "@/lib/template-builder/library/registry";
import { templateApi } from "@/lib/template-builder/data/api";

const MAX_HISTORY = 50;

type Hist = {
  root: BuilderNode;
  globalStyles: TemplateDocument["globalStyles"];
  name: string;
  customCode: TemplateDocument["customCode"];
};

type State = {
  document: TemplateDocument | null;
  selectedId: string | null;
  breakpoint: Breakpoint;
  leftTab: "components" | "layers";
  rightTab: "content" | "style" | "code" | "theme";
  previewLocale: "en" | "ar";
  dirty: boolean;
  saving: boolean;
  codeModalOpen: boolean;
  clipboard: BuilderNode | null;
  past: Hist[];
  future: Hist[];

  loadDocument: (doc: TemplateDocument) => void;
  setBreakpoint: (bp: Breakpoint) => void;
  setLeftTab: (t: "components" | "layers") => void;
  setRightTab: (t: "content" | "style" | "code" | "theme") => void;
  setPreviewLocale: (locale: "en" | "ar") => void;
  setCodeModalOpen: (v: boolean) => void;
  select: (id: string | null) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  updateMeta: (
    patch: Partial<
      Pick<
        TemplateDocument,
        | "name"
        | "nameAr"
        | "description"
        | "descriptionAr"
        | "image"
        | "slug"
        | "seoMeta"
        | "customCode"
        | "globalStyles"
      >
    >,
  ) => void;
  updateSelectedProps: (props: Record<string, unknown>) => void;
  updateSelectedStyles: (
    bp: Breakpoint,
    styles: Record<string, unknown>,
  ) => void;
  updateSelectedCustomCode: (code: BuilderNode["customCode"]) => void;
  updateSelectedName: (name: string) => void;
  addNode: (type: string, parentId?: string, index?: number) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteIntoSelected: () => void;
  moveSelected: (parentId: string, index: number) => void;
  reorderInParent: (parentId: string, from: number, to: number) => void;
  /** Silent autosave of current document. Pass meta to apply catalog fields then persist. */
  save: (
    meta?: Partial<
      Pick<
        TemplateDocument,
        "name" | "nameAr" | "description" | "descriptionAr" | "image"
      >
    >,
  ) => Promise<void>;
};

function snap(doc: TemplateDocument): Hist {
  return {
    root: structuredClone(doc.root),
    globalStyles: structuredClone(doc.globalStyles),
    name: doc.name,
    customCode: doc.customCode ? structuredClone(doc.customCode) : undefined,
  };
}

export const useBuilderStore = create<State>((set, get) => ({
  document: null,
  selectedId: null,
  breakpoint: "desktop",
  leftTab: "components",
  rightTab: "content",
  previewLocale: "en",
  dirty: false,
  saving: false,
  codeModalOpen: false,
  clipboard: null,
  past: [],
  future: [],

  loadDocument: (doc) =>
    set({
      document: structuredClone(doc),
      selectedId: doc.root.id,
      dirty: false,
      past: [],
      future: [],
      rightTab: "content",
    }),

  setBreakpoint: (bp) => set({ breakpoint: bp }),
  setLeftTab: (t) => set({ leftTab: t }),
  setRightTab: (t) => set({ rightTab: t }),
  setPreviewLocale: (locale) => set({ previewLocale: locale }),
  setCodeModalOpen: (v) => set({ codeModalOpen: v }),
  select: (id) => set({ selectedId: id }),

  pushHistory: () => {
    const { document: doc, past } = get();
    if (!doc) return;
    set({ past: [...past, snap(doc)].slice(-MAX_HISTORY), future: [] });
  },

  undo: () => {
    const { document: doc, past, future } = get();
    if (!doc || !past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [snap(doc), ...future],
      document: { ...doc, ...prev },
      dirty: true,
    });
  },

  redo: () => {
    const { document: doc, past, future } = get();
    if (!doc || !future.length) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...past, snap(doc)].slice(-MAX_HISTORY),
      document: { ...doc, ...next },
      dirty: true,
    });
  },

  updateMeta: (patch) => {
    const { document: doc } = get();
    if (!doc) return;
    get().pushHistory();
    set({ document: { ...doc, ...patch }, dirty: true });
  },

  updateSelectedProps: (props) => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: updateNode(doc.root, selectedId, (n) => ({
          ...n,
          props: { ...n.props, ...props },
        })),
      },
      dirty: true,
    });
  },

  updateSelectedStyles: (bp, styles) => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: updateNode(doc.root, selectedId, (n) => ({
          ...n,
          styles: {
            ...n.styles,
            [bp]: {
              ...(n.styles[bp] ?? (bp === "desktop" ? n.styles.desktop : {})),
              ...styles,
            },
          },
        })),
      },
      dirty: true,
    });
  },

  updateSelectedCustomCode: (code) => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: updateNode(doc.root, selectedId, (n) => ({
          ...n,
          customCode: code,
        })),
      },
      dirty: true,
    });
  },

  updateSelectedName: (name) => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: updateNode(doc.root, selectedId, (n) => ({ ...n, name })),
      },
      dirty: true,
    });
  },

  addNode: (type, parentId, index) => {
    const { document: doc, selectedId } = get();
    if (!doc) return;
    const node = createNodeFromType(type);
    if (!node) return;
    let targetParent = parentId ?? selectedId ?? doc.root.id;
    const target = findNode(doc.root, targetParent);
    const canNest =
      target && (CONTAINER_TYPES.has(target.type) || target.id === doc.root.id);
    let insertIndex = index;
    if (!canNest && target) {
      const parent = findParentOf(doc.root, target.id);
      if (parent) {
        targetParent = parent.id;
        insertIndex =
          (parent.children ?? []).findIndex((c) => c.id === target.id) + 1;
      } else targetParent = doc.root.id;
    }
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: insertChild(doc.root, targetParent, node, insertIndex),
      },
      selectedId: node.id,
      dirty: true,
    });
  },

  deleteSelected: () => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId || selectedId === doc.root.id) return;
    const parent = findParentOf(doc.root, selectedId);
    get().pushHistory();
    set({
      document: { ...doc, root: removeNode(doc.root, selectedId) },
      selectedId: parent?.id ?? doc.root.id,
      dirty: true,
    });
  },

  duplicateSelected: () => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId || selectedId === doc.root.id) return;
    const node = findNode(doc.root, selectedId);
    const parent = findParentOf(doc.root, selectedId);
    if (!node || !parent) return;
    const copy = cloneNode(node);
    const idx = (parent.children ?? []).findIndex((c) => c.id === selectedId);
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: insertChild(doc.root, parent.id, copy, idx + 1),
      },
      selectedId: copy.id,
      dirty: true,
    });
  },

  copySelected: () => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId || selectedId === doc.root.id) return;
    const node = findNode(doc.root, selectedId);
    if (node) set({ clipboard: structuredClone(node) });
  },

  pasteIntoSelected: () => {
    const { document: doc, selectedId, clipboard } = get();
    if (!doc || !clipboard) return;
    const copy = cloneNode(clipboard);
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: insertChild(doc.root, selectedId ?? doc.root.id, copy),
      },
      selectedId: copy.id,
      dirty: true,
    });
  },

  moveSelected: (parentId, index) => {
    const { document: doc, selectedId } = get();
    if (!doc || !selectedId || selectedId === doc.root.id) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: moveNode(doc.root, selectedId, parentId, index),
      },
      dirty: true,
    });
  },

  reorderInParent: (parentId, from, to) => {
    const { document: doc } = get();
    if (!doc) return;
    get().pushHistory();
    set({
      document: {
        ...doc,
        root: reorderSibling(doc.root, parentId, from, to),
      },
      dirty: true,
    });
  },

  save: async (meta) => {
    const { document: doc } = get();
    if (!doc) return;
    set({ saving: true });
    try {
      const toSave = meta
        ? {
            ...doc,
            ...meta,
            seoMeta: {
              ...doc.seoMeta,
              title: meta.name ?? doc.seoMeta?.title ?? doc.name,
              description: meta.description ?? doc.seoMeta?.description,
            },
          }
        : doc;
      const saved = await templateApi.saveTemplate(toSave);
      set({ document: saved, dirty: false, saving: false });
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },
}));
