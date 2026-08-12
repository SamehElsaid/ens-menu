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
  const previewLocale = useBuilderStore((s) => s.previewLocale);

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root-drop",
    data: { nodeId: document?.root.id, from: "canvas" },
  });

  if (!document) return null;
  const frame = PREVIEW[breakpoint];

  /* The gutter takes the page ground rather than the panel surface, so the
     artboard is the brightest thing between the two rails (§14.3). */
  return (
    <div
      className="flex-1 overflow-auto bg-app p-4 md:p-6"
      onClick={() => select(document.root.id)}
    >
      <div
        ref={setNodeRef}
        className={`mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white min-h-[70vh] transition-all ${
          isOver ? "ring-2 ring-accent" : ""
        }`}
        style={{
          width: frame.width,
          maxWidth: frame.maxWidth,
          direction: previewLocale === "ar" ? "rtl" : "ltr",
          /* The frame is a picture of the customer's bright menu (§14.1), so it
             opts out of the builder's dark scheme for native controls. */
          colorScheme: "light",
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
