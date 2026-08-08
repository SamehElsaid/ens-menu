"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { templateApi } from "@/lib/template-builder/data/api";
import { useBuilderStore } from "@/components/TemplateBuilder/store/useBuilderStore";
import { TemplateBuilderShell } from "@/components/TemplateBuilder/TemplateBuilderShell";

export default function TemplateEditorPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const loadDocument = useBuilderStore((s) => s.loadDocument);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = await templateApi.getTemplate(id);
      if (cancelled) return;
      if (!doc) {
        setError("Template not found");
        return;
      }
      loadDocument(doc);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadDocument]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-red-400">
        {error}
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-fg-subtle">
        Loading…
      </div>
    );
  }
  return <TemplateBuilderShell />;
}
