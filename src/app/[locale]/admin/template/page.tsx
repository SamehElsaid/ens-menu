"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  IoAddOutline,
  IoDocumentTextOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import { templateApi } from "@/lib/template-builder/data/api";
import type { TemplateListItem } from "@/lib/template-builder/schema";
import {
  Button,
  ButtonLink,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  PageShell,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui";

export default function TemplateListPage() {
  const locale = useLocale();
  const t = useTranslations("templateBuilder");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const [items, setItems] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  /** `"<verb>:<id>"`, so a row action only spins the button that was pressed. */
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TemplateListItem | null>(
    null,
  );

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

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy("delete");
    try {
      await templateApi.deleteTemplate(pendingDelete.id);
      toast.success(t("deleted"));
      setPendingDelete(null);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

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
    <PageShell
      kind="detail"
      header={
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
          actions={
            <Button
              startIcon={<IoAddOutline />}
              loading={creating}
              onClick={() => void create()}
            >
              {creating ? t("creating") : t("newTemplate")}
            </Button>
          }
        />
      }
    >
      {loading ? (
        <SkeletonRegion label={t("loading")}>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
        /* A ruled list, not a grid of cards: these rows are identified by name
           and slug, and the only reason to look at one is to open it. */
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3"
            >
              <Link
                href={`/${locale}/admin/template/${item.id}`}
                className="group flex min-w-0 flex-1 items-center gap-3"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2 text-fg-subtle"
                  aria-hidden
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="size-10 object-cover"
                    />
                  ) : (
                    <IoDocumentTextOutline />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-fg group-hover:text-brand-soft-fg">
                    {locale === "ar" && item.nameAr ? item.nameAr : item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-fg-muted">
                    <span className="font-mono" dir="ltr">
                      {item.slug}
                    </span>
                    {" · "}
                    {new Date(item.updatedAt).toLocaleString(locale)}
                  </span>
                </span>
              </Link>

              <span className="flex items-center gap-1">
                <ButtonLink
                  href={`/${locale}/admin/template/${item.id}`}
                  variant="secondary"
                  size="sm"
                >
                  {t("edit")}
                </ButtonLink>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={busy === `duplicate:${item.id}`}
                  onClick={async () => {
                    setBusy(`duplicate:${item.id}`);
                    try {
                      await templateApi.duplicateTemplate(item.id);
                      toast.success(t("duplicated"));
                      await refresh();
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  {t("duplicate")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={busy === `publish:${item.id}`}
                  onClick={async () => {
                    setBusy(`publish:${item.id}`);
                    try {
                      toast.info(
                        (await templateApi.publishTemplate(item.id)).message,
                      );
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  {t("publish")}
                </Button>
                <Button
                  variant="dangerGhost"
                  size="sm"
                  iconOnly
                  aria-label={t("delete")}
                  title={t("delete")}
                  onClick={() => setPendingDelete(item)}
                >
                  <IoTrashOutline />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title={t("delete")}
        description={t("deleteConfirm")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        loading={busy === "delete"}
        tone="danger"
        icon={<FiAlertTriangle />}
      />
    </PageShell>
  );
}
