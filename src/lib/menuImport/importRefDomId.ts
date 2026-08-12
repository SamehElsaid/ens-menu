export function importRefDomId(refId: string): string {
  return `import-ref-${refId}`;
}

export function focusFirstMissingField(container: HTMLElement): void {
  // Keyed off `aria-invalid` rather than the field's classes: the review rows
  // mark incomplete values there anyway, and a selector written against
  // styling silently stops matching the next time the styling changes.
  const missing = container.querySelector<HTMLElement>(
    'input[aria-invalid="true"], textarea[aria-invalid="true"]',
  );
  if (missing) {
    missing.focus({ preventScroll: true });
    return;
  }
  container.querySelector<HTMLElement>("input, textarea")?.focus({
    preventScroll: true,
  });
}

export function scrollToImportRef(
  refId: string,
  options?: { focusMissing?: boolean },
): void {
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      const el = document.getElementById(importRefDomId(refId));
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (options?.focusMissing) focusFirstMissingField(el);

      const highlight = [
        "ring-2",
        "ring-accent",
        "ring-offset-2",
        "rounded-lg",
      ];
      el.classList.add(...highlight);
      window.setTimeout(() => {
        el.classList.remove(...highlight);
      }, 2000);
    }, 80);
  });
}
