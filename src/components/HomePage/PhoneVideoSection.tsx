"use client";

import { useTranslations, useLocale } from "next-intl";
import { memo, useEffect, useMemo, useRef, useState } from "react";
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

const PhoneFrameWithVideo = memo(function PhoneFrameWithVideo({
  src,
  shape,
  playing,
}: {
  src: string | undefined;
  shape: DeviceShape;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevSrcRef = useRef<string | undefined>(undefined);
  const isTablet = shape === "tablet";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!src) {
      prevSrcRef.current = undefined;
      el.pause();
      return;
    }

    if (!playing) {
      el.pause();
      return;
    }

    const srcChanged = prevSrcRef.current !== src;
    prevSrcRef.current = src;

    const kickPlay = () => {
      el.muted = true;
      void el.play().catch(() => {});
    };

    const waitThenPlay = () => {
      el.addEventListener("canplay", kickPlay, { once: true });
      el.addEventListener("loadeddata", kickPlay, { once: true });
    };

    if (srcChanged) {
      el.load();
      waitThenPlay();
    } else if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      kickPlay();
    } else {
      waitThenPlay();
    }

    return () => {
      el.removeEventListener("canplay", kickPlay);
      el.removeEventListener("loadeddata", kickPlay);
    };
  }, [src, playing]);

  const preload = !src ? "none" : playing ? "auto" : "metadata";

  return (
    <div
      className={`relative mx-auto w-full overflow-hidden border-12 border-slate-800 bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(124,58,237,0.3)] transition-[max-width,border-radius,height] duration-300 ease-out dark:border-slate-900 dark:bg-slate-950 ${
        isTablet
          ? "max-w-[440px] rounded-[40px]"
          : "max-w-[340px] rounded-[50px]"
      }`}
      style={
        isTablet
          ? { height: "660px", minHeight: "660px", aspectRatio: "440/660" }
          : { height: "680px", minHeight: "680px", aspectRatio: "340/680" }
      }
    >
      <div className="relative h-full w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-top"
          src={src || undefined}
          autoPlay={playing}
          loop
          muted
          playsInline
          controls={false}
          preload={preload}
          disablePictureInPicture
          disableRemotePlayback
          // iOS Safari inline playback (legacy WebKit)
          {...({ "webkit-playsinline": "true" } as Record<string, string>)}
        />
      </div>
    </div>
  );
});

export default function PhoneVideoSection() {
  const t = useTranslations("phoneVideoSection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [activeIdx, setActiveIdx] = useState(0);
  const [deviceShape, setDeviceShape] = useState<DeviceShape>("phone");
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const videoSrc = useMemo(() => {
    const phone = TAB_VIDEO_PATHS[activeIdx] ?? TAB_VIDEO_PATHS[0];
    const tablet =
      TAB_VIDEO_PATHS_TABLET[activeIdx] ?? TAB_VIDEO_PATHS_TABLET[0];
    return deviceShape === "tablet" ? tablet : phone;
  }, [activeIdx, deviceShape]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMediaAllowed(true);
      setIsIntersecting(true);
      return;
    }
    let hideDelay: ReturnType<typeof setTimeout> | undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          if (hideDelay) clearTimeout(hideDelay);
          hideDelay = undefined;
          setIsIntersecting(true);
          setMediaAllowed(true);
        } else {
          if (hideDelay) clearTimeout(hideDelay);
          hideDelay = setTimeout(() => {
            hideDelay = undefined;
            setIsIntersecting(false);
          }, 550);
        }
      },
      { root: null, rootMargin: "180px 0px 240px 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => {
      if (hideDelay) clearTimeout(hideDelay);
      obs.disconnect();
    };
  }, []);

  const resolvedSrc = mediaAllowed ? videoSrc : undefined;
  const videoPlaying = mediaAllowed && isIntersecting;

  return (
    <section
      ref={sectionRef}
      id="phone-demo"
      className="relative overflow-hidden bg-slate-50 py-24 dark:bg-[#111827]"
      aria-labelledby="phone-demo-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-purple-500/5 via-transparent to-transparent dark:from-purple-500/10" />
      <div className="container relative z-10 mx-auto px-6">
        <div
          className={`mb-12 text-center lg:mb-16 ${isRTL ? "lg:text-right" : "lg:text-left"}`}
        >
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50 px-4 py-1.5 text-sm font-bold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 ${
              isRTL ? "lg:me-0" : "lg:ms-0"
            }`}
          >
            {t("badge")}
          </div>
          <h2
            id="phone-demo-heading"
            className="mb-4 text-3xl font-extrabold leading-tight text-slate-900 lg:text-4xl dark:text-white"
          >
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
              {t("title")}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg lg:mx-0 dark:text-slate-300">
            {t("description")}
          </p>
        </div>

        <div
          className={`flex flex-col items-stretch gap-10 lg:flex-row lg:items-start lg:gap-12 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div
            className="flex w-full flex-col gap-2.5 lg:max-w-[380px] lg:shrink-0"
            role="tablist"
            aria-label={t("title")}
          >
            {TAB_KEYS.map((key, idx) => {
              const selected = idx === activeIdx;
              const step = String(idx + 1).padStart(2, "0");
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`phone-flow-tab-${key}`}
                  aria-controls="phone-flow-panel"
                  onClick={() => setActiveIdx(idx)}
                  className={`group flex w-full gap-4 rounded-[22px] border px-3.5 py-4 text-start shadow-sm transition-all duration-200 ${
                    selected
                      ? "border-purple-500/70 bg-linear-to-br from-white to-purple-50/90 shadow-lg shadow-purple-200/50 ring-1 ring-purple-500/25 dark:border-purple-400/40 dark:from-[#1a2744] dark:to-[#15203c] dark:shadow-purple-950/50 dark:ring-purple-400/20"
                      : "border-slate-200/90 bg-white/90 hover:border-purple-300/70 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-[#15203c]/70 dark:hover:border-purple-600/40"
                  }`}
                >
                  <span
                    className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black tabular-nums transition-colors ${
                      selected
                        ? "bg-linear-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                        : "bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-purple-500/15 dark:group-hover:text-purple-300"
                    }`}
                    aria-hidden
                  >
                    {step}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5 text-start">
                    <span
                      className={`text-[15px] font-black leading-snug md:text-base ${
                        selected
                          ? "text-purple-800 dark:text-purple-100"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {t(`tabItems.${key}.title`)}
                    </span>
                    <span
                      className={`text-[13px] leading-relaxed md:text-sm ${
                        selected
                          ? "text-slate-600 dark:text-slate-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {t(`tabItems.${key}.description`)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative flex min-w-0 flex-1 justify-center">
            <div
              id="phone-flow-panel"
              role="tabpanel"
              aria-labelledby={`phone-flow-tab-${TAB_KEYS[activeIdx]}`}
              className={`relative w-full transition-[max-width] duration-300 ease-out ${
                deviceShape === "tablet" ? "max-w-[480px]" : "max-w-[420px]"
              }`}
            >
              <div className="absolute inset-0 -z-10 bg-linear-to-r from-purple-600 to-purple-700 opacity-15 blur-[100px] dark:from-purple-500 dark:to-purple-600 dark:opacity-25" />
              <PhoneFrameWithVideo
                src={resolvedSrc}
                shape={deviceShape}
                playing={videoPlaying}
              />
              <div
                className="mt-6 flex justify-center"
                role="group"
                aria-label={t("deviceToggleAria")}
              >
                <div className="inline-flex rounded-full border border-slate-200/90 bg-white/90 p-1 shadow-sm dark:border-slate-600 dark:bg-[#15203c]/90">
                  <button
                    type="button"
                    aria-label={t("devicePhone")}
                    aria-pressed={deviceShape === "phone"}
                    onClick={() => setDeviceShape("phone")}
                    className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                      deviceShape === "phone"
                        ? "bg-linear-to-br from-purple-600 to-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <MdSmartphone className="size-6" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={t("deviceTablet")}
                    aria-pressed={deviceShape === "tablet"}
                    onClick={() => setDeviceShape("tablet")}
                    className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                      deviceShape === "tablet"
                        ? "bg-linear-to-br from-purple-600 to-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <MdTabletMac className="size-6" aria-hidden />
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
