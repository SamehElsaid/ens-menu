"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiPlay, FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";
import { ENSMENU_DEMO_VIDEO_EMBED_URL } from "@/lib/marketingLinks";

type DemoVideoModalLayerProps = {
  open: boolean;
  onClose: () => void;
};

function DemoVideoModalLayer({ open, onClose }: DemoVideoModalLayerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const embedSrc = `${ENSMENU_DEMO_VIDEO_EMBED_URL}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return createPortal(
    <div
      className={cn(
        "demo-video-modal fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 sm:p-6",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Demo video"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/78 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close video"
      />

      <div
        className={cn(
          "demo-video-modal__panel relative z-[1] w-[95%] max-w-[min(420px,95vw)] transition-all duration-300 ease-out sm:w-[min(70%,420px)]",
          visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65),0_0_60px_-12px_rgba(124,58,237,0.35)]">
          <div className="relative aspect-[9/16] w-full bg-black">
            <iframe
              src={embedSrc}
              title="ENSmenu demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 end-0 flex size-10 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800 sm:-top-4 sm:size-11"
          aria-label="Close video"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

type DemoVideoTriggerProps = {
  variant: "hero" | "cta";
  children: React.ReactNode;
  className?: string;
};

const VARIANT_CLASS = {
  hero: cn(ds.btn.base, ds.btn.secondary),
  cta: "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-purple-400/40 hover:bg-white/10",
} as const;

export function DemoVideoTrigger({
  variant,
  children,
  className,
}: DemoVideoTriggerProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(VARIANT_CLASS[variant], className)}
      >
        <FiPlay size={variant === "hero" ? 14 : 15} aria-hidden />
        {children}
      </button>
      <DemoVideoModalLayer open={open} onClose={close} />
    </>
  );
}
