"use client";

import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FiBell,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiImage,
  FiSmartphone,
  FiUpload,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import type { MenuImportItem } from "@/components/HomePage/menuImportTypes";
import { cn } from "@/lib/cn";

export type MenuImportStep = {
  title: string;
  caption: string;
};

export type MenuImportHighlight = {
  text: string;
  icon: "clock" | "ai" | "photos" | "rocket";
};

type MenuImportStoryProps = {
  steps: MenuImportStep[];
  items: MenuImportItem[];
  uploadProgressLabel: string;
  uploadCompleteLabel: string;
  processingLabel: string;
  processingCompleteLabel: string;
  extractProgressLabel: string;
  extractCompleteLabel: string;
  qrDownloadLabel: string;
  liveBadgeLabel: string;
  newOrderLabel: string;
  scanToOrderLabel: string;
  notificationLabel?: string;
  tableLabel?: string;
  statusNewLabel?: string;
  orderItemsLabel?: string;
  highlights?: MenuImportHighlight[];
  showHighlights?: boolean;
};

const HIGHLIGHT_ICONS = {
  clock: FiClock,
  ai: HiOutlineSparkles,
  photos: FiImage,
  rocket: FiZap,
} as const;

const MenuImportActiveStepContext = createContext(1);

function useMenuImportActiveStep() {
  return useContext(MenuImportActiveStepContext);
}

/** Prevent scroll jumps when step/progress layout updates (scroll anchoring). */
function usePreserveScrollPosition(...deps: unknown[]) {
  const scrollYRef = useRef(0);

  useLayoutEffect(() => {
    scrollYRef.current = window.scrollY;

    const restore = () => {
      const y = scrollYRef.current;
      if (Math.abs(window.scrollY - y) > 1) {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      }
    };

    restore();
    const raf1 = requestAnimationFrame(restore);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(restore));

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit scroll-lock triggers
  }, deps);
}

function QrSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn("text-slate-900", className)}
      aria-hidden
    >
      <rect width="80" height="80" fill="white" />
      <rect x="6" y="6" width="22" height="22" fill="currentColor" />
      <rect x="52" y="6" width="22" height="22" fill="currentColor" />
      <rect x="6" y="52" width="22" height="22" fill="currentColor" />
      <rect x="34" y="34" width="6" height="6" fill="currentColor" />
      <rect x="46" y="34" width="6" height="6" fill="currentColor" />
      <rect x="58" y="46" width="10" height="10" fill="currentColor" />
      <rect x="10" y="10" width="14" height="14" fill="white" />
      <rect x="56" y="10" width="14" height="14" fill="white" />
      <rect x="10" y="56" width="14" height="14" fill="white" />
    </svg>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

const SYNCED_PROGRESS_TARGET = 100;
const SYNCED_PROGRESS_DURATION_MS = 2600;
/** Advance after progress animation finishes (+ small read buffer). */
const STEP_ADVANCE_MS = SYNCED_PROGRESS_DURATION_MS + 600;
const USER_INTERACTION_PAUSE_MS = 12_000;
const SCROLL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const DRAG_SWIPE_THRESHOLD_PX = 36;
const TIMELINE_DRAGGING_CLASS = "menu-import-steps-timeline--dragging";
const PROGRAMMATIC_SCROLL_LOCK_MS = 560;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function centerTimelineStep(
  container: HTMLElement,
  step: HTMLElement,
  behavior: ScrollBehavior,
) {
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
  if (maxScroll <= 0) return;

  const containerRect = container.getBoundingClientRect();
  const stepRect = step.getBoundingClientRect();
  const target =
    container.scrollLeft +
    (stepRect.left + stepRect.width / 2) -
    (containerRect.left + containerRect.width / 2);

  container.scrollTo({
    left: Math.max(0, Math.min(maxScroll, target)),
    behavior,
  });
}

function findCenteredStepIndex(
  container: HTMLElement,
  steps: Array<HTMLElement | null>,
): number {
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  steps.forEach((step, index) => {
    if (!step) return;
    const rect = step.getBoundingClientRect();
    const stepCenter = rect.left + rect.width / 2;
    const distance = Math.abs(stepCenter - containerCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex + 1;
}

function resolveStepAfterDrag(
  container: HTMLElement,
  steps: Array<HTMLElement | null>,
  dragDelta: number,
  stepCount: number,
  activeStep: number,
): number {
  if (Math.abs(dragDelta) < DRAG_SWIPE_THRESHOLD_PX) {
    return findCenteredStepIndex(container, steps);
  }

  const direction = dragDelta > 0 ? 1 : -1;
  return Math.max(1, Math.min(stepCount, activeStep + direction));
}

function lockProgrammaticScroll(
  programmaticScrollRef: React.RefObject<boolean>,
  durationMs = PROGRAMMATIC_SCROLL_LOCK_MS,
) {
  programmaticScrollRef.current = true;
  window.setTimeout(() => {
    programmaticScrollRef.current = false;
  }, durationMs);
}

function useTimelineDrag({
  timelineRef,
  stepRefs,
  stepCount,
  activeStepRef,
  onStepResolved,
  pauseAutoplay,
  programmaticScrollRef,
  isDraggingRef,
  skipAutoScrollRef,
}: {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  stepRefs: React.RefObject<Array<HTMLElement | null>>;
  stepCount: number;
  activeStepRef: React.RefObject<number>;
  onStepResolved: (step: number) => void;
  pauseAutoplay: () => void;
  programmaticScrollRef: React.RefObject<boolean>;
  isDraggingRef: React.RefObject<boolean>;
  skipAutoScrollRef: React.RefObject<boolean>;
}) {
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    lastX: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const beginDrag = useCallback((container: HTMLElement, event: PointerEvent) => {
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
    };
    isDraggingRef.current = true;
    setIsDragging(true);
    pauseAutoplay();
    programmaticScrollRef.current = true;
    container.classList.add(TIMELINE_DRAGGING_CLASS);
    container.style.scrollSnapType = "none";
    container.style.scrollBehavior = "auto";
    container.setPointerCapture(event.pointerId);
  }, [isDraggingRef, pauseAutoplay, programmaticScrollRef]);

  const finishDrag = useCallback(
    (container: HTMLElement, event: PointerEvent) => {
      if (!dragRef.current.active || event.pointerId !== dragRef.current.pointerId) {
        return;
      }

      const totalDrag = dragRef.current.startX - event.clientX;
      dragRef.current.active = false;
      isDraggingRef.current = false;

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      const targetStep = resolveStepAfterDrag(
        container,
        stepRefs.current,
        totalDrag,
        stepCount,
        activeStepRef.current,
      );
      const stepEl = stepRefs.current[targetStep - 1];
      const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

      lockProgrammaticScroll(programmaticScrollRef, behavior === "smooth" ? PROGRAMMATIC_SCROLL_LOCK_MS : 0);
      skipAutoScrollRef.current = true;
      onStepResolved(targetStep);

      if (stepEl) {
        centerTimelineStep(container, stepEl, behavior);
      }

      window.setTimeout(() => {
        container.classList.remove(TIMELINE_DRAGGING_CLASS);
        container.style.removeProperty("scroll-snap-type");
        container.style.removeProperty("scroll-behavior");
        skipAutoScrollRef.current = false;
        setIsDragging(false);
      }, behavior === "smooth" ? PROGRAMMATIC_SCROLL_LOCK_MS : 0);
    },
    [activeStepRef, onStepResolved, programmaticScrollRef, skipAutoScrollRef, stepCount, stepRefs, isDraggingRef],
  );

  const settleFromScroll = useCallback(() => {
    const container = timelineRef.current;
    if (
      !container ||
      dragRef.current.active ||
      isDraggingRef.current ||
      programmaticScrollRef.current ||
      container.classList.contains(TIMELINE_DRAGGING_CLASS)
    ) {
      return;
    }

    const nearest = findCenteredStepIndex(container, stepRefs.current);
    if (nearest !== activeStepRef.current) {
      onStepResolved(nearest);
    }
  }, [activeStepRef, isDraggingRef, onStepResolved, programmaticScrollRef, stepRefs, timelineRef]);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (event.pointerType === "touch") return;
      if ((event.target as HTMLElement).closest("button,a,input,textarea,select")) {
        return;
      }

      beginDrag(container, event);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active || event.pointerId !== dragRef.current.pointerId) {
        return;
      }

      event.preventDefault();
      const delta = event.clientX - dragRef.current.lastX;
      container.scrollBy({ left: -delta, behavior: "auto" });
      dragRef.current.lastX = event.clientX;
    };

    const endDrag = (event: PointerEvent) => {
      finishDrag(container, event);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
    };
  }, [
    beginDrag,
    finishDrag,
    timelineRef,
  ]);

  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const onUserScroll = () => {
      if (
        dragRef.current.active ||
        isDraggingRef.current ||
        programmaticScrollRef.current ||
        container.classList.contains(TIMELINE_DRAGGING_CLASS)
      ) {
        return;
      }
      pauseAutoplay();
    };

    container.addEventListener("scroll", onUserScroll, { passive: true });

    const onScrollEnd = () => {
      if (
        dragRef.current.active ||
        isDraggingRef.current ||
        programmaticScrollRef.current ||
        container.classList.contains(TIMELINE_DRAGGING_CLASS)
      ) {
        return;
      }
      settleFromScroll();
    };

    container.addEventListener("scrollend", onScrollEnd);

    return () => {
      container.removeEventListener("scroll", onUserScroll);
      container.removeEventListener("scrollend", onScrollEnd);
    };
  }, [isDraggingRef, pauseAutoplay, programmaticScrollRef, settleFromScroll, timelineRef]);

  return { isDragging };
}

function useSyncedPercent(current: boolean, passed: boolean) {
  const [value, setValue] = useState(passed ? SYNCED_PROGRESS_TARGET : 0);
  const [display, setDisplay] = useState(passed ? SYNCED_PROGRESS_TARGET : 0);
  const [done, setDone] = useState(passed);

  useEffect(() => {
    if (passed) {
      setValue(SYNCED_PROGRESS_TARGET);
      setDisplay(SYNCED_PROGRESS_TARGET);
      setDone(true);
      return;
    }

    if (!current) {
      if (!passed) {
        setValue(0);
        setDisplay(0);
        setDone(false);
      }
      return;
    }

    setDone(false);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setValue(SYNCED_PROGRESS_TARGET);
      setDisplay(SYNCED_PROGRESS_TARGET);
      setDone(true);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SYNCED_PROGRESS_DURATION_MS);
      const next = easeInOutCubic(t) * SYNCED_PROGRESS_TARGET;
      setValue(next);
      setDisplay((prev) => {
        const blended = prev + (next - prev) * 0.28;
        return Math.min(SYNCED_PROGRESS_TARGET, blended);
      });
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(SYNCED_PROGRESS_TARGET);
        setDisplay(SYNCED_PROGRESS_TARGET);
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current, passed]);

  return {
    value,
    display: Math.min(SYNCED_PROGRESS_TARGET, Math.round(display)),
    complete: passed || done,
  };
}

function useSmoothTarget(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setValue(target);
      return;
    }

    let raf = 0;

    const tick = () => {
      setValue((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.25) return target;
        return prev + diff * 0.14;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function LoadingDots() {
  return (
    <span className="menu-import-loading-dots ms-1 inline-flex items-center gap-0.5" aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

function AnimatedStatusLabel({
  label,
  complete,
  active,
  centered,
}: {
  label: string;
  complete: boolean;
  active: boolean;
  centered?: boolean;
}) {
  return (
    <p
      className={cn(
        "menu-import-status-label font-medium transition-colors duration-500",
        centered
          ? "mt-2 w-full text-center text-[10px] leading-snug sm:text-[11px]"
          : "mt-1.5 truncate text-[10px] sm:text-[11px]",
        complete
          ? "menu-import-status-label--complete font-semibold text-emerald-600 dark:text-emerald-400"
          : "text-purple-600 dark:text-purple-400",
        active || complete ? "opacity-100" : "opacity-45",
      )}
    >
      {label}
      {active && !complete ? <LoadingDots /> : null}
    </p>
  );
}

function SyncedProgressBlock({
  current,
  passed,
  label,
  completeLabel,
  align = "row",
  shimmer = false,
  glow = false,
  leadingIcon,
}: {
  current: boolean;
  passed: boolean;
  label: string;
  completeLabel: string;
  align?: "row" | "center" | "stack";
  shimmer?: boolean;
  glow?: boolean;
  leadingIcon?: ReactNode;
}) {
  const { value, display, complete } = useSyncedPercent(current, passed);
  const statusLabel = complete ? completeLabel : label;
  const processing = current && !complete;

  const track = (
    <SyncedProgressTrack
      value={value}
      shimmer={shimmer && processing}
      glow={glow && processing}
      active={processing}
      className={complete ? "opacity-100" : undefined}
    />
  );

  const percentOrCheck = complete ? (
    <span className="menu-import-check-reveal flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
      <FiCheck size={11} strokeWidth={3} aria-hidden />
    </span>
  ) : (
    <span className="shrink-0 text-[11px] font-bold tabular-nums text-purple-600 dark:text-purple-400">
      {display}%
    </span>
  );

  if (align === "center" || align === "stack") {
    return (
      <div className="flex w-full flex-col items-center gap-2.5">
        {align === "stack" && leadingIcon ? (
          <span
            className={cn(
              processing && "menu-import-icon-active",
              complete && "menu-import-icon-complete",
            )}
          >
            {leadingIcon}
          </span>
        ) : null}
        <div className="w-full">{track}</div>
        <div className="flex w-full min-h-[2.75rem] flex-col items-center justify-center gap-1.5">
          <AnimatedStatusLabel
            label={statusLabel}
            complete={complete}
            active={processing}
            centered
          />
          <div className="flex h-5 items-center justify-center">
            {percentOrCheck}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          processing && "menu-import-icon-active",
          complete && "menu-import-icon-complete",
        )}
      >
        {leadingIcon}
      </span>
      <div className="min-w-0 flex-1">
        {track}
        <AnimatedStatusLabel
          label={statusLabel}
          complete={complete}
          active={processing}
        />
      </div>
      {percentOrCheck}
    </div>
  );
}

function SyncedProgressTrack({
  value,
  shimmer = false,
  glow = false,
  active = false,
  className,
}: {
  value: number;
  shimmer?: boolean;
  glow?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        active && "menu-import-progress-track--active",
        className,
      )}
    >
      {glow && value > 0 && (
        <span
          aria-hidden
          className="menu-import-progress-glow pointer-events-none absolute inset-0 rounded-full"
        />
      )}
      <div
        className={cn(
          "menu-import-progress-fill relative h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-400 rtl:bg-gradient-to-l",
          shimmer && value > 0 && "menu-import-progress-shimmer",
        )}
        style={{ width: `${value}%` }}
      >
        {shimmer && value > 0 && (
          <span
            aria-hidden
            className="menu-import-progress-sheen pointer-events-none absolute inset-0 rounded-full"
          />
        )}
      </div>
    </div>
  );
}

function StepConnector({
  active,
  flowing,
  variant = "line",
}: {
  active: boolean;
  flowing?: boolean;
  variant?: "line" | "arrow";
}) {
  if (variant === "arrow") {
    return (
      <div
        className="menu-import-step-connector flex w-6 shrink-0 items-center justify-center self-center sm:w-7 lg:hidden"
        aria-hidden
      >
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-500 rtl:rotate-180",
            active ? "text-purple-500" : "text-slate-300 dark:text-slate-600",
            flowing && "menu-import-connector-arrow-pulse",
          )}
        >
          →
        </span>
      </div>
    );
  }

  return (
    <div
      className="menu-import-step-connector hidden w-5 shrink-0 self-center xl:w-7 lg:flex"
      aria-hidden
    >
      <div className="relative h-px w-full overflow-visible rounded-full bg-slate-200/60 dark:bg-slate-700/70">
        {active && (
          <span className="menu-import-connector-glow pointer-events-none absolute -inset-y-2 inset-x-0 rounded-full" />
        )}
        <div
          className={cn(
            "absolute inset-y-0 start-0 h-px rounded-full bg-gradient-to-r from-purple-400/75 to-violet-500/85 transition-all duration-[850ms] ease-[cubic-bezier(0.4,0,0.2,1)] rtl:bg-gradient-to-l",
            active ? "w-full opacity-100" : "w-0 opacity-0",
          )}
        />
        {flowing && (
          <>
            <span className="menu-import-connector-dot absolute start-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
            <span className="menu-import-connector-trail absolute start-0 top-1/2 h-px w-4 -translate-y-1/2 bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 rtl:bg-gradient-to-l" />
          </>
        )}
      </div>
    </div>
  );
}

function ImportProductRow({
  item,
  showCheck,
  animate,
  delayMs,
}: {
  item: MenuImportItem;
  showCheck: boolean;
  animate?: boolean;
  delayMs?: number;
}) {
  return (
    <li
      className={cn(
        "menu-import-product-row grid w-full grid-cols-[2.75rem_minmax(0,1fr)_1.25rem] items-center gap-x-2.5 gap-y-0",
        animate && "menu-import-product-row--in",
      )}
      style={delayMs !== undefined ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <HeroProductThumb src={item.image} alt={item.name} />
      <div className="min-w-0 text-start">
        <p className="truncate text-[11px] font-semibold leading-snug text-slate-800 dark:text-slate-100 sm:text-xs">
          {item.name}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold tabular-nums leading-none text-slate-500 sm:text-[11px]">
          {item.price}
        </p>
      </div>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center justify-self-end rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
          showCheck && animate && "menu-import-check-pop",
          !showCheck && "opacity-0",
        )}
        style={
          showCheck && animate && delayMs !== undefined
            ? { animationDelay: `${delayMs + 80}ms` }
            : undefined
        }
        aria-hidden={!showCheck}
      >
        <FiCheck size={12} strokeWidth={3} />
      </span>
    </li>
  );
}

function StepUploadVisual({
  items,
  label,
  completeLabel,
}: {
  items: MenuImportItem[];
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 0;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/50 dark:bg-slate-800/40">
        <p className="mb-2 text-center text-[11px] font-bold tracking-widest text-slate-400">
          MENU
        </p>
        <ul className="space-y-1.5">
          {items.slice(0, 3).map((item) => (
            <li
              key={item.name}
              className="flex items-baseline justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-300 sm:text-[11px]"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 tabular-nums text-slate-400">
                {item.price}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="stack"
        leadingIcon={
          <span className="menu-import-step-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <FiUpload size={14} strokeWidth={2.5} />
          </span>
        }
      />
    </div>
  );
}

function StepAiVisual({
  label,
  completeLabel,
}: {
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 1;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;
  const active = activeStep >= stepIndex + 1;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="menu-import-ai-stage relative mx-auto flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center">
        {active && (
          <>
            <span
              aria-hidden
              className="menu-import-ai-ring pointer-events-none absolute inset-0 rounded-2xl border border-purple-300/35"
            />
            <span
              aria-hidden
              className="menu-import-ai-orbit pointer-events-none absolute inset-[-4px] rounded-[1.15rem] border border-purple-300/20"
            />
          </>
        )}
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-purple-200/90 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 dark:border-purple-500/30 dark:from-purple-500/15 dark:to-violet-500/10 dark:text-purple-300",
            active && "menu-import-step-glow",
            current && "menu-import-ai-core--active",
          )}
        >
          {active && (
            <>
              <span
                aria-hidden
                className="menu-import-ai-grid pointer-events-none absolute inset-0 opacity-[0.35]"
              />
            </>
          )}
          <FiZap className="relative" size={16} strokeWidth={2.25} />
        </div>
      </div>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="center"
        shimmer
        glow
      />
    </div>
  );
}

function StepPhotosVisual({
  items,
  label,
  completeLabel,
}: {
  items: MenuImportItem[];
  label: string;
  completeLabel: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const stepIndex = 2;
  const current = activeStep === stepIndex + 1;
  const passed = activeStep > stepIndex + 1;
  const active = activeStep >= stepIndex + 1;

  return (
    <div className="flex w-full flex-col gap-4">
      <ul className="flex w-full flex-col gap-2.5">
        {items.map((item, i) => (
          <ImportProductRow
            key={item.name}
            item={item}
            showCheck={active}
            animate={active}
            delayMs={active ? i * 120 : undefined}
          />
        ))}
      </ul>
      <SyncedProgressBlock
        current={current}
        passed={passed}
        label={label}
        completeLabel={completeLabel}
        align="stack"
        leadingIcon={
          <span className="menu-import-step-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <FiImage size={14} strokeWidth={2.5} />
          </span>
        }
      />
    </div>
  );
}

function StepQrVisual({ downloadLabel }: { downloadLabel: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative p-1">
        <span className="absolute start-0 top-0 h-4 w-4 rounded-ss-md border-s-2 border-t-2 border-purple-500" />
        <span className="absolute end-0 top-0 h-4 w-4 rounded-se-md border-e-2 border-t-2 border-purple-500" />
        <span className="absolute bottom-0 start-0 h-4 w-4 rounded-es-md border-b-2 border-s-2 border-purple-500" />
        <span className="absolute bottom-0 end-0 h-4 w-4 rounded-ee-md border-b-2 border-e-2 border-purple-500" />
        <QrSvg className="h-[5.25rem] w-[5.25rem] sm:h-[5.75rem] sm:w-[5.75rem]" />
      </div>
      <button
        type="button"
        className="menu-import-qr-btn inline-flex items-center gap-1.5 rounded-lg border border-purple-500/80 bg-white px-3 py-1.5 text-[10px] font-semibold text-purple-600 transition-all dark:border-purple-400/60 dark:bg-transparent dark:text-purple-400 sm:text-[11px]"
      >
        <FiDownload size={13} strokeWidth={2.5} />
        {downloadLabel}
      </button>
    </div>
  );
}

function StepScanVisual({ scanToOrderLabel }: { scanToOrderLabel: string }) {
  const activeStep = useMenuImportActiveStep();
  const active = activeStep >= 5;

  return (
    <div className="relative mx-auto w-full max-w-[180px]">
      <div
        className={cn(
          "menu-import-table-scene relative overflow-hidden rounded-xl p-3",
          "bg-gradient-to-b from-amber-100/90 via-amber-50/55 to-amber-200/30",
          "dark:from-amber-950/35 dark:via-amber-900/15 dark:to-amber-950/25",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="menu-import-scan-beam pointer-events-none absolute bottom-[2.5rem] start-[42%] z-10 h-px w-[30%] origin-start rotate-[-16deg] bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 rtl:origin-end rtl:rotate-[16deg]"
          />
        )}
        <div className="flex items-end justify-center gap-2">
          <div
            className="flex flex-col items-center"
            style={{ perspective: "320px" }}
          >
            <div
              className={cn(
                "w-[5.5rem] origin-bottom sm:w-[6rem]",
                active && "menu-import-stand-float",
              )}
              style={{ transform: "rotateX(8deg)" }}
            >
              <div className="relative rounded-t-lg border border-white/90 bg-gradient-to-b from-white to-slate-50 px-2 pb-3 pt-2 text-center shadow-[0_10px_28px_-12px_rgba(15,23,42,0.2)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-2 top-0 h-3 rounded-b-sm bg-white/60"
                />
                <p className="relative text-[7px] font-bold tracking-[0.15em] text-purple-600">
                  ENSMENU
                </p>
                <QrSvg className="relative mx-auto mt-1 h-11 w-11 sm:h-12 sm:w-12" />
                <p className="relative mt-0.5 text-[6.5px] font-medium text-slate-400">
                  {scanToOrderLabel}
                </p>
              </div>
              <div className="h-3 w-full bg-gradient-to-b from-slate-200/90 to-slate-400/80 dark:from-slate-600 dark:to-slate-800" />
            </div>
          </div>

          <div
            className={cn(
              "relative mb-1 w-[3.6rem] shrink-0 overflow-hidden rounded-[0.85rem] border border-slate-200/80 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900",
              active && "menu-import-phone-glow",
            )}
          >
            <div className="bg-purple-50/85 px-1.5 py-1 dark:bg-purple-500/10">
              <p className="text-[6px] font-semibold text-purple-600 dark:text-purple-400">
                {scanToOrderLabel}
              </p>
            </div>
            <div className="relative space-y-1 p-1.5">
              {active && (
                <span
                  aria-hidden
                  className="menu-import-scan-line pointer-events-none absolute inset-x-1 top-1 h-3 rounded-sm bg-purple-400/25"
                />
              )}
              <div className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-2.5 w-[80%] rounded bg-slate-100/80 dark:bg-slate-800/80" />
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="menu-import-wood-surface mx-auto mt-2.5 h-2 w-[90%] rounded-full"
        />
      </div>
    </div>
  );
}

function MenuImportPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="menu-import-phone-shell">
      <div className="menu-import-phone-shell-frame">
        <div className="menu-import-phone-screen">{children}</div>
      </div>
    </div>
  );
}

function StepFlowConnector({
  active,
  flowing,
}: {
  active: boolean;
  flowing?: boolean;
}) {
  return (
    <>
      <StepConnector variant="arrow" active={active} flowing={flowing} />
      <StepConnector variant="line" active={active} flowing={flowing} />
    </>
  );
}

function StepLiveVisual({
  liveBadgeLabel,
  newOrderLabel,
  notificationLabel,
  tableLabel,
  statusNewLabel,
  orderItemsLabel,
  orderItemName,
  orderItemPrice,
}: {
  liveBadgeLabel: string;
  newOrderLabel: string;
  notificationLabel: string;
  tableLabel: string;
  statusNewLabel: string;
  orderItemsLabel: string;
  orderItemName: string;
  orderItemPrice: string;
}) {
  const activeStep = useMenuImportActiveStep();
  const live = activeStep >= 6;

  return (
    <div className="menu-import-live-phone-wrap">
      <MenuImportPhoneFrame>
      <div className="menu-import-live-phone-content flex h-full min-h-0 flex-col text-start">
        <div className="flex shrink-0 items-center justify-between gap-1 border-b border-slate-200/70 bg-slate-50/90 px-2.5 py-1 dark:border-white/8 dark:bg-white/[0.03]">
          <span className="text-[7px] font-semibold tabular-nums text-slate-400">
            9:41
          </span>
          <span className="flex gap-0.5">
            <span className="h-1 w-3 rounded-sm bg-slate-300 dark:bg-slate-600" />
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-1.5 border-b border-slate-200/60 px-2.5 py-1.5 dark:border-white/8">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <FiSmartphone size={11} strokeWidth={2.25} />
            </span>
            <p className="truncate text-[9px] font-semibold text-slate-800 dark:text-white">
              ENSMENU
            </p>
          </div>
          <div className="relative shrink-0 pe-0.5 pt-0.5">
            <FiBell
              className={cn(
                "text-purple-600 dark:text-purple-400",
                live && "menu-import-bell-ring",
              )}
              size={14}
              strokeWidth={2}
            />
            {live && (
              <span className="absolute end-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[7px] font-bold text-white">
                1
              </span>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-2">
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-semibold transition-opacity duration-300",
              live
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-slate-200/80 bg-slate-50 text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800/50",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-emerald-500",
                live && "menu-import-live-dot",
              )}
            />
            {liveBadgeLabel}
          </span>

          {live && (
            <div className="menu-import-order-toast shrink-0 rounded-md border border-purple-100/80 bg-purple-50/70 px-2 py-1.5 dark:border-purple-500/20 dark:bg-purple-500/10">
              <p className="line-clamp-2 text-[7.5px] font-semibold leading-snug text-purple-700 dark:text-purple-300">
                {notificationLabel}
              </p>
            </div>
          )}

          <div
            className={cn(
              "mt-auto min-h-0 shrink rounded-md border bg-white p-2 shadow-sm dark:bg-slate-900/80",
              live
                ? "menu-import-order-toast border-emerald-200/70 dark:border-emerald-500/25"
                : "border-slate-200/70 opacity-55 dark:border-slate-700/60",
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-1">
              <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
                {tableLabel}
              </p>
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                7
              </p>
            </div>
            <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              {newOrderLabel}
            </p>
            <div className="mt-1.5 border-t border-slate-200/60 pt-1.5 dark:border-white/8">
              <p className="text-[7px] font-medium text-slate-500 dark:text-slate-400">
                {orderItemsLabel}
              </p>
              <p className="mt-0.5 truncate text-[8px] leading-snug text-slate-700 dark:text-slate-200">
                {orderItemName}
              </p>
              <p className="text-[7px] font-semibold tabular-nums text-slate-500">
                {orderItemPrice}
              </p>
            </div>
            <div className="mt-1.5 flex justify-end">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-semibold",
                  live
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800",
                )}
              >
                {statusNewLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
      </MenuImportPhoneFrame>
    </div>
  );
}

function StoryStep({
  step,
  index,
  active,
  current,
  isFinale,
  stepRef,
  children,
}: {
  step: MenuImportStep;
  index: number;
  active: boolean;
  current: boolean;
  isFinale: boolean;
  stepRef?: (node: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <article
      ref={stepRef}
      className={cn(
        "menu-import-step menu-import-step--timeline flex w-[var(--menu-import-step-w)] max-w-[var(--menu-import-step-w)] shrink-0 snap-center snap-always flex-col",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        current && "menu-import-step--current z-[1]",
        isFinale && "menu-import-step--finale",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-3 flex w-full flex-col items-center gap-2 text-center sm:mb-3.5">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-500",
            active
              ? "bg-purple-600 text-white shadow-[0_4px_14px_-4px_rgba(124,58,237,0.45)]"
              : "border border-slate-200/90 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900",
            current && "menu-import-step-badge--current",
          )}
        >
          {index + 1}
        </span>
        <h3
          className={cn(
            "w-full text-center text-[12px] font-semibold leading-snug sm:text-[13px]",
            active
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400",
            isFinale && active && "text-purple-700 dark:text-purple-300",
          )}
        >
          {step.title}
        </h3>
      </div>

      {isFinale ? (
        <div
          className={cn(
            "menu-import-step-card menu-import-step-card--live flex w-full flex-1 flex-col items-center justify-center",
            current && "menu-import-step-card--current",
            active && current && "menu-import-finale-ambient",
          )}
        >
          {children}
        </div>
      ) : (
        <div
          className={cn(
            "menu-import-step-card flex min-h-[172px] w-full flex-1 flex-col items-center justify-center overflow-visible rounded-2xl border bg-white p-3 sm:min-h-[186px] sm:p-3.5",
            "border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.06)] dark:border-slate-700/45 dark:bg-slate-900/30",
            current && "menu-import-step-card--current border-purple-100/85",
          )}
        >
          {children}
        </div>
      )}

      <p
        className={cn(
          "mx-auto w-full max-w-[16.5rem] text-center text-[10px] leading-relaxed sm:text-[11px]",
          isFinale ? "mt-4" : "mt-3",
          isFinale && active
            ? "font-medium text-slate-600 dark:text-slate-300"
            : "text-slate-500 dark:text-slate-400",
        )}
      >
        {step.caption}
      </p>
    </article>
  );
}

export default function MenuImportStory({
  steps,
  items,
  uploadProgressLabel,
  uploadCompleteLabel,
  processingLabel,
  processingCompleteLabel,
  extractProgressLabel,
  extractCompleteLabel,
  qrDownloadLabel,
  liveBadgeLabel,
  newOrderLabel,
  scanToOrderLabel,
  notificationLabel = "",
  tableLabel = "Table",
  statusNewLabel = "New",
  orderItemsLabel = "Items",
  highlights = [],
  showHighlights = false,
}: MenuImportStoryProps) {
  const stepCount = steps.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const programmaticScrollRef = useRef(false);
  const isDraggingRef = useRef(false);
  const skipAutoScrollRef = useRef(false);
  const activeStepRef = useRef(1);
  const pauseUntilRef = useRef(0);
  const [activeStep, setActiveStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const globalProgressTarget = (activeStep / stepCount) * 100;
  const globalProgressWidth = useSmoothTarget(globalProgressTarget);
  const isProcessingStep = activeStep >= 1 && activeStep <= 3;

  activeStepRef.current = activeStep;

  const pauseAutoplay = useCallback((durationMs = USER_INTERACTION_PAUSE_MS) => {
    pauseUntilRef.current = Date.now() + durationMs;
  }, []);

  const resolveTimelineStep = useCallback(
    (step: number) => {
      setActiveStep(step);
      pauseAutoplay();
    },
    [pauseAutoplay],
  );

  const { isDragging: _isDragging } = useTimelineDrag({
    timelineRef,
    stepRefs,
    stepCount,
    activeStepRef,
    onStepResolved: resolveTimelineStep,
    pauseAutoplay,
    programmaticScrollRef,
    isDraggingRef,
    skipAutoScrollRef,
  });

  const goToStep = useCallback(
    (step: number) => {
      const next = Math.max(1, Math.min(stepCount, step));
      setActiveStep(next);
      pauseAutoplay();
    },
    [pauseAutoplay, stepCount],
  );

  const goToPrevStep = useCallback(() => {
    goToStep(activeStep <= 1 ? stepCount : activeStep - 1);
  }, [activeStep, goToStep, stepCount]);

  const goToNextStep = useCallback(() => {
    goToStep(activeStep >= stepCount ? 1 : activeStep + 1);
  }, [activeStep, goToStep, stepCount]);

  usePreserveScrollPosition(activeStep, visible);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const tick = () => {
      if (document.hidden || Date.now() < pauseUntilRef.current) return;
      setActiveStep((prev) => (prev >= stepCount ? 1 : prev + 1));
    };

    const interval = window.setInterval(tick, STEP_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [visible, stepCount]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseAutoplay(STEP_ADVANCE_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pauseAutoplay]);

  useEffect(() => {
    const container = timelineRef.current;
    const step = stepRefs.current[activeStep - 1];
    if (!container || !step || !visible || isDraggingRef.current || skipAutoScrollRef.current) {
      return;
    }

    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

    lockProgrammaticScroll(
      programmaticScrollRef,
      behavior === "smooth" ? PROGRAMMATIC_SCROLL_LOCK_MS : 0,
    );
    centerTimelineStep(container, step, behavior);

    const raf = requestAnimationFrame(() => {
      if (!isDraggingRef.current) {
        centerTimelineStep(container, step, behavior);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [activeStep, visible]);

  const stepVisuals = useMemo(
    () =>
      [
        <StepUploadVisual
          key="upload"
          items={items}
          label={uploadProgressLabel}
          completeLabel={uploadCompleteLabel}
        />,
        <StepAiVisual
          key="ai"
          label={processingLabel}
          completeLabel={processingCompleteLabel}
        />,
        <StepPhotosVisual
          key="photos"
          items={items}
          label={extractProgressLabel}
          completeLabel={extractCompleteLabel}
        />,
        <StepQrVisual key="qr" downloadLabel={qrDownloadLabel} />,
        <StepScanVisual key="scan" scanToOrderLabel={scanToOrderLabel} />,
        <StepLiveVisual
          key="live"
          liveBadgeLabel={liveBadgeLabel}
          newOrderLabel={newOrderLabel}
          notificationLabel={notificationLabel}
          tableLabel={tableLabel}
          statusNewLabel={statusNewLabel}
          orderItemsLabel={orderItemsLabel}
          orderItemName={items[0]?.name ?? ""}
          orderItemPrice={items[0]?.price ?? ""}
        />,
      ].slice(0, stepCount),
    [
      items,
      uploadProgressLabel,
      uploadCompleteLabel,
      processingLabel,
      processingCompleteLabel,
      extractProgressLabel,
      extractCompleteLabel,
      qrDownloadLabel,
      scanToOrderLabel,
      liveBadgeLabel,
      newOrderLabel,
      notificationLabel,
      tableLabel,
      statusNewLabel,
      orderItemsLabel,
      stepCount,
    ],
  );

  const renderStep = (
    step: MenuImportStep,
    index: number,
    stepRef?: (node: HTMLElement | null) => void,
  ) => (
    <StoryStep
      key={`timeline-${step.title}`}
      step={step}
      index={index}
      active={activeStep >= index + 1}
      current={activeStep === index + 1}
      isFinale={index === stepCount - 1}
      stepRef={stepRef}
    >
      {stepVisuals[index]}
    </StoryStep>
  );

  return (
    <MenuImportActiveStepContext.Provider value={activeStep}>
    <div
      ref={rootRef}
      className={cn("w-full", visible && "menu-import-story-visible")}
      style={{ overflowAnchor: "none" }}
    >
      <div
        className={cn(
          "menu-import-story-panel relative rounded-[1.25rem] border border-slate-200/55 bg-white px-4 py-4 sm:rounded-[1.4rem] sm:px-6 sm:py-5 lg:px-7 lg:py-6",
          "shadow-[0_2px_20px_-6px_rgba(15,23,42,0.06),0_16px_48px_-20px_rgba(124,58,237,0.11)]",
          "dark:border-slate-800/60 dark:bg-[#0d1117]/95",
        )}
      >
        <div
          aria-hidden
          className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100 lg:mb-4 lg:h-px dark:bg-slate-800/80"
        >
          <div
            className={cn(
              "menu-import-global-progress relative h-full rounded-full bg-gradient-to-r from-purple-400/80 via-violet-500/90 to-purple-400/80 rtl:bg-gradient-to-l lg:h-px",
              "transition-[width] duration-700 ease-[var(--menu-import-scroll-ease,linear)]",
              isProcessingStep && "menu-import-global-progress--active",
            )}
            style={{
              width: `${globalProgressWidth}%`,
              transitionTimingFunction: SCROLL_EASE,
            }}
          >
            {isProcessingStep && (
              <span
                aria-hidden
                className="menu-import-progress-sheen pointer-events-none absolute inset-0 rounded-full"
              />
            )}
          </div>
        </div>

        <div className="mb-2.5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goToPrevStep}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 transition-colors hover:border-purple-200 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-500/30 dark:hover:text-purple-400"
            aria-label="Previous step"
          >
            <FiChevronLeft size={16} className="rtl:rotate-180" />
          </button>

          <div
            className="flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Menu import steps"
          >
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = activeStep === stepNumber;
              const isComplete = activeStep > stepNumber;

              return (
                <button
                  key={step.title}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`${step.title}${isComplete ? ", completed" : isCurrent ? ", current" : ""}`}
                  onClick={() => goToStep(stepNumber)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isCurrent
                      ? "w-6 bg-purple-500"
                      : isComplete
                        ? "w-2 bg-purple-300 hover:bg-purple-400 dark:bg-purple-500/50"
                        : "w-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600",
                  )}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={goToNextStep}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 transition-colors hover:border-purple-200 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-500/30 dark:hover:text-purple-400"
            aria-label="Next step"
          >
            <FiChevronRight size={16} className="rtl:rotate-180" />
          </button>
        </div>

        <div className="menu-import-story-timeline relative mx-auto w-full max-w-[min(100%,72rem)] overflow-hidden">
          <div
            aria-hidden
            className="menu-import-timeline-fade menu-import-timeline-fade--start"
          />
          <div
            aria-hidden
            className="menu-import-timeline-fade menu-import-timeline-fade--end"
          />
          <div
            ref={timelineRef}
            className="menu-import-steps-timeline flex flex-nowrap items-stretch overflow-x-auto overflow-y-visible overscroll-x-contain py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {steps.map((step, index) => (
              <Fragment key={`flow-${step.title}`}>
                {renderStep(step, index, (node) => {
                  stepRefs.current[index] = node;
                })}
                {index < steps.length - 1 && (
                  <StepFlowConnector
                    active={activeStep > index + 1}
                    flowing={activeStep === index + 2}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {showHighlights && highlights.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3 lg:mt-5 lg:grid-cols-4">
          {highlights.map((item, i) => {
            const Icon = HIGHLIGHT_ICONS[item.icon];
            return (
              <div
                key={item.text}
                className="menu-import-highlight flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-white/90 px-3 py-2.5 text-start shadow-[0_1px_8px_-4px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200/70 hover:bg-purple-50/25 hover:shadow-[0_6px_20px_-10px_rgba(124,58,237,0.14)] dark:border-slate-800/55 dark:bg-slate-900/20 dark:hover:border-purple-500/20 dark:hover:bg-purple-500/5 sm:px-3.5 sm:py-3"
                style={{ animationDelay: `${i * 90 + 350}ms` }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50/90 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <Icon size={17} strokeWidth={2} />
                </span>
                <p className="text-[11px] font-medium leading-snug text-slate-700 dark:text-slate-300 sm:text-xs">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </MenuImportActiveStepContext.Provider>
  );
}
