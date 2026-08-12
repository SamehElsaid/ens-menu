"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Skeleton, SkeletonRegion, Spinner } from "@/components/ui";

const MESSAGE_KEYS = [
  "processingMsg1",
  "processingMsg2",
  "processingMsg3",
] as const;

const SKELETON_ROWS = [0, 1, 2, 3];

interface ProcessingStepProps {
  previewUrl: string | null;
}

/**
 * The wait.
 *
 * A fake progress bar that pulsed at two fifths was claiming a number the
 * client does not have. What it can honestly show is elapsed time — a real
 * figure, set in the ticket face — and the shape of what is coming: the rows
 * below are the review ledger's own geometry, so the layout does not jump when
 * the parse lands and the wait explains itself without a percentage.
 */
export default function ProcessingStep({ previewUrl }: ProcessingStepProps) {
  const t = useTranslations("MenuImport");
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGE_KEYS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedSec((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Card padded="none" className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-line px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="ui-label mb-1">{t("stepProcessing")}</p>
          <h2 className="text-sm font-semibold tracking-[-0.02em] text-fg">
            {t("processingTitle")}
          </h2>
        </div>
        <p className="ui-figure shrink-0 text-[15px] leading-tight text-fg-muted">
          {t("saveProgressElapsed", { seconds: elapsedSec })}
        </p>
      </div>

      <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt=""
            className="size-12 shrink-0 rounded-sm border border-line bg-surface-2 object-cover"
          />
        ) : null}
        <div
          className="flex min-w-0 flex-1 items-center gap-2.5"
          role="status"
          aria-live="polite"
        >
          <Spinner size="sm" className="text-accent" />
          {/* Keyed so each message is a new element and fades in on arrival:
              three sentences hard-cutting into each other on a 2800ms timer
              reads as a glitch, and the fade is what makes the rotation look
              deliberate. `aria-hidden` because the same rotation announced
              every 2.8 seconds for the length of an AI parse is an interruption
              a screen-reader user cannot dismiss — the stable line below says
              the one thing they need instead. */}
          <p
            key={messageIndex}
            aria-hidden
            className="min-w-0 text-[13px] font-medium text-fg motion-safe:animate-[ui-fade-in_var(--dur-fast)_var(--ease-settle)]"
          >
            {t(MESSAGE_KEYS[messageIndex])}
          </p>
          <span className="sr-only">{t("processingTitle")}</span>
        </div>
      </div>

      <SkeletonRegion label={t("processingTitle")}>
        <ul className="divide-y divide-line border-t border-line">
          {SKELETON_ROWS.map((row) => (
            <li
              key={row}
              className="flex items-center gap-3 px-3 py-2.5 sm:px-4"
            >
              <Skeleton className="size-9 shrink-0" rounded="sm" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-2.5 w-1/3" rounded="sm" />
                <Skeleton className="h-2.5 w-1/2" rounded="sm" />
              </span>
              <Skeleton className="h-3 w-12 shrink-0" rounded="sm" />
            </li>
          ))}
        </ul>
      </SkeletonRegion>

      <p className="border-t border-line bg-surface-2/40 px-3 py-2 text-xs text-fg-muted sm:px-4">
        {t("processingHint")}
      </p>
    </Card>
  );
}
