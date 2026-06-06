"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IoSparklesOutline } from "react-icons/io5";

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
    <div className="space-y-8 py-10">
      <div className="text-center max-w-md mx-auto">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <IoSparklesOutline className="text-2xl text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("processingTitle")}
        </h2>
        <p className="text-primary font-medium text-sm min-h-[1.35rem] transition-opacity">
          {t(MESSAGE_KEYS[messageIndex])}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
          {t("processingHint")}
        </p>
      </div>

      {previewUrl && (
        <div className="max-w-xs mx-auto relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="w-full rounded-2xl border-2 border-primary/20 shadow-lg opacity-70"
          />
        </div>
      )}

      <div className="max-w-xs mx-auto">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full w-2/5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
