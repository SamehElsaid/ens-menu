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

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{t("viewCode")}</h2>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`ml-3 px-2 py-1 text-xs ${mode === "json" ? "bg-violet-600 text-white" : "text-slate-400"}`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`px-2 py-1 text-xs ${mode === "html" ? "bg-violet-600 text-white" : "text-slate-400"}`}
          >
            HTML
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(code)}
            className="text-xs text-slate-300"
          >
            {t("copy")}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-slate-400"
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
  const uiDark = useBuilderStore((s) => s.uiDark);
  const setUiDark = useBuilderStore((s) => s.setUiDark);
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
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden ${uiDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-700 bg-slate-950 px-3 text-slate-200">
        <Link
          href={`/${locale}/admin/template`}
          className="mr-2 text-xs text-slate-400 hover:text-white"
        >
          {t("backToList")}
        </Link>
        <span className="max-w-[200px] truncate text-sm font-semibold">
          {locale === "ar" && document.nameAr ? document.nameAr : document.name}
        </span>
        <span className="hidden text-[10px] text-slate-500 sm:inline">
          {t("fullControlHint")}
        </span>
        {dirty && (
          <span className="text-[10px] uppercase text-amber-400">
            {t("unsaved")}
          </span>
        )}
        <div className="flex-1" />
        <div className="flex overflow-hidden rounded-md border border-slate-700">
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setBreakpoint(bp)}
              className={`px-2.5 py-1 text-[11px] ${breakpoint === bp ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-400"}`}
            >
              {bpLabel(bp)}
            </button>
          ))}
        </div>
        <div
          className="flex overflow-hidden rounded-md border border-slate-700"
          title={t("previewLang")}
        >
          <button
            type="button"
            onClick={() => setPreviewLocale("en")}
            className={`px-2.5 py-1 text-[11px] font-semibold ${previewLocale === "en" ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-400"}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setPreviewLocale("ar")}
            className={`px-2.5 py-1 text-[11px] font-semibold ${previewLocale === "ar" ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-400"}`}
          >
            AR
          </button>
        </div>
        <button
          type="button"
          disabled={!past.length}
          onClick={undo}
          className="rounded border border-slate-700 px-2 py-1 text-xs disabled:opacity-30"
        >
          {t("undo")}
        </button>
        <button
          type="button"
          disabled={!future.length}
          onClick={redo}
          className="rounded border border-slate-700 px-2 py-1 text-xs disabled:opacity-30"
        >
          {t("redo")}
        </button>
        <button
          type="button"
          onClick={duplicateSelected}
          className="rounded border border-slate-700 px-2 py-1 text-xs"
        >
          {t("duplicate")}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-red-300"
        >
          {t("delete")}
        </button>
        <button
          type="button"
          onClick={() => setCodeModalOpen(true)}
          className="rounded border border-slate-700 px-2 py-1 text-xs"
        >
          {t("viewCode")}
        </button>
        <button
          type="button"
          onClick={() => setUiDark(!uiDark)}
          className="rounded border border-slate-700 px-2 py-1 text-xs"
        >
          {uiDark ? t("light") : t("dark")}
        </button>
        <button
          type="button"
          onClick={openSaveModal}
          disabled={saving}
          className="rounded bg-violet-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </header>

      <BuilderDndProvider>
        <div className="flex min-h-0 flex-1">
          <aside
            className={`flex w-64 shrink-0 flex-col border-r ${uiDark ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"}`}
          >
            <div className="flex border-b border-slate-700">
              <button
                type="button"
                onClick={() => setLeftTab("components")}
                className={`flex-1 py-2 text-[11px] uppercase ${leftTab === "components" ? "border-b-2 border-violet-500 text-violet-400" : "text-slate-500"}`}
              >
                {t("components")}
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("layers")}
                className={`flex-1 py-2 text-[11px] uppercase ${leftTab === "layers" ? "border-b-2 border-violet-500 text-violet-400" : "text-slate-500"}`}
              >
                {t("layers")}
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {leftTab === "components" ? <ComponentsPanel /> : <LayersPanel />}
            </div>
          </aside>
          <BuilderCanvas />
          <aside
            className={`w-80 shrink-0 border-l ${uiDark ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"}`}
          >
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
