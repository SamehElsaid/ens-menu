"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BsQrCode } from "react-icons/bs";
import ExperienceScene from "../ExperienceScene";

const StyledQrCode = dynamic(
  () =>
    import("@/components/Global/StyledQrCode").then((mod) => mod.StyledQrCode),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 w-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
    ),
  },
);

export default function ScanScene() {
  const t = useTranslations("experienceHome");
  const [qrValue, setQrValue] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setQrValue(`${window.location.origin}/#menu`);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setScanning((s) => !s), 2800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <ExperienceScene
      index={1}
      height="compact"
      className="items-center justify-center bg-slate-950"
    >
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-purple-400/80">
          {t("restaurantName")}
        </p>
        <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          {t("scanTitle")}
        </h2>
        <p className="mb-10 max-w-xs text-sm text-slate-400">
          {t("scanSubtitle")}
        </p>

        <div className="relative flex aspect-square w-[min(72vw,280px)] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-4">
          {scanning ? (
            <>
              <BsQrCode className="text-white/30" size={120} />
              <div className="animate-hero-qr-scan pointer-events-none absolute inset-x-6 top-0 z-10 h-0.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              <p className="absolute bottom-4 text-xs font-medium text-purple-300">
                {t("scanning")}
              </p>
            </>
          ) : (
            <div className="rounded-2xl bg-white p-3">
              {qrValue ? (
                <StyledQrCode
                  value={qrValue}
                  size={200}
                  displaySize={140}
                  className="rounded-xl"
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </ExperienceScene>
  );
}
