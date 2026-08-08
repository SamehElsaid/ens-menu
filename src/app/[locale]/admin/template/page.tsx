"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoAddOutline } from "react-icons/io5";
import { templateApi } from "@/lib/template-builder/data/api";
import type { TemplateListItem } from "@/lib/template-builder/schema";
import {
  Button,
  ButtonLink,
  EmptyState,
  PageHeader,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui";

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
      <PageHeader
        className="mb-6"
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button loading={creating} onClick={() => void create()}>
            {creating ? t("creating") : t("newTemplate")}
          </Button>
        }
      />

      {loading ? (
        <SkeletonRegion label={t("loading")}>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonRegion>
      ) : items.length === 0 ? (
        <EmptyState
          title={t("noTemplates")}
          action={
            <Button
              variant="secondary"
              startIcon={<IoAddOutline />}
              onClick={() => void create()}
              loading={creating}
            >
              {t("createFromStarter")}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${locale}/admin/template/${item.id}`}
                  className="flex items-center gap-3 font-medium text-fg hover:text-brand"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  ) : null}
                  <span className="truncate">
                    {locale === "ar" && item.nameAr ? item.nameAr : item.name}
                  </span>
                </Link>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {item.slug} · {new Date(item.updatedAt).toLocaleString(locale)}
                </p>
              </div>
              <ButtonLink
                href={`/${locale}/admin/template/${item.id}`}
                size="sm"
              >
                {t("edit")}
              </ButtonLink>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await templateApi.duplicateTemplate(item.id);
                  toast.success(t("duplicated"));
                  await refresh();
                }}
              >
                {t("duplicate")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  toast.info(
                    (await templateApi.publishTemplate(item.id)).message,
                  );
                }}
              >
                {t("publish")}
              </Button>
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={async () => {
                  if (!confirm(t("deleteConfirm"))) return;
                  await templateApi.deleteTemplate(item.id);
                  toast.success(t("deleted"));
                  await refresh();
                }}
              >
                {t("delete")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
