"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IoCheckmarkSharp } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Modal, Spinner } from "@/components/ui";

interface SaveProgressOverlayProps {
  visible: boolean;
}

const PHASE_INTERVAL_MS = 3500;

/**
 * Saving, as a ticket being worked through.
 *
 * The phases used to be three dashes that grew and shrank, which says something
 * is happening but never what. They are now the numbered lines of the job:
 * finished lines carry a checkmark, the live one carries the spinner, and the
 * elapsed count is a figure — so a save that takes forty seconds can be read
 * rather than merely endured.
 */
export default function SaveProgressOverlay({
  visible,
}: SaveProgressOverlayProps) {
  /* Mounted on demand rather than hidden while alive. Both pieces of state here
     — the phase and the elapsed count — have to start at zero for every save,
     and mount is where "fresh" is free; resetting them from an effect on the way
     down cost a cascading render and was the one lint error in the wizard. */
  if (!visible) return null;
  return <SaveProgressPanel />;
}

function SaveProgressPanel() {
  const t = useTranslations("MenuImport");
  const [phase, setPhase] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const phases = [
    t("saveProgressFetching"),
    t("saveProgressCategories"),
    t("saveProgressItems"),
  ];

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, PHASE_INTERVAL_MS);

    const elapsedTimer = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(elapsedTimer);
    };
  }, [phases.length]);

  return (
    // Saving is in flight, so the dialog refuses Escape and backdrop dismissal.
    <Modal
      open
      onClose={() => {}}
      dismissible={false}
      showClose={false}
      size="xs"
    >
      <div role="status" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <Spinner size="md" className="text-accent" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-fg">
            {t("saving")}
          </p>
          <p className="ui-figure shrink-0 text-[13px] text-fg-muted">
            {t("saveProgressElapsed", { seconds: elapsedSec })}
          </p>
        </div>

        <ul className="mt-3 divide-y divide-line border-y border-line">
          {phases.map((label, index) => {
            const isDone = index < phase;
            const isCurrent = index === phase;

            return (
              <li key={label} className="flex items-center gap-2.5 py-2">
                <span className="ui-figure w-5 shrink-0 text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* The marker resolves rather than swaps: the spinner fades out
                    under the checkmark fading in, so a completed phase looks
                    finished instead of replaced. The spinner is only rendered
                    for the live and the just-finished row — three of them
                    turning behind `opacity: 0` would be three animations
                    nobody can see. */}
                <span className="ui-swap size-4 shrink-0" aria-hidden>
                  {isDone || isCurrent ? (
                    <Spinner
                      size="xs"
                      className={cn("text-accent", isDone && "opacity-0")}
                    />
                  ) : null}
                  <IoCheckmarkSharp
                    className={cn(
                      "size-3.5 text-fg",
                      isDone ? "opacity-100" : "opacity-0",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[13px] transition-colors duration-(--dur-settle) ease-(--ease-settle)",
                    isCurrent
                      ? "font-semibold text-fg"
                      : isDone
                        ? "text-fg-muted"
                        : "text-fg-subtle",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
