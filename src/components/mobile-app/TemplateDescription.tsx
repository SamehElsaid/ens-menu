"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadImage from "../ImageLoad";

const TemplateDescription = () => {
  const t = useTranslations("Landing.templateDescription");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const steps = useMemo(() => {
    const raw = t.raw("steps");
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const AUTOPLAY_MS = 2000;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const last = Math.max(0, steps.length - 1);

  const scrollToSlide = useCallback((index: number, instant: boolean) => {
    const root = scrollRef.current;
    const slide = root?.querySelector<HTMLElement>(
      `[data-slide-index="${index}"]`,
    );
    if (!root || !slide) return;

    const cRect = root.getBoundingClientRect();
    const eRect = slide.getBoundingClientRect();
    const delta = eRect.left - cRect.left - (cRect.width - eRect.width) / 2;

    root.scrollBy({
      left: delta,
      behavior: instant ? "auto" : "smooth",
    });
  }, []);

  const updateNearestIndex = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const mid = rootRect.left + rootRect.width / 2;
    const slideEls = root.querySelectorAll("[data-slide-index]");
    let best = 0;
    let bestDist = Infinity;
    slideEls.forEach((node, i) => {
      const r = node.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIndex(best);
  }, []);

  useLayoutEffect(() => {
    if (steps.length === 0) return;
    requestAnimationFrame(() => {
      scrollToSlide(0, true);
      setActiveIndex(0);
    });
  }, [steps.length, isRTL, scrollToSlide]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    updateNearestIndex();
    root.addEventListener("scroll", updateNearestIndex, { passive: true });
    window.addEventListener("resize", updateNearestIndex, { passive: true });
    return () => {
      root.removeEventListener("scroll", updateNearestIndex);
      window.removeEventListener("resize", updateNearestIndex);
    };
  }, [updateNearestIndex, steps.length]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (last < 1 || tabHidden || isPaused) {
      return;
    }
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev >= last ? 0 : prev + 1;
        requestAnimationFrame(() => {
          scrollToSlide(next, reducedMotion);
        });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [last, tabHidden, isPaused, reducedMotion, scrollToSlide]);

  const go = (delta: number) => {
    if (last < 1) return;
    let next = activeIndex + delta;
    if (next < 0) next = last;
    else if (next > last) next = 0;

    scrollToSlide(next, reducedMotion);
    setActiveIndex(next);
  };

  const stepBadge = (index: number) => (
    <span
      dir="ltr"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 text-xs font-bold tabular-nums text-white"
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );

  if (steps.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-8 md:py-12"
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />

      <div className="relative mx-auto w-full max-w-[min(100%,1536px)] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-8 text-center md:mb-10">
          <span className="mb-3 inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-inner">
            {t("badge")}
          </span>
          <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={last < 1}
            className="absolute start-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200/90 bg-white text-violet-700 shadow-md transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-35 md:size-11"
          >
            <FaChevronRight className="size-5 md:size-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={last < 1}
            className="absolute end-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200/90 bg-white text-violet-700 shadow-md transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-35 md:size-11"
          >
            <FaChevronLeft className="size-5 md:size-6" />
          </button>

          {/* Slides */}
          <div
            ref={scrollRef}
            dir="ltr"
            className={`-mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-12 pb-8 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-14 md:px-16 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {steps.map((screen, index) => (
              <div
                key={index}
                data-slide-index={index}
                className="group w-[min(100vw-3rem,300px)] min-w-0 shrink-0 snap-center sm:w-[280px] md:w-[300px]"
              >
                <div
                  dir={isRTL ? "rtl" : "ltr"}
                  className="flex h-full min-w-0 flex-col rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-lg"
                >
                  {/* iPhone Frame with Dynamic Island (iPhone 17 Pro Style) */}
                  <div className="relative mx-auto mb-5 w-full max-w-[220px]">
                    <div className="relative aspect-[9/18.5] overflow-hidden rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                      {/* Dynamic Island Capsule */}
                      <div className="absolute left-1/2 top-3 z-20 flex items-center justify-center h-3.5 w-14 -translate-x-1/2 rounded-full bg-black ring-1 ring-slate-800/50 shadow-inner">
                        {/* Subtle Lens Effect */}
                        <div className="absolute right-3 size-1 rounded-full bg-slate-800/40" />
                      </div>

                      {/* Screen Image */}
                      <div className="absolute inset-0 bg-slate-100">
                        <LoadImage
                          src={`/images/showcase/photo-${index + 1}.png`}
                          alt={screen.title}
                          className="size-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex min-w-0 flex-1 flex-col px-1">
                    <div className="mb-2 flex min-w-0 items-start gap-2">
                      {stepBadge(index)}
                      <h3 className="text-lg font-bold text-slate-900">
                        {screen.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">{screen.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplateDescription;
