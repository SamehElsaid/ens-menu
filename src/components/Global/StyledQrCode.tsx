"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { resolveMenuItemImageSrc } from "@/components/menuItemImage";
import { getStyledQrOptions, DEFAULT_QR_CENTER_LOGO } from "@/lib/styledQr";

export type StyledQrCodeHandle = {
  download: (filename: string) => Promise<void>;
};

type Props = {
  value: string;
  size: number;
  className?: string;
  displaySize?: number;
  centerLogoSrc?: string | null;
};

async function resolveQrCenterLogo(
  centerLogoSrc: string | null | undefined,
): Promise<string> {
  const candidate = centerLogoSrc?.trim()
    ? resolveMenuItemImageSrc(centerLogoSrc)
    : DEFAULT_QR_CENTER_LOGO;

  if (
    candidate === DEFAULT_QR_CENTER_LOGO ||
    candidate.startsWith("/") ||
    candidate.startsWith("data:")
  ) {
    return candidate;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("center-logo-unavailable"));
      img.src = candidate;
    });
    return candidate;
  } catch {
    return DEFAULT_QR_CENTER_LOGO;
  }
}

export const StyledQrCode = forwardRef<StyledQrCodeHandle, Props>(
  function StyledQrCode(
    { value, size, className, displaySize, centerLogoSrc },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<InstanceType<
      Awaited<typeof import("qr-code-styling")>["default"]
    > | null>(null);

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

      let cancelled = false;

      void (async () => {
        const { default: QRCodeStyling } = await import("qr-code-styling");
        if (cancelled || !containerRef.current) return;

        const safeCenterLogo = await resolveQrCenterLogo(centerLogoSrc);
        if (cancelled || !containerRef.current) return;

        el.innerHTML = "";
        const qr = new QRCodeStyling(
          getStyledQrOptions({ value, size, centerLogoSrc: safeCenterLogo }),
        );
        instanceRef.current = qr;
        qr.append(el);
      })();

      return () => {
        cancelled = true;
        instanceRef.current = null;
        el.innerHTML = "";
      };
    }, [value, size, centerLogoSrc]);

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
  centerLogoSrc?: string | null;
}): Promise<void> {
  const size = params.size ?? 640;
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${size}px;height:${size}px;overflow:hidden`;

  document.body.appendChild(container);
  try {
    const safeCenterLogo = await resolveQrCenterLogo(params.centerLogoSrc);
    const { default: QRCodeStyling } = await import("qr-code-styling");
    const qr = new QRCodeStyling(
      getStyledQrOptions({
        value: params.value,
        size,
        centerLogoSrc: safeCenterLogo,
      }),
    );
    qr.append(container);
    const base = params.filename.replace(/\.(png|jpeg|jpg|webp)$/i, "");
    await qr.download({ name: base, extension: "png" });
  } finally {
    document.body.removeChild(container);
  }
}
