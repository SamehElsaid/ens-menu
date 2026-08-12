"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiAlertTriangle } from "react-icons/fi";
import { templateApi } from "@/lib/template-builder/data/api";
import { useRouter } from "@/i18n/navigation";
import { useBuilderStore } from "@/components/TemplateBuilder/store/useBuilderStore";
import { TemplateBuilderShell } from "@/components/TemplateBuilder/TemplateBuilderShell";
import { Button, Spinner } from "@/components/ui";

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("templateBuilder");
  const id = String(params?.id ?? "");
  const loadDocument = useBuilderStore((s) => s.loadDocument);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = await templateApi.getTemplate(id);
      if (cancelled) return;
      if (!doc) {
        setError(true);
        return;
      }
      loadDocument(doc);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadDocument]);

  /* The dark ground here is DESIGN.md §14.3 — these two states sit inside the
     builder's own permanently dark shell rather than on the product's light
     surfaces. Every token below, `--app-bg` included, resolves to its dark value
     because the route layout scopes this subtree with `dark`. */
  if (error) {
    return (
      <div
        role="alert"
        className="flex h-screen flex-col items-center justify-center gap-3 bg-app px-6 text-center"
      >
        <span
          className="flex size-10 items-center justify-center rounded-full bg-danger-soft text-lg text-danger-fg"
          aria-hidden
        >
          <FiAlertTriangle />
        </span>
        <div>
          <p className="text-sm font-semibold text-danger-fg">
            {t("notFound")}
          </p>
          <p className="ui-label mt-1 text-fg-muted">{id}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/admin/template")}
        >
          {t("backToList")}
        </Button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen flex-col items-center justify-center gap-3 bg-app"
      >
        <Spinner size="lg" className="text-fg-muted" />
        <p className="ui-label text-fg-muted">{t("loading")}</p>
      </div>
    );
  }

  return <TemplateBuilderShell />;
}
