"use client";

import { useEffect, useState, type RefObject } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import {
  getMaxScroll,
  getNormalizedScrollLeft,
  isRtlElement,
  setNormalizedScrollLeft,
} from "@/lib/rtlScroll";

type MobileScrollSwipeHintsProps = {
  scrollRef: RefObject<HTMLElement | null>;
  swipeHint?: string;
  className?: string;
};

function scrollToward(el: HTMLElement, toward: "start" | "end") {
  const maxScroll = getMaxScroll(el);
  if (maxScroll <= 0) return;

  const delta = el.clientWidth * 0.72;
  const current = getNormalizedScrollLeft(el);
  const target =
    toward === "start"
      ? Math.max(0, current - delta)
      : Math.min(maxScroll, current + delta);

  setNormalizedScrollLeft(el, target, "smooth");
}

export default function MobileScrollSwipeHints({
  scrollRef,
  swipeHint,
  className,
}: MobileScrollSwipeHintsProps) {
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [showHint, setShowHint] = useState(Boolean(swipeHint));
  const [hintVisible, setHintVisible] = useState(Boolean(swipeHint));

  const StartIcon = isRtl ? FiChevronRight : FiChevronLeft;
  const EndIcon = isRtl ? FiChevronLeft : FiChevronRight;

  useEffect(() => {
    if (!swipeHint) return;

    const fadeTimer = window.setTimeout(() => setHintVisible(false), 2600);
    const removeTimer = window.setTimeout(() => setShowHint(false), 3200);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [swipeHint]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const offset = getNormalizedScrollLeft(el);

      setIsRtl(isRtlElement(el));
      setAtStart(offset <= 8);
      setAtEnd(offset >= maxScroll - 8);
      setHasScrolled(offset > 8);
      setCanScroll(maxScroll > 8);
    };

    update();

    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    observer?.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [scrollRef]);

  const arrowClass = (edge: "start" | "end") =>
    cn(
      "mobile-scroll-hint-arrow pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 transition-all duration-500 ease-out",
      !canScroll && "mobile-scroll-hint-arrow--hidden",
      canScroll && edge === "start" && atStart && "mobile-scroll-hint-arrow--edge",
      canScroll && edge === "end" && atEnd && "mobile-scroll-hint-arrow--edge",
      canScroll && hasScrolled && "mobile-scroll-hint-arrow--dimmed",
    );

  return (
    <>
      <div
        className={cn(
          arrowClass("start"),
          "mobile-scroll-hint-arrow--start",
          className,
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="mobile-scroll-hint-btn pointer-events-auto"
          onClick={() => {
            const el = scrollRef.current;
            if (el) scrollToward(el, "start");
          }}
        >
          <StartIcon size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={cn(
          arrowClass("end"),
          "mobile-scroll-hint-arrow--end",
          className,
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="mobile-scroll-hint-btn pointer-events-auto"
          onClick={() => {
            const el = scrollRef.current;
            if (el) scrollToward(el, "end");
          }}
        >
          <EndIcon size={15} strokeWidth={2.5} />
        </button>
      </div>

      {showHint && swipeHint ? (
        <p
          className={cn(
            "mobile-scroll-swipe-hint pointer-events-none absolute inset-x-0 -bottom-1 z-10 text-center text-[11px] font-medium tracking-wide text-purple-600/80 transition-opacity duration-700 dark:text-purple-300/75",
            hintVisible ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        >
          {swipeHint}
        </p>
      ) : null}
    </>
  );
}
