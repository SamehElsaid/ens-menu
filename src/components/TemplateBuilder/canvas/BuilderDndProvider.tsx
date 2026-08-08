"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useBuilderStore } from "../store/useBuilderStore";
import { getComponentDef } from "@/lib/template-builder/library/registry";

export function BuilderDndProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const document = useBuilderStore((s) => s.document);
  const addNode = useBuilderStore((s) => s.addNode);
  const reorderInParent = useBuilderStore((s) => s.reorderInParent);
  const [activeType, setActiveType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.from === "palette") {
      setActiveType(String(e.active.data.current.type));
    } else setActiveType(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveType(null);
    const { active, over } = e;
    if (!over || !document) return;
    const a = active.data.current;
    const o = over.data.current;

    if (a?.from === "palette" && typeof a.type === "string") {
      addNode(a.type, (o?.nodeId as string) || document.root.id);
      return;
    }
    if (
      a?.from === "layer" &&
      o?.from === "layer" &&
      a.parentId &&
      a.parentId === o.parentId &&
      typeof a.index === "number" &&
      typeof o.index === "number" &&
      active.id !== over.id
    ) {
      reorderInParent(a.parentId, a.index, o.index);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay>
        {activeType ? (
          <div className="rounded-md bg-violet-600 text-white px-3 py-2 text-sm shadow-lg">
            {getComponentDef(activeType)?.label ?? activeType}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
