"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { templateApi } from "@/lib/template-builder/data/api";
import type { TemplateListItem } from "@/lib/template-builder/schema";

export default function TemplateListPage() {
  const locale = useLocale();
  const t = useTranslations("templateBuilder");
  const [items, setItems] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await templateApi.listTemplates());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async () => {
    setCreating(true);
    try {
      const doc = await templateApi.createTemplate(t("defaultName"));
      window.location.href = `/${locale}/admin/template/${doc.id}`;
    } catch {
      toast.error(t("createFailed"));
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={creating}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {creating ? t("creating") : t("newTemplate")}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t("loading")}</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <p className="mb-4 text-slate-500">{t("noTemplates")}</p>
          <button
            type="button"
            onClick={() => void create()}
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            {t("createFromStarter")}
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${locale}/admin/template/${item.id}`}
                  className="font-medium text-slate-900 hover:text-violet-600 dark:text-white"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.slug} · {new Date(item.updatedAt).toLocaleString(locale)}
                </p>
              </div>
              <Link
                href={`/${locale}/admin/template/${item.id}`}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-xs text-white"
              >
                {t("edit")}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await templateApi.duplicateTemplate(item.id);
                  toast.success(t("duplicated"));
                  await refresh();
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              >
                {t("duplicate")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  toast.info((await templateApi.publishTemplate(item.id)).message);
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-600"
              >
                {t("publish")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(t("deleteConfirm"))) return;
                  await templateApi.deleteTemplate(item.id);
                  toast.success(t("deleted"));
                  await refresh();
                }}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600"
              >
                {t("delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
