"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import {
  COMPONENT_REGISTRY,
  type ComponentCategory,
} from "@/lib/template-builder/library/registry";
import { useBuilderStore } from "../store/useBuilderStore";
import { useComponentLabel } from "../i18n";

function Item({
  type,
  label,
  icon,
  onAdd,
}: {
  type: string;
  label: string;
  icon: string;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { from: "palette", type },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onDoubleClick={onAdd}
      className={`flex w-full items-center gap-2 rounded-md border border-slate-700/80 bg-slate-800/80 px-2.5 py-2 text-left text-xs text-slate-200 hover:border-violet-500 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span className="w-6 text-center opacity-70">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function ComponentsPanel() {
  const t = useTranslations("templateBuilder");
  const labelOf = useComponentLabel();
  const addNode = useBuilderStore((s) => s.addNode);
  const [cat, setCat] = useState<ComponentCategory | "all">("all");
  const items = COMPONENT_REGISTRY.filter(
    (c) => cat === "all" || c.category === cat,
  );

  const cats: { id: ComponentCategory | "all"; label: string }[] = [
    { id: "all", label: t("all") },
    { id: "layout", label: t("layout") },
    { id: "menu", label: t("menu") },
    { id: "content", label: t("content") },
    { id: "media", label: t("media") },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1 border-b border-slate-700 p-2">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`rounded px-2 py-0.5 text-[10px] uppercase ${
              cat === c.id
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {items.map((c) => (
          <Item
            key={c.type}
            type={c.type}
            label={labelOf(c.type, c.label)}
            icon={c.icon}
            onAdd={() => addNode(c.type)}
          />
        ))}
      </div>
      <p className="border-t border-slate-700 p-2 text-[10px] text-slate-500">
        {t("dragHint")}
      </p>
    </div>
  );
}
