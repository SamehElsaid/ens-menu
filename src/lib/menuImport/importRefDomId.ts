export function importRefDomId(refId: string): string {
  return `import-ref-${refId}`;
}

export function focusFirstMissingField(container: HTMLElement): void {
  const missing = container.querySelector<HTMLElement>(
    "input.border-amber-400, textarea.border-amber-400",
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

      el.classList.add(
        "ring-2",
        "ring-primary",
        "ring-offset-2",
        "rounded-2xl",
      );
      window.setTimeout(() => {
        el.classList.remove(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
          "rounded-2xl",
        );
      }, 2000);
    }, 80);
  });
}
