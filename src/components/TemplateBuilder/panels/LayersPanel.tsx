"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderNode } from "@/lib/template-builder/schema";
import { getComponentDef } from "@/lib/template-builder/library/registry";
import { useBuilderStore } from "../store/useBuilderStore";
import { useComponentLabel } from "../i18n";

function Row({
  node,
  parentId,
  index,
  depth,
  labelOf,
}: {
  node: BuilderNode;
  parentId: string;
  index: number;
  depth: number;
  labelOf: (type: string, fallback?: string) => string;
}) {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const select = useBuilderStore((s) => s.select);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: { from: "layer", parentId, index, nodeId: node.id },
  });

  return (
    <>
      <button
        ref={setNodeRef}
        type="button"
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.45 : 1,
          paddingLeft: 8 + depth * 12,
        }}
        {...attributes}
        {...listeners}
        onClick={() => select(node.id)}
        className={`mb-0.5 w-full truncate rounded px-2 py-1.5 text-left text-xs ${
          selectedId === node.id
            ? "bg-violet-600 text-white"
            : "text-slate-300 hover:bg-slate-700/60"
        }`}
      >
        <span className="mr-1 opacity-50">
          {getComponentDef(node.type)?.icon ?? "•"}
        </span>
        {node.name || labelOf(node.type, getComponentDef(node.type)?.label)}
      </button>
      {!!node.children?.length && (
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child, i) => (
            <Row
              key={child.id}
              node={child}
              parentId={node.id}
              index={i}
              depth={depth + 1}
              labelOf={labelOf}
            />
          ))}
        </SortableContext>
      )}
    </>
  );
}

export function LayersPanel() {
  const document = useBuilderStore((s) => s.document);
  const select = useBuilderStore((s) => s.select);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const labelOf = useComponentLabel();
  if (!document) return null;
  const root = document.root;

  return (
    <div className="h-full overflow-y-auto p-2">
      <button
        type="button"
        onClick={() => select(root.id)}
        className={`mb-0.5 w-full truncate rounded px-2 py-1.5 text-left text-xs ${
          selectedId === root.id
            ? "bg-violet-600 text-white"
            : "text-slate-300 hover:bg-slate-700/60"
        }`}
      >
        ⬚ {root.name || labelOf(root.type, "Page")}
      </button>
      <SortableContext
        items={(root.children ?? []).map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {(root.children ?? []).map((child, i) => (
          <Row
            key={child.id}
            node={child}
            parentId={root.id}
            index={i}
            depth={1}
            labelOf={labelOf}
          />
        ))}
      </SortableContext>
    </div>
  );
}
