"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui";

const MESSAGE_KEYS = [
  "processingMsg1",
  "processingMsg2",
  "processingMsg3",
] as const;

interface ProcessingStepProps {
  previewUrl: string | null;
}

export default function ProcessingStep({ previewUrl }: ProcessingStepProps) {
  const t = useTranslations("MenuImport");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGE_KEYS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-8 py-10">
      <div
        className="mx-auto max-w-md text-center"
        role="status"
        aria-live="polite"
      >
        <Spinner size="xl" className="mx-auto mb-5 text-brand" />

        <h2 className="text-lg font-semibold tracking-[-0.011em] text-fg">
          {t("processingTitle")}
        </h2>
        <p className="mt-2 min-h-[1.35rem] text-[13px] font-medium text-brand">
          {t(MESSAGE_KEYS[messageIndex])}
        </p>
        <p className="mt-2 text-xs text-fg-subtle">{t("processingHint")}</p>
      </div>

      {previewUrl && (
        <div className="mx-auto max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="w-full rounded-xl border border-line opacity-70"
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-xs" aria-hidden>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-2/5 rounded-full bg-brand motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}
