import { get, set, del, keys } from "idb-keyval";
import type { TemplateDocument, TemplateListItem } from "../schema/types";
import { createId, isValidDocument } from "../schema/types";
import { createOneCardStarterDocument } from "../defaults/starter";
import { sanitizeTemplateDocument } from "../sanitizeContent";

const PREFIX = "ens_tpl_v3_";
const INDEX_KEY = "ens_tpl_v3_index";

export interface TemplateDataLayer {
  listTemplates(): Promise<TemplateListItem[]>;
  getTemplate(id: string): Promise<TemplateDocument | null>;
  saveTemplate(doc: TemplateDocument): Promise<TemplateDocument>;
  createTemplate(name?: string): Promise<TemplateDocument>;
  duplicateTemplate(id: string): Promise<TemplateDocument | null>;
  deleteTemplate(id: string): Promise<void>;
  publishTemplate(id: string): Promise<{ ok: boolean; message: string }>;
}

async function readIndex(): Promise<TemplateListItem[]> {
  return (await get<TemplateListItem[]>(INDEX_KEY)) ?? [];
}

async function writeIndex(index: TemplateListItem[]): Promise<void> {
  await set(INDEX_KEY, index);
}

function toListItem(doc: TemplateDocument): TemplateListItem {
  return {
    id: doc.id,
    name: doc.name,
    nameAr: doc.nameAr,
    image: doc.image,
    slug: doc.slug,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
  };
}

export const localTemplateDataLayer: TemplateDataLayer = {
  async listTemplates() {
    return [...(await readIndex())].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  async getTemplate(id) {
    const doc = await get<TemplateDocument>(`${PREFIX}${id}`);
    return doc && isValidDocument(doc) ? sanitizeTemplateDocument(doc) : null;
  },

  async saveTemplate(doc) {
    const next = sanitizeTemplateDocument({
      ...doc,
      updatedAt: new Date().toISOString(),
    });
    await set(`${PREFIX}${next.id}`, next);
    const index = await readIndex();
    const i = index.findIndex((x) => x.id === next.id);
    const item = toListItem(next);
    if (i >= 0) index[i] = item;
    else index.push(item);
    await writeIndex(index);
    return next;
  },

  async createTemplate(name = "Default Full Control") {
    return this.saveTemplate(
      createOneCardStarterDocument({
        id: createId("tpl"),
        name,
        slug: "builder",
      }),
    );
  },

  async duplicateTemplate(id) {
    const src = await this.getTemplate(id);
    if (!src) return null;
    const now = new Date().toISOString();
    return this.saveTemplate({
      ...structuredClone(src),
      id: createId("tpl"),
      name: `${src.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    });
  },

  async deleteTemplate(id) {
    await del(`${PREFIX}${id}`);
    await writeIndex((await readIndex()).filter((x) => x.id !== id));
  },

  async publishTemplate(id) {
    void id;
    return {
      ok: false,
      message:
        "Publish API not connected. Export JSON → bootstrap templateDocument with theme=builder.",
    };
  },
};

export const templateApi: TemplateDataLayer = localTemplateDataLayer;

/** aliases for older list page naming */
export const themeApi = {
  listThemes: () => templateApi.listTemplates(),
  getTheme: (id: string) => templateApi.getTemplate(id),
  saveTheme: (doc: TemplateDocument) => templateApi.saveTemplate(doc),
  createTheme: (name?: string) => templateApi.createTemplate(name),
  duplicateTheme: (id: string) => templateApi.duplicateTemplate(id),
  deleteTheme: (id: string) => templateApi.deleteTemplate(id),
  publishTheme: (id: string) => templateApi.publishTemplate(id),
};

export async function clearAllLocalTemplates(): Promise<void> {
  for (const k of await keys()) {
    if (
      typeof k === "string" &&
      (k.startsWith(PREFIX) || k.startsWith("ens_theme_") || k.startsWith("ens_tpl_"))
    ) {
      await del(k);
    }
  }
  await del(INDEX_KEY);
  await del("ens_theme_index");
  await del("ens_tpl_index");
}
