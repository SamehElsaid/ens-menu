"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import QRCodeStyling from "qr-code-styling";
import { getStyledQrOptions } from "@/lib/styledQr";

export type StyledQrCodeHandle = {
  download: (filename: string) => Promise<void>;
};

type Props = {
  value: string;
  size: number;
  className?: string;
  displaySize?: number;
};

export const StyledQrCode = forwardRef<StyledQrCodeHandle, Props>(
  function StyledQrCode({ value, size, className, displaySize }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<QRCodeStyling | null>(null);

    useImperativeHandle(ref, () => ({
      download: async (filename: string) => {
        const qr = instanceRef.current;
        if (!qr) return;
        const base = filename.replace(/\.(png|jpeg|jpg|webp|svg)$/i, "");
        await qr.download({ name: base, extension: "png" });
      },
    }));

    useEffect(() => {
      const el = containerRef.current;
      if (!el || !value) return;

      el.innerHTML = "";
      const qr = new QRCodeStyling(getStyledQrOptions({ value, size }));
      instanceRef.current = qr;
      qr.append(el);
      return () => {
        instanceRef.current = null;
        el.innerHTML = "";
      };
    }, [value, size]);

    const dw = displaySize ?? size;
    const dh = displaySize ?? size;
    const scale = size > 0 ? dw / size : 1;

    return (
      <div
        className={className}
        style={{
          width: dw,
          height: dh,
          position: "relative",
          overflow: "hidden",
          lineHeight: 0,
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    );
  },
);

export async function downloadStyledQrPng(params: {
  value: string;
  filename: string;
  size?: number;
}): Promise<void> {
  const size = params.size ?? 640;
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${size}px;height:${size}px;overflow:hidden`;

  document.body.appendChild(container);
  try {
    const qr = new QRCodeStyling(
      getStyledQrOptions({
        value: params.value,
        size,
      }),
    );
    qr.append(container);
    const base = params.filename.replace(/\.(png|jpeg|jpg|webp)$/i, "");
    await qr.download({ name: base, extension: "png" });
  } finally {
    document.body.removeChild(container);
  }
}
