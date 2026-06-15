/** RTL-safe horizontal scroll helpers (Chrome negative scrollLeft, Firefox inverted, etc.). */

type RtlScrollType = "negative" | "reverse";

let globalRtlScrollType: RtlScrollType | null = null;

export function isRtlElement(el: HTMLElement): boolean {
  return getComputedStyle(el).direction === "rtl";
}

export function getMaxScroll(el: HTMLElement): number {
  return Math.max(0, el.scrollWidth - el.clientWidth);
}

/** Detect once per browser — not per element or scroll position. */
function getGlobalRtlScrollType(): RtlScrollType {
  if (globalRtlScrollType) return globalRtlScrollType;
  if (typeof document === "undefined") return "negative";

  const probe = document.createElement("div");
  probe.style.cssText =
    "width:4px;height:1px;overflow:scroll;direction:rtl;position:absolute;top:-9999px;visibility:hidden;";
  probe.innerHTML = "<div style='width:8px;height:1px'></div>";
  document.body.appendChild(probe);

  if (probe.scrollLeft > 0) {
    globalRtlScrollType = "reverse";
  } else {
    probe.scrollLeft = 1;
    globalRtlScrollType = probe.scrollLeft === 0 ? "negative" : "reverse";
  }

  document.body.removeChild(probe);
  return globalRtlScrollType;
}

/**
 * Move a scroll container by screen-space pixels (from getBoundingClientRect).
 * Works in LTR and RTL without normalizing scrollLeft.
 */
export function scrollContainerByPhysicalDelta(
  el: HTMLElement,
  deltaX: number,
  behavior: ScrollBehavior = "auto",
): void {
  if (Math.abs(deltaX) < 0.5) return;
  el.scrollTo({ left: el.scrollLeft + deltaX, behavior });
}

/** Center a child inside a horizontal scroll container. */
export function centerElementInScroller(
  container: HTMLElement,
  element: HTMLElement,
  behavior: ScrollBehavior = "auto",
): void {
  if (getMaxScroll(container) <= 0) return;

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const delta =
    elementRect.left +
    elementRect.width / 2 -
    (containerRect.left + containerRect.width / 2);

  scrollContainerByPhysicalDelta(container, delta, behavior);
}

/** Distance from the inline-start edge, always 0 … maxScroll regardless of direction. */
export function getNormalizedScrollLeft(el: HTMLElement): number {
  const maxScroll = getMaxScroll(el);
  if (maxScroll <= 0) return 0;

  const { scrollLeft } = el;
  if (!isRtlElement(el)) return scrollLeft;

  return getGlobalRtlScrollType() === "negative"
    ? Math.abs(scrollLeft)
    : maxScroll - scrollLeft;
}

export function setNormalizedScrollLeft(
  el: HTMLElement,
  normalizedLeft: number,
  behavior: ScrollBehavior = "auto",
): void {
  const maxScroll = getMaxScroll(el);
  if (maxScroll <= 0) return;

  const clamped = Math.max(0, Math.min(maxScroll, normalizedLeft));
  let left = clamped;

  if (isRtlElement(el)) {
    left =
      getGlobalRtlScrollType() === "negative"
        ? -clamped
        : maxScroll - clamped;
  }

  el.scrollTo({ left, behavior });
}

/** Drag delta is physical pointer movement (clientX difference). */
export function scrollByPointerDelta(
  el: HTMLElement,
  pointerDeltaX: number,
  behavior: ScrollBehavior = "auto",
): void {
  el.scrollTo({ left: el.scrollLeft - pointerDeltaX, behavior });
}
