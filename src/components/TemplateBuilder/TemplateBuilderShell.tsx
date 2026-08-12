"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useBuilderStore } from "./store/useBuilderStore";
import { BuilderCanvas } from "./canvas/BuilderCanvas";
import { BuilderDndProvider } from "./canvas/BuilderDndProvider";
import { ComponentsPanel } from "./panels/ComponentsPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { SaveTemplateModal } from "./SaveTemplateModal";
import type { Breakpoint } from "@/lib/template-builder/schema";
import {
  exportDocumentJson,
  exportDocumentToHtml,
} from "@/lib/template-builder/export/html";
import { focusRing, focusRingInset, settle } from "@/components/ui";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

/* No text colour of its own: the header sets it, so the one destructive
   button can tint itself without two colour utilities racing. */
const toolButton = `rounded-md border border-line px-2 py-1 text-xs ${settle} ${focusRing} hover:bg-surface-2`;

/* Flush against the group's clipped edge, so the ring is drawn inside the
   control rather than under the container's `overflow-hidden`. */
const segmentButton = (active: boolean) =>
  `px-2.5 py-1 text-[11px] ${settle} ${focusRingInset} ${
    active
      ? "bg-accent text-on-accent"
      : "bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg"
  }`;

const panelTab = (active: boolean) =>
  `flex-1 border-b-2 py-2 text-xs ${settle} ${focusRingInset} ${
    active
      ? "border-accent font-semibold text-accent"
      : "border-transparent text-fg-subtle hover:bg-surface-2 hover:text-fg-muted"
  }`;

function CodeModal() {
  const t = useTranslations("templateBuilder");
  const open = useBuilderStore((s) => s.codeModalOpen);
  const setOpen = useBuilderStore((s) => s.setCodeModalOpen);
  const document = useBuilderStore((s) => s.document);
  const breakpoint = useBuilderStore((s) => s.breakpoint);
  const [mode, setMode] = useState<"json" | "html">("json");
  const code = useMemo(() => {
    if (!document) return "";
    return mode === "json"
      ? exportDocumentJson(document)
      : exportDocumentToHtml(document, breakpoint);
  }, [document, mode, breakpoint]);
  if (!open || !document) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-fg">{t("viewCode")}</h2>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`ms-3 rounded-md px-2 py-1 text-xs ${settle} ${focusRing} ${mode === "json" ? "bg-accent text-on-accent" : "text-fg-muted hover:bg-surface-2 hover:text-fg"}`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`rounded-md px-2 py-1 text-xs ${settle} ${focusRing} ${mode === "html" ? "bg-accent text-on-accent" : "text-fg-muted hover:bg-surface-2 hover:text-fg"}`}
          >
            HTML
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(code)}
            className={`rounded-md px-2 py-1 text-xs text-fg-muted ${settle} ${focusRing} hover:bg-surface-2 hover:text-fg`}
          >
            {t("copy")}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`rounded-md px-2 py-1 text-xs text-fg-muted ${settle} ${focusRing} hover:bg-surface-2 hover:text-fg`}
          >
            {t("close")}
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Monaco
            height="100%"
            language={mode === "json" ? "json" : "html"}
            theme="vs-dark"
            value={code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function TemplateBuilderShell() {
  const locale = useLocale();
  const t = useTranslations("templateBuilder");
  const document = useBuilderStore((s) => s.document);
  const dirty = useBuilderStore((s) => s.dirty);
  const saving = useBuilderStore((s) => s.saving);
  const breakpoint = useBuilderStore((s) => s.breakpoint);
  const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);
  const leftTab = useBuilderStore((s) => s.leftTab);
  const setLeftTab = useBuilderStore((s) => s.setLeftTab);
  const previewLocale = useBuilderStore((s) => s.previewLocale);
  const setPreviewLocale = useBuilderStore((s) => s.setPreviewLocale);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const save = useBuilderStore((s) => s.save);
  const past = useBuilderStore((s) => s.past);
  const future = useBuilderStore((s) => s.future);
  const setCodeModalOpen = useBuilderStore((s) => s.setCodeModalOpen);
  const deleteSelected = useBuilderStore((s) => s.deleteSelected);
  const duplicateSelected = useBuilderStore((s) => s.duplicateSelected);
  const copySelected = useBuilderStore((s) => s.copySelected);
  const pasteIntoSelected = useBuilderStore((s) => s.pasteIntoSelected);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  useEffect(() => {
    setPreviewLocale(locale === "ar" ? "ar" : "en");
  }, [locale, setPreviewLocale]);

  const bpLabel = (bp: Breakpoint) =>
    bp === "desktop"
      ? t("desktop")
      : bp === "tablet"
        ? t("tablet")
        : t("mobile");

  const openSaveModal = useCallback(() => {
    setSaveModalOpen(true);
  }, []);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        Boolean(target?.isContentEditable) ||
        Boolean(target?.closest?.(".monaco-editor, .monaco-mouse-cursor-text"));

      // While typing in any editor, never steal keys (except Ctrl/Cmd+S)
      if (editing) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          openSaveModal();
        }
        return;
      }

      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        openSaveModal();
        return;
      }
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        meta &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
        return;
      }
      if (meta && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelected();
      }
      if (meta && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteIntoSelected();
      }
      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
    },
    [
      openSaveModal,
      undo,
      redo,
      copySelected,
      pasteIntoSelected,
      duplicateSelected,
      deleteSelected,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    if (!dirty || !document) return;
    const timer = window.setTimeout(() => void save(), 1500);
    return () => window.clearTimeout(timer);
  }, [dirty, document, save]);

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center bg-app text-fg-muted">
        {t("loading")}
      </div>
    );
  }

  /* No light/dark switch on the chrome: the route's layout pins this subtree to
     the dark token scope (DESIGN.md §14.3), so both halves of the old toggle
     now resolve to the same surfaces. The tool stays dark and the artboard
     stays the bright object on the screen. */
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app text-fg">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-app px-3 text-fg">
        <Link
          href={`/${locale}/admin/template`}
          className={`me-2 rounded-md text-xs text-fg-muted ${settle} ${focusRing} hover:text-fg`}
        >
          {t("backToList")}
        </Link>
        <span className="max-w-[200px] truncate text-sm font-semibold">
          {locale === "ar" && document.nameAr ? document.nameAr : document.name}
        </span>
        <span className="hidden text-[10px] text-fg-subtle sm:inline">
          {t("fullControlHint")}
        </span>
        {dirty && (
          <span className="rounded-md border border-warning-line bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning-fg">
            {t("unsaved")}
          </span>
        )}
        <div className="flex-1" />
        <div className="flex overflow-hidden rounded-md border border-line">
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setBreakpoint(bp)}
              className={segmentButton(breakpoint === bp)}
            >
              {bpLabel(bp)}
            </button>
          ))}
        </div>
        <div
          className="flex overflow-hidden rounded-md border border-line"
          title={t("previewLang")}
        >
          <button
            type="button"
            onClick={() => setPreviewLocale("en")}
            className={`${segmentButton(previewLocale === "en")} font-semibold`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setPreviewLocale("ar")}
            className={`${segmentButton(previewLocale === "ar")} font-semibold`}
          >
            AR
          </button>
        </div>
        <button
          type="button"
          disabled={!past.length}
          onClick={undo}
          className={`${toolButton} disabled:opacity-30`}
        >
          {t("undo")}
        </button>
        <button
          type="button"
          disabled={!future.length}
          onClick={redo}
          className={`${toolButton} disabled:opacity-30`}
        >
          {t("redo")}
        </button>
        <button type="button" onClick={duplicateSelected} className={toolButton}>
          {t("duplicate")}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          className={`${toolButton} text-danger-fg`}
        >
          {t("delete")}
        </button>
        <button
          type="button"
          onClick={() => setCodeModalOpen(true)}
          className={toolButton}
        >
          {t("viewCode")}
        </button>
        <button
          type="button"
          onClick={openSaveModal}
          disabled={saving}
          className={`rounded-md bg-accent px-3 py-1 text-xs font-medium text-on-accent ${settle} ${focusRing} hover:bg-accent-strong disabled:opacity-50`}
        >
          {saving ? t("saving") : t("save")}
        </button>
      </header>

      <BuilderDndProvider>
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-64 shrink-0 flex-col border-e border-line bg-surface">
            <div className="flex border-b border-line">
              <button
                type="button"
                onClick={() => setLeftTab("components")}
                className={panelTab(leftTab === "components")}
              >
                {t("components")}
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("layers")}
                className={panelTab(leftTab === "layers")}
              >
                {t("layers")}
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {leftTab === "components" ? <ComponentsPanel /> : <LayersPanel />}
            </div>
          </aside>
          <BuilderCanvas />
          <aside className="w-80 shrink-0 border-s border-line bg-surface">
            <PropertiesPanel />
          </aside>
        </div>
      </BuilderDndProvider>
      <CodeModal />
      <SaveTemplateModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
}
