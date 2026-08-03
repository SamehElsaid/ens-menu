"use client";

import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "../store/useBuilderStore";
import { BuilderNodeView } from "../render/BuilderNodeView";

const PREVIEW = {
  desktop: { width: "100%", maxWidth: 1200 },
  tablet: { width: 768, maxWidth: 768 },
  mobile: { width: 390, maxWidth: 390 },
} as const;

export function BuilderCanvas() {
  const document = useBuilderStore((s) => s.document);
  const breakpoint = useBuilderStore((s) => s.breakpoint);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const select = useBuilderStore((s) => s.select);
  const uiDark = useBuilderStore((s) => s.uiDark);
  const previewLocale = useBuilderStore((s) => s.previewLocale);

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root-drop",
    data: { nodeId: document?.root.id, from: "canvas" },
  });

  if (!document) return null;
  const frame = PREVIEW[breakpoint];

  return (
    <div
      className={`flex-1 overflow-auto p-4 md:p-6 ${uiDark ? "bg-slate-900" : "bg-slate-200"}`}
      onClick={() => select(document.root.id)}
    >
      <div
        ref={setNodeRef}
        className={`mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white min-h-[70vh] transition-all ${
          isOver ? "ring-2 ring-violet-500" : ""
        }`}
        style={{
          width: frame.width,
          maxWidth: frame.maxWidth,
          direction: previewLocale === "ar" ? "rtl" : "ltr",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <BuilderNodeView
          node={document.root}
          ctx={{
            doc: document,
            breakpoint,
            selectedId,
            onSelect: select,
            interactive: true,
            locale: previewLocale,
          }}
        />
      </div>
    </div>
  );
}
