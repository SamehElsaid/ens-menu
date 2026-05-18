"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdSmartphone, MdTabletMac } from "react-icons/md";

const TAB_KEYS = [
  "createOrder",
  "receiveOrder",
  "editOrder",
  "acceptOrder",
  "createFromApp",
] as const;

const TAB_VIDEO_PATHS: readonly string[] = [
  "/app/order.mp4",
  "/app/recieveOrder.mp4",
  "/app/editOrder.mp4",
  "/app/acceptOrder.mp4",
  "/app/makeNewOrder.mp4",
];

const TAB_VIDEO_PATHS_TABLET: readonly string[] = [
  "/app/makeOrder-tablet.mp4",
  "/app/recieveOrder-tablet.mp4",
  "/app/editOrder-tablet.mp4",
  "/app/acceptOrder-tablet.mp4",
  "/app/makeOrderFromApp-tablet.mp4",
];

type DeviceShape = "phone" | "tablet";

function posterUrlForVideoSrc(videoSrc: string): string {
  return videoSrc.replace(/\.mp4$/i, ".jpg");
}

function PhoneFrameWithVideo({
  src,
  shape,
  onVideoEnd,
  onProgress,
}: {
  src: string;
  shape: DeviceShape;
  onVideoEnd: () => void;
  onProgress?: (progress: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const isTablet = shape === "tablet";
  const posterUrl = posterUrlForVideoSrc(src);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    onProgress?.(Math.min(1, el.currentTime / el.duration));
  }, [onProgress]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "180px", threshold: 0.01 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const p = el.play();
    if (p !== undefined) p.catch(() => {});
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return undefined;
    const el = videoRef.current;
    if (!el) return undefined;
    const run = () => tryPlay();
    el.addEventListener("loadeddata", run);
    el.addEventListener("canplay", run);
    return () => {
      el.removeEventListener("loadeddata", run);
      el.removeEventListener("canplay", run);
    };
  }, [src, tryPlay, shouldLoadVideo]);

  return (
    <div
      className={`relative mx-auto w-full overflow-hidden border-[10px] border-slate-800 bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(124,58,237,0.3)] ring-4 ring-slate-700/20 transition-all duration-500 ease-out sm:border-[12px] dark:border-slate-900 dark:bg-slate-950 ${
        isTablet
          ? "max-w-[440px] rounded-[32px] sm:rounded-[40px]"
          : "max-w-[340px] rounded-[40px] sm:rounded-[50px]"
      }`}
      style={{
        aspectRatio: isTablet ? "440 / 660" : "340 / 680",
      }}
    >
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden bg-black"
      >
        <video
          key={src}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-top"
          poster={posterUrl}
          src={shouldLoadVideo ? src : undefined}
          autoPlay={shouldLoadVideo}
          onEnded={onVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          controls={false}
          muted
          preload={shouldLoadVideo ? "metadata" : "none"}
        />
      </div>
    </div>
  );
}

export default function PhoneVideoSection() {
  const t = useTranslations("phoneVideoSection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [activeIdx, setActiveIdx] = useState(0);
  const [deviceShape, setDeviceShape] = useState<DeviceShape>("phone");
  const [effectiveSrc, setEffectiveSrc] = useState(TAB_VIDEO_PATHS[0]);
  const [progress, setProgress] = useState(0);

  const handleVideoEnd = () => {
    setActiveIdx((prev) => (prev + 1) % TAB_KEYS.length);
  };

  const handleSelectIdx = (idx: number) => {
    setProgress(0);
    setActiveIdx(idx);
  };

  useEffect(() => {
    const phone = TAB_VIDEO_PATHS[activeIdx] ?? TAB_VIDEO_PATHS[0];
    const tablet =
      TAB_VIDEO_PATHS_TABLET[activeIdx] ?? TAB_VIDEO_PATHS_TABLET[0];
    setEffectiveSrc(deviceShape === "tablet" ? tablet : phone);
    setProgress(0);
  }, [activeIdx, deviceShape]);

  return (
    <section
      id="phone-demo"
      className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#0f172a]"
      aria-labelledby="phone-demo-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent dark:from-purple-500/10" />

      <div className="container relative z-10 mx-auto px-6">
        <div className={`mb-16 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50 px-4 py-1.5 text-sm font-bold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300">
            {t("badge")}
          </div>
          <h2
            id="phone-demo-heading"
            className="mb-4 text-3xl font-extrabold text-slate-900 lg:text-5xl dark:text-white"
          >
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
              {t("title")}
            </span>
          </h2>
          <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg dark:text-slate-400">
            {t("description")}
          </p>
        </div>

        <div
          className={`flex flex-col items-center gap-12 lg:flex-row lg:items-start ${isRTL ? "lg:flex-row-reverse" : ""}`}
        >
          {/* Steps List */}
          <div
            className="flex w-full flex-col gap-4 lg:max-w-[400px] lg:shrink-0"
            role="tablist"
          >
            {TAB_KEYS.map((key, idx) => {
              const selected = idx === activeIdx;
              const stepNum = String(idx + 1).padStart(2, "0");

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleSelectIdx(idx)}
                  className={`group relative flex w-full gap-5 rounded-[2rem] border p-5 text-start transition-all duration-300 ${
                    selected
                      ? "border-purple-500/30 bg-white shadow-xl shadow-purple-500/10 dark:border-purple-400/20 dark:bg-slate-900"
                      : "border-transparent bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="relative flex shrink-0 items-start">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 ${
                        selected
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40 scale-110"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {stepNum}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span
                      className={`text-base font-bold ${
                        selected
                          ? "text-purple-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {t(`tabItems.${key}.title`)}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${
                        selected
                          ? "text-slate-600 dark:text-slate-300"
                          : "line-clamp-1 text-slate-500 dark:text-slate-500"
                      }`}
                    >
                      {t(`tabItems.${key}.description`)}
                    </span>

                    {/* Progress Line - Dynamic Animation */}
                    {selected && (
                      <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full bg-purple-500 transition-[width] duration-150 ease-linear"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {selected && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 -right-2 hidden lg:block`}
                    >
                      <div className="h-4 w-4 rotate-45 border-t border-r border-purple-500/20 bg-white dark:bg-slate-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative flex w-full flex-1 justify-center">
            <div
              id="phone-flow-panel"
              role="tabpanel"
              className={`relative w-full transition-all duration-500 ${
                deviceShape === "tablet" ? "max-w-[440px]" : "max-w-[340px]"
              }`}
            >
              <div className="absolute inset-0 -z-10 bg-purple-600/10 blur-[120px] dark:bg-purple-500/20" />

              <PhoneFrameWithVideo
                src={effectiveSrc}
                shape={deviceShape}
                onVideoEnd={handleVideoEnd}
                onProgress={setProgress}
              />

              <div className="mt-8 flex justify-center">
                <div className="inline-flex gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => setDeviceShape("phone")}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      deviceShape === "phone"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MdSmartphone className="size-6" />
                  </button>
                  <button
                    onClick={() => setDeviceShape("tablet")}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                      deviceShape === "tablet"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MdTabletMac className="size-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
