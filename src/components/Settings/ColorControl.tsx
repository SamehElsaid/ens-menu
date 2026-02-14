'use client';

import { memo, useCallback, useEffect, useRef } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { ColorResult, Sketch } from "@uiw/react-color";



interface ColorControlProps {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  showColorPicker: string | null;
  setShowColorPicker: (value: string | null) => void;
  id: string;
}

function ColorControl({
  value,
  onChange,
  showColorPicker,
  setShowColorPicker,
  id,
}: ColorControlProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = `color-picker-${id.replace(/\s+/g, "-")}`;

  useEffect(() => {
    // فعّل الـ outside click بس للـ Tooltip المفتوح الحالي
    if (showColorPicker !== tooltipId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const wrapperNode = tooltipRef.current;
      const tooltipNode = document.getElementById(tooltipId);

      const path = (e.composedPath?.() ?? []) as EventTarget[];

      // لو الكلك جوه الزر/الـ wrapper أو جوه عنصر الـ Tooltip نفسه، ما نقفلش
      if (wrapperNode && (path.includes(wrapperNode) || (target && wrapperNode.contains(target)))) {
        return;
      }
      if (tooltipNode && (path.includes(tooltipNode) || (target && tooltipNode.contains(target)))) {
        return;
      }

      // كلك خارج الاثنين → نقفل
      setShowColorPicker(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker, setShowColorPicker, tooltipId]);

  const toHex = useCallback((color: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return color;

    ctx.fillStyle = color;
    const computed = ctx.fillStyle;
    ctx.fillStyle = computed;

    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const r = data[0].toString(16).padStart(2, "0");
    const g = data[1].toString(16).padStart(2, "0");
    const b = data[2].toString(16).padStart(2, "0");
    const a = data[3] < 255 ? (data[3] / 255).toFixed(2) : null;

    return a
      ? `#${r}${g}${b}${Math.round(parseFloat(a) * 255)
        .toString(16)
        .padStart(2, "0")}`
      : `#${r}${g}${b}`;
  }, []);

  return (
    <div ref={tooltipRef}>
      <Tooltip
        isOpen={showColorPicker === tooltipId}
        id={tooltipId}
        clickable
        style={{ zIndex: 999999999 }}
        className="p-0! bg-transparent!"
      >
        {showColorPicker === tooltipId && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-3">
            <Sketch
              color={toHex(value)}
              onChange={(color: ColorResult) => {
                onChange({ target: { value: color.hex } });
              }}
            />
          </div>
        )}
      </Tooltip>
    </div>
  );
}

export default memo(ColorControl);

